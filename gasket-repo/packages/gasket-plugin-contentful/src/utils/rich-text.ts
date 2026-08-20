import type {
  ContentNode,
  ContentNodeVisitors,
  StopTraversal
} from '@godaddy/gasket-content-nodes';

import {
  transform,
  isContentNode,
  PartType
} from '@godaddy/gasket-content-nodes';

import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { ComponentProps } from '@godaddy/gasket-content-nodes';
import type { RichTextNodeTypeMap } from '../types.js';
import { Logger } from '@gasket/plugin-logger';

export function isRichText(obj: any): boolean {
  return obj && typeof obj === 'object' && 'data' in obj && 'nodeType' in obj && ('content' in obj || 'value' in obj);
}

type ContentNodeChild = ContentNode | string | undefined;
const Fragment = 'Fragment';
const p = 'p';
const hr = 'hr';
const li = 'li';

const brNode: ContentNode = ['br', null];

const defaultRichTextNodeTypeMap: RichTextNodeTypeMap = {
  [BLOCKS.DOCUMENT]: 'Fragment',
  [BLOCKS.PARAGRAPH]: 'p',
  [BLOCKS.HEADING_1]: 'h1',
  [BLOCKS.HEADING_2]: 'h2',
  [BLOCKS.HEADING_3]: 'h3',
  [BLOCKS.HEADING_4]: 'h4',
  [BLOCKS.HEADING_5]: 'h5',
  [BLOCKS.HEADING_6]: 'h6',
  [BLOCKS.UL_LIST]: 'ul',
  [BLOCKS.OL_LIST]: 'ol',
  [BLOCKS.LIST_ITEM]: 'li',
  [BLOCKS.QUOTE]: 'blockquote',
  [BLOCKS.HR]: 'hr',
  [BLOCKS.TABLE]: 'table',
  [BLOCKS.TABLE_ROW]: 'tr',
  [BLOCKS.TABLE_CELL]: 'td',
  [BLOCKS.EMBEDDED_ASSET]: 'p',
  [BLOCKS.EMBEDDED_ENTRY]: (part) => ['p', null, [part.data.target]],
  [INLINES.EMBEDDED_ENTRY]: (part) => part.data.target,
  [INLINES.HYPERLINK]: 'a',
  [INLINES.ENTRY_HYPERLINK]: (part) => ['a', { href: part.data.target }, part.content],
  [INLINES.ASSET_HYPERLINK]: (part) => {
    // If node-type was not mapped
    let href = part.data.target.file?.url;

    // Maybe asset was mapped to content node
    if (!href && isContentNode(part.data.target)) {
      const [name, props] = part.data.target;
      if (name === 'Asset') {
        href = props?.file?.url;
      }
    }

    // Fallback to target as href for further transforms
    if (!href) {
      href = part.data.target;
    }

    return ['a', { href }, part.content];
  },
  [MARKS.BOLD]: 'strong',
  [MARKS.ITALIC]: 'em',
  [MARKS.UNDERLINE]: 'u',
  [MARKS.CODE]: (part) => ['pre', null, [['code', null, part.content]]],
  [MARKS.SUPERSCRIPT]: 'sup',
  [MARKS.SUBSCRIPT]: 'sub'
};

const dataMap: Record<string, string> = {
  uri: 'href'
};

function dataToProps(data: Record<string, any>) {
  const keys = Object.keys(data);
  if (!keys.length) return null;

  return keys.reduce((acc, cur) => {
    const key = dataMap[cur] ?? cur;
    acc[key] = data[cur];
    return acc;
  }, {} as Record<string, any>);
}

const newLineVisitors: ContentNodeVisitors = {
  [PartType.childString]: function (part, stopTraversal: StopTraversal) {
    if (part.includes('\n')) {
      const children = part
        .split('\n')
        .reduce((acc, cur, idx) => {
          if (idx) acc.push(brNode);
          acc.push(cur);
          return acc;
        }, [] as Array<ContentNode | string>);

      stopTraversal();
      return [Fragment, null, children];
    }
    return part;
  }
};

/**
 * Split all child strings with newlines into fragments using <br/> tags
 * @param contentNode - The content node to transform.
 * @returns The transformed content node.
 */
function transformNewLines(contentNode: ContentNode) {
  return transform(contentNode, newLineVisitors);
}

/**
 * Process a part with marks by correcting part structure and recursing on children.
 * @param part - The part to process.
 * @param appRichTextNodeMap - The custom node type map.
 * @param logger - The logger instance.
 * @returns The processed content node.
 */
function processPartWithMarks(part:any, appRichTextNodeMap: RichTextNodeTypeMap = defaultRichTextNodeTypeMap, logger: Logger) {
  const remainingMarks = [...part.marks];
  const outerMark = remainingMarks.shift();

  const innerChildren = prepareRichText({ ...part, marks: remainingMarks, data: {} }, appRichTextNodeMap, logger);

  const outerPart = { nodeType: outerMark.type, data: part.data, marks: [], content: [innerChildren] };
  return prepareRichText(outerPart, appRichTextNodeMap, logger);
}

