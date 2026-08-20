import isAbsoluteURL from './is-absolute-url.js';
import type { NavigationItemProps } from './types.js';

const bareUrlRegExp = /^([^?#]*)/;

/**
 * Non-exact active check function for header nav
 */
export default function nonExactActiveCheck({ href }: NavigationItemProps, currentURL: string): boolean {
  const match = bareUrlRegExp.exec(currentURL);
  const bareURL = match ? match[1] : '';

  return Boolean(href && !isAbsoluteURL(href) && href === bareURL);
}
