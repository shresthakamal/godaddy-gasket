import { ContentNode, ContentNodeChildren } from './types.js';

export const isArray = (v: any): v is any[] => Array.isArray(v);

export const isUndefined = (v: any) => typeof v === 'undefined';

export const isDefined = <T>(v: T | undefined): v is T => !isUndefined(v);

export const isFunction = (v: any) => typeof v === 'function';

export const isObject = (v: any): v is object => v && typeof v === 'object' && !isArray(v) || false;

export const isString = (v: any): v is string => typeof v === 'string';

export const isNull = (v: any): v is null => v == null;

export function ensureArray(maybeArray: any) {
  return isArray(maybeArray) && maybeArray || [maybeArray];
}

export function isContentNode(maybeNode: any): maybeNode is ContentNode {
  if (!isArray(maybeNode)) return false;
  const [name, props, children] = maybeNode;
  if (!isString(name)) return false;
  if (!isObject(props) && !isNull(props)) return false;
  if (maybeNode.length === 2) return true;
  if (maybeNode.length === 3 && isUndefined(children)) return true;
  if (maybeNode.length === 3 && isArray(children)) return true;
  return false;
}

export function isContentNodeOrString(maybeNode: any): maybeNode is ContentNode | string {
  if (isString(maybeNode)) return true;
  return isContentNode(maybeNode);
}

export function isContentNodeChildren(maybeNodeChildren: any): maybeNodeChildren is ContentNodeChildren {
  if (!isArray(maybeNodeChildren)) return false;
  return maybeNodeChildren.every(item => isContentNodeOrString(item));
}