function formatParagraph(contentNode: ContentNode): ContentNode | undefined {
  const [nodeName, props, nodeChildren] = contentNode;
  if (nodeName === p) {
    // Delete if no child content
    if (!nodeChildren?.length) return;

    // Delete paragraph nodes with empty children
    if (nodeChildren.length === 1 && !nodeChildren[0]) return;

    // If a paragraph has any preformatted rich text child, convert to div
    const hasPreformatted = nodeChildren.some(child => {
      if (isContentNode(child)) {
        const [, childProps] = child as ContentNode;
        return childProps?.preformatted;
      }
      return false;
    });

    if (hasPreformatted) {
      return ['div', { ...(props ?? {}), className: 'p' }, nodeChildren];
    }
  }

  return contentNode;
}

function formatListItem(contentNode: ContentNode): ContentNode {
  const [nodeName, props, nodeChildren] = contentNode;
  if (nodeName === li) {
    // Collapse the extra p in li nodes
    if (nodeChildren?.length === 1) {
      const child = nodeChildren[0];
      if (isContentNode(child)) {
        const [childName, , childChildren] = child as ContentNode;
        if (childName === p) {
          return transformNewLines([nodeName, props, childChildren]);
        }
      }
    }
    return transformNewLines(contentNode);
  }
  return contentNode;
}

const formatHorizontalRule = (contentNode: ContentNode): ContentNode => {
  const [nodeName] = contentNode;
  // Ensure <hr/> does not have children
  if (nodeName === hr) {
    return [hr, null];
  }

  return contentNode;
};

const formatContentNodeNewLines = (contentNode: ContentNode): ContentNode => {
  const [, , nodeChildren] = contentNode;
  if (nodeChildren?.length === 1 && typeof nodeChildren[0] === 'string' && nodeChildren[0].includes('\n')) {
    contentNode = transformNewLines(contentNode);
  }
  return contentNode;
};

/**
 * Applies post-processing to the content node, regardless of the handler used to create it.
 * - Converts p to div if it contains preformatted children
 * - Deletes empty p nodes
 * - Collapse the extra p in li nodes
 * - Converts hr to a self-closing tag
 * - Splits text nodes with newlines into fragments using br tags
 * @param contentNode - The content node to post-process
 * @returns The post-processed content node or undefined if it should be deleted
 */
function postProcessContentNodes(contentNode: ContentNodeChild): ContentNodeChild {
  const contentNodeTransformFns = [
    formatHorizontalRule,
    formatListItem,
    formatParagraph,
    formatContentNodeNewLines
  ];

  if (isContentNode(contentNode)) {
    for (const fn of contentNodeTransformFns) {
      const result = fn(contentNode);
      if (!result) return;
      contentNode = result;
    }
  }

  // Handle newlines in text nodes
  if (typeof contentNode === 'string' && contentNode.includes('\n')) {
    return transformNewLines([Fragment, null, [contentNode]]);
  }
  return contentNode;
}

/**
 * Converts a part to a rich text content node.
 * @param part - The part to convert.
 * @param nodeTypeHandler - The handler for the node type.
 * @returns The converted content node or undefined if it should be deleted.
 */
function partToRichTextContentNode(part: any, nodeTypeHandler: any): ContentNodeChild {
  const dataProps = dataToProps(part.data);
  const children = part.value ? [part.value] : part.content;
  if (!children) return;

  let name:string = 'span';
  let handlerProps: ComponentProps = null;

  if (typeof nodeTypeHandler === 'string') {
    name = nodeTypeHandler;
  } else if (isContentNode(nodeTypeHandler)) {
    [name, handlerProps] = nodeTypeHandler;
  }

  const mergedProps = handlerProps ? { ...handlerProps, ...dataProps } : dataProps;

  let contentNode: ContentNode | string;
  if (part.nodeType === 'text' && mergedProps == null && children.length === 1) {
    contentNode = children[0];
  } else {
    contentNode = [name, mergedProps, children];
  }

  return contentNode;
}

/**
 * Prepares a rich text part for rendering.
 * @param part - The part to prepare.
 * @param appRichTextNodeMap - The custom node type map.
 * @param logger - The logger instance.
 * @returns The prepared content node or undefined if it should be deleted.
 */
export function prepareRichText(
  part: any,
  appRichTextNodeMap: RichTextNodeTypeMap = {},
  logger: Logger
): ContentNodeChild {
  let nodeTypeHandler = appRichTextNodeMap[part.nodeType] ?? defaultRichTextNodeTypeMap[part.nodeType];

  if (!nodeTypeHandler) {
    nodeTypeHandler = part.nodeType;
  }

  if (typeof nodeTypeHandler === 'function') {
    return nodeTypeHandler(part);
  }

  if (part.marks?.length) {
    return processPartWithMarks(part, appRichTextNodeMap, logger);
  }

  const contentNode: ContentNodeChild = partToRichTextContentNode(part, nodeTypeHandler);

  return postProcessContentNodes(contentNode);
}
