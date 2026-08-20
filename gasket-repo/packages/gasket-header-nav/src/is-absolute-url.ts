const absoluteRegexp = /^(?:https?:)?\/\//i;

/**
 * Check if a URL is absolute
 */
function isAbsoluteURL(url: string): boolean {
  return Boolean(url && absoluteRegexp.test(url));
}

export default isAbsoluteURL;
