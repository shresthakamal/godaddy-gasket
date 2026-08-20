import isAbsoluteURL from './is-absolute-url.js';
import type { NavigationItemProps } from './types.js';

/**
 * Default active check function for header nav
 */
function defaultActiveCheck({ href }: NavigationItemProps, currentURL: string): boolean {
  const baseUrl = currentURL?.split(/\?plid=[^&]*$/)[0];

  return Boolean(href && !isAbsoluteURL(href) && baseUrl === href);
}

export default defaultActiveCheck;
