import { ContentNode, PartType, StopTraversal, transform } from '@godaddy/gasket-content-nodes';
import { transformStringContentNode } from './string-content-node.js';
import type { ContentTransformHandler } from '../types.js';

/*
 * Check if string includes html tags
 */
export function hasTags(value: string): boolean {
  return /<\w.+>/.test(value);
}

/*
 * If Html is detected transform to a ContentNode
 */
export function htmlStringHandler(part: string, stopTraversal: StopTraversal): string | ContentNode {
  if (!hasTags(part)) {
    return part;
  }

  stopTraversal();

  return transformStringContentNode(part);
}

const htmlVisitors = {
  [PartType.childString]: htmlStringHandler,
  [PartType.stringValue]: htmlStringHandler
};

const handler: ContentTransformHandler = (_gasket, contentNodes) => {
  if (!contentNodes) return contentNodes;
  return transform(contentNodes, htmlVisitors);
};

export const transformHtmlStrings = { name: 'html-strings', handler };
