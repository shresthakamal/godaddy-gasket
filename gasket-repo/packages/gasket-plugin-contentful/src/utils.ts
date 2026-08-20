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

export function safeJSONParse(maybeJson: string) {
  try {
    return JSON.parse(maybeJson);
  } catch (err) {
    return maybeJson;
  }
}
