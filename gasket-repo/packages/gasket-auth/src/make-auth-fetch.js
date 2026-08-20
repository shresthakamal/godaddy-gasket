import fetch from '@gasket/fetch';
import ClientHandler from './client-handler.js';
import { redirectTo } from './utils.js';

/**
 * Create a client-side fetch wrapper bound to the given authProps. On a 401 it
 * redirects to the SSO Login Page using a URL derived from those props (realm,
 * risk, ssoRedirectOverride, ssoRedirectSubdomain). This lets internal apps
 * redirect to the correct realm (e.g. `jomax`) instead of always defaulting to
 * idp. The redirect URL is built by ClientHandler.getRedirectUrl under the
 * hood, matching the component/HOC auth flow.
 * @type {import('.').makeAuthFetch}
 */
export function makeAuthFetch(authProps = {}) {
  const handler = new ClientHandler({ authProps });

  return function authFetch(url, opts = {}) {
    return fetch(url, opts).then((response) => {
      if (response.status === 401 && typeof window !== 'undefined' && window.document) {
        // No validated authState is available for a raw API 401, so pass an
        // empty state. getRedirectUrl still applies realm/override from
        // authProps; auth_reason is simply omitted.
        const ssoLogin = handler.getRedirectUrl({});

        if (ssoLogin) redirectTo(ssoLogin);
        // Reflect whether we actually navigated: getRedirectUrl returns
        // undefined for the alt/SSR case, where no redirect occurs.
        response.ssoRedirect = Boolean(ssoLogin);
      }

      return response;
    });
  };
}

/**
 * Client-side fetch wrapper that auto-redirects to the SSO Login Page (default
 * idp realm) if unauthorized. Equivalent to `makeAuthFetch()` with no config.
 * @type {import('.').authFetch}
 */
export const authFetch = makeAuthFetch();
