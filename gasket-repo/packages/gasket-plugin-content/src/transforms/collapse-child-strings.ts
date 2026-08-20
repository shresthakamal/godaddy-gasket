import type { ContentTransformHandler } from '../types.js';
import { reverseTraverse, PartType } from '@godaddy/gasket-content-nodes';

function everyChildIsString(children: unknown[]): boolean {
  return children.every((child: unknown) => typeof child === 'string');
}

function isSingleStringChild(children: unknown[]): boolean {
  return children.length === 1 && typeof children[0] === 'string';
}

function delegate(part: any, partType: PartType): any {
  if (partType !== PartType.node) return part;

  const [name, props, children] = part;

  if (!Array.isArray(children)) return part;

  if (name === 'Fragment' && isSingleStringChild(children)) {
    return children[0];
  } else if (everyChildIsString(children)) {
    return [name, props, [children.join('')]];
  }

  return part;
}

const handler: ContentTransformHandler = (_gasket, contentNodes) => {
  if (!contentNodes) return contentNodes;
  return reverseTraverse(contentNodes, delegate);
};

export const transformCollapseChildStrings = { name: 'collapse-child-strings', handler };
