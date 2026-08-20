import crypto from 'crypto';

export function sortObject(object: Record<string, any>): Record<string, any> {
  return Object.keys(object).sort().reduce((sorted, key) => {
    const value = object[key];
    sorted[key] = (value && typeof value === 'object' && !Array.isArray(value)) ? sortObject(value) : value;
    return sorted;
  }, {} as Record<string, any>);
}

export function getCacheKey(obj: Record<string, any>): string {
  const hash = crypto.createHash('sha1');
  const sorted = sortObject(obj);
  hash.update(JSON.stringify(sorted));
  return hash.digest('hex');
}
