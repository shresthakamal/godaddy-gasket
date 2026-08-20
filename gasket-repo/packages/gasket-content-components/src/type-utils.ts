export const isArray = (v: any) => Array.isArray(v);

export const isObject = (v: any) => v && typeof v === 'object' && !isArray(v) || false;

export const isString = (v: any) => typeof v === 'string';

export const isBrowser = () => typeof window !== 'undefined';
