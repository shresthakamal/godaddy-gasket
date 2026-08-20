import { ContentNode, PartType, StopTraversal, transform } from '@godaddy/gasket-content-nodes';
import type { ContentTransformHandler } from '../types.js';

/*
 * Check if string includes encoding
 * Example: &#39; or &quot; or &lt; or &gt; or &amp;
 */
export function hasEncoding(value: string): boolean {
  return /&#?\w+;/.test(value);
}

/*
 * If encoding is detected put encoded content in a ContendNode wrapper
 */
export function encodedStringHandler(part: string, stopTraversal: StopTraversal): string | ContentNode {
  if (!hasEncoding(part)) {
    return part;
  }

  stopTraversal();

  return ['HtmlWrapper', { html: part }];
}

const encodedVisitors = {
  [PartType.childString]: encodedStringHandler,
  [PartType.stringValue]: encodedStringHandler
};

const handler: ContentTransformHandler = (_gasket, contentNodes) => {
  if (!contentNodes) return contentNodes;
  return transform(contentNodes, encodedVisitors);
};

export const transformEncodedStrings = { name: 'encoded-strings', handler };
