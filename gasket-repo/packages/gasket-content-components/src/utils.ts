import { isObject } from './type-utils.js';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

// Safely format a string for regex pattern
// @see: https://www.npmjs.com/package/escape-string-regexp
export function safeRegExpStr(str: string): string {
  return str.replace(matchOperatorsRe, '\\$&');
}

export function pickDefined(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (typeof value !== 'undefined') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

export function deepLookup<T>(name: string, obj: Record<string, any>): T | undefined {
  const parts = name.split('.');
  let last: Record<string, any> = obj;

  for (let i = 0; i <= parts.length; i++) {
    const key = parts[i];
    if (!key) {
      return last as T;
    } else if (isObject(last) && key in last) {
      last = last[key];
    } else {
      return;
    }
  }
}
