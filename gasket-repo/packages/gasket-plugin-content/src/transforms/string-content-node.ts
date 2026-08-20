import { ContentNode, ContentNodeChildren } from '@godaddy/gasket-content-nodes';
import { parse } from 'node-html-parser';

export const reactFragment = 'Fragment';

interface ParsedHtmlNode {
  nodeType: number;
  rawTagName?: string;
  childNodes: ParsedHtmlNode[];
  attributes?: object;
  rawText?: string;
}

export function getNodeAttributes(attributes: object | undefined): object | null {
  return attributes && Object.keys(attributes).length ? attributes : null;
}

export function createContentNode(node: ParsedHtmlNode): string | ContentNode {
  const tagName = (node?.rawTagName ?? '') || reactFragment;
  const children = node.childNodes;
  const attributes = getNodeAttributes(node.attributes);
  return children?.length ? [tagName, attributes, createContentNodeChildren(children)] : [tagName, attributes];
}

export function handleTextNode(node: ParsedHtmlNode): string | ContentNode {
  // Remove React fragment shorthand tags
  return (node.rawText ?? '').replace(/<>|<\/>/g, '');
}

export function isTextNode(node: ParsedHtmlNode): boolean {
  return node.nodeType === 3;
}

export function createContentNodeChildren(childrenNodes: ParsedHtmlNode[]): ContentNodeChildren {
  return childrenNodes.map(node => {
    return isTextNode(node) ? handleTextNode(node) : createContentNode(node);
  });
}

export function transformStringContentNode(part:string): string | ContentNode  {
  const root = parse(part);
  if (!root?.childNodes) return part;
  return [reactFragment, null, createContentNodeChildren(root.childNodes)];
}
