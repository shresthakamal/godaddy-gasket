import {
  isArray,
  isContentNode,
  isContentNodeChildren,
  isDefined,
  isNull,
  isObject,
  isString
} from './type-utils.js';

import {
  ComponentName,
  ComponentProps,
  ContentNode,
  ContentNodeChildren
} from './types.js';

export enum PartType {
  node = 'node',
  name = 'name',
  props = 'props',
  children = 'children',
  childString = 'childString',
  stringValue = 'stringValue',
  unknownValue = 'unknownValue'
}

export type StopTraversal = () => void
export type TraversalDelegate = (part: any, partType: PartType, stop: StopTraversal) => any
export type ReverseTraversalDelegate = (part: any, partType: PartType) => any
export type TransformNodesDelegate = (part: ContentNode) => ContentNode | string | undefined
type VisitHandler<T> = (part: T, stopTraversal: StopTraversal) => T
type MorphVisitHandler<T, V> = (part: T, stopTraversal: StopTraversal) => T | V

export interface ContentNodeVisitors {
  [PartType.node]?: VisitHandler<ContentNode> | VisitHandler<ContentNode | undefined>,
  [PartType.name]?: VisitHandler<ComponentName>,
  [PartType.props]?: VisitHandler<ComponentProps>,
  [PartType.stringValue]?: MorphVisitHandler<string, string | ContentNode | ContentNodeChildren>,
  [PartType.unknownValue]?: VisitHandler<any>,
  [PartType.childString]?: MorphVisitHandler<string, string | ContentNode>,
  [PartType.children]?: VisitHandler<ContentNodeChildren>
}

// eslint-disable-next-line max-statements, complexity
export function determinePartType(part: any, parentPartType: PartType) {
  if (isArray(part)) {
    if (isContentNode(part)) {
      return PartType.node;
    }
    if (parentPartType === PartType.unknownValue) {
      if (isContentNodeChildren(part)) {
        return PartType.children;
      }
      return parentPartType;
    }
    if (parentPartType === PartType.node) {
      return PartType.children;
    }
  }

  if (isNull(part)) {
    if (parentPartType === PartType.node) {
      return PartType.props;
    }
  }

  if (isString(part)) {
    if (parentPartType === PartType.children) {
      return PartType.childString;
    }
    if (parentPartType === PartType.node) {
      return PartType.name;
    }
    return PartType.stringValue;
  }

  if (isObject(part)) {
    if (parentPartType === PartType.node) {
      return PartType.props;
    }
  }

  return PartType.unknownValue;
}

/*
 * Walks a content node tree, allowing parts to be adjusted
 */
export function traverse(
  part: any,
  delegate: TraversalDelegate,
  parentPartType: PartType = PartType.node
): any {
  const nextType = determinePartType(part, parentPartType);
  let stopped = false;

  const stopTraversal = () => {
    stopped = true;
  };

  const nextValue = delegate(part, nextType, stopTraversal);
  if (stopped) return nextValue;

  if (isArray(nextValue)) {
    if (isString(part)) {
      // if a string was split into array, immediately traverse results
      return traverse(nextValue, delegate, PartType.unknownValue);
    }
    const arr = nextValue.map((o: any) => traverse(o, delegate, nextType));
    return nextType === PartType.children ? arr.filter((v: any) => isDefined(v)) : arr;
  }

  if (!isObject(nextValue)) {
    return nextValue;
  }

  return Object.keys(nextValue)
    .reduce((acc, k) => {
      const v = traverse((nextValue as Record<string, any>)[k], delegate, PartType.unknownValue);
      if (isDefined(v)) {
        acc[k] = v;
      }
      return acc;
    }, {} as Record<string, any>);
}

/*
 * Walks a content node tree, allowing parts to be adjusted beginning from leafs
 */
export function reverseTraverse(
  part: any,
  delegate: ReverseTraversalDelegate,
  parentPartType: PartType = PartType.node
): any {
  const nextType = determinePartType(part, parentPartType);

  let nextValue = part;
  if (isArray(part)) {
    const arr = part.map((o: any) => reverseTraverse(o, delegate, nextType));
    nextValue = nextType === PartType.children ? arr.filter((v: any) => isDefined(v)) : arr;
  }

  if (isObject(part)) {
    nextValue = Object.keys(part)
      .reduce((acc, k) => {
        const v = reverseTraverse(nextValue[k], delegate, PartType.unknownValue);
        if (isDefined(v)) {
          acc[k] = v;
        }
        return acc;
      }, {} as Record<string, any>);
  }

  return delegate(nextValue, nextType);
}

/*
 * Walks a content node tree, allowing parts to be adjusted beginning from leafs asynchronously
 */
export async function reverseTraverseAsync(
  part: any,
  delegate: ReverseTraversalDelegate,
  parentPartType: PartType = PartType.node
): Promise<any> {
  const nextType = determinePartType(part, parentPartType);

  let nextValue = part;
  if (isArray(part)) {
    const results  = await Promise.allSettled(part.map((o: any) => reverseTraverseAsync(o, delegate, nextType)));
    const arr = results.map(result => {
      if (result.status === 'fulfilled') return result.value;
    });
    nextValue = nextType === PartType.children ? arr.filter((v: any) => isDefined(v)) : arr;
  }

  if (isObject(part)) {
    nextValue = await Object.keys(part)
      .reduce(async (accPromise, k) => {
        const acc = await accPromise;
        const v = await reverseTraverseAsync((part as Record<string, any>)[k], delegate, PartType.unknownValue);
        if (isDefined(v)) {
          acc[k] = v;
        }
        return acc;
      }, Promise.resolve({} as Record<string, any>));
  }

  return await delegate(nextValue, nextType);
}

export function transform(
  part: ContentNode | ContentNode[],
  visitors: ContentNodeVisitors
) {
  function delegate(aPart: any, aPartType: PartType, stopFn: StopTraversal) {
    const partVisitor = visitors[aPartType];
    if (partVisitor) {
      return partVisitor(aPart, stopFn);
    }
    return aPart;
  }

  return traverse(part, delegate, PartType.node);
}

export function cleanChildren(contentNode: ContentNode): ContentNode {
  const [name, props, children] = contentNode;
  if (contentNode.length === 3 &&
    (typeof children === 'undefined' || children.length === 0)
  ) return [name, props];
  return contentNode;
}

export async function reverseTransformNodesAsync(
  contentNode: ContentNode,
  componentName: ComponentName,
  delegate: TransformNodesDelegate
): Promise<ContentNode | string | undefined> {
  function reverseDelegate(aPart: any, aPartType: PartType) {
    if (aPartType === PartType.node) {
      const [name] = aPart;
      if (name === componentName) {
        return delegate(aPart);
      }
    }
    return aPart;
  }

  return await reverseTraverseAsync(contentNode, reverseDelegate);
}
