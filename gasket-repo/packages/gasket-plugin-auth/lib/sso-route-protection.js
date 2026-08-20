/**
 * Shared helpers for route SSO authentication
 */
import { makeGasketRequest } from '@gasket/request';
import { fixupAuthOptions, getAppName } from './check-auth-helpers.js';
import { match } from 'path-to-regexp';

/**
 * Get base domain from hostname using regex pattern from gasket-auth
 * @type {import('./internal').getBaseDomain}
 */
function getBaseDomain(hostname) {
  // Default to Go Daddy for empty/null/undefined hostnames
  if (!hostname) return 'godaddy.com';

  // Remove port if present
  const domain = hostname.split(':')[0];

  // Use a simpler approach that correctly handles multi-level TLDs
  const parts = domain.split('.');

  // Handle single part domains
  if (parts.length < 2) return hostname;

  // For domains with 2 parts, return as-is
  if (parts.length === 2) return domain;

  // For domains with 3+ parts, check if the last 2 parts form a multi-level TLD
  // Common multi-level TLDs: .co.uk, .com.au, .org.uk, etc.
  const lastTwoParts = parts.slice(-2).join('.');
  const isMultiLevelTld = /^[a-z]{2,3}\.[a-z]{2}$/i.test(lastTwoParts);

  if (isMultiLevelTld) {
    // For multi-level TLDs, take the last 3 parts (base domain + multi-level TLD)
    return parts.slice(-3).join('.');
  }

  // For regular TLDs, take the last 2 parts (base domain + TLD)
  return parts.slice(-2).join('.');
}

/**
 * Checks if the given object has any enumerable properties.
 * @param {*} maybeObj - Potential object to check
 * @returns {boolean} result
 */
const hasKeys = maybeObj =>
  maybeObj && typeof maybeObj === 'object' && !Array.isArray(maybeObj) && Object.keys(maybeObj).length > 0;

/**
 * Handle route SSO authentication logic
 * @type {import('./internal').buildSsoUrl}
 */
async function buildSsoUrl(gasket, req, params, authResults) {
  const visitor = await gasket.actions.getVisitor(req);
  const { hostname } = visitor;

  const authConfig = gasket.config.auth;
  const authOptions = fixupAuthOptions(params, authConfig);

  const ssoHost = getBaseDomain(hostname);
  const ssoUrl = new URL(`https://sso.${ssoHost}/`);

  let redirectPath = req.path || '/';
  if (hasKeys(req.query)) {
    // add query params to the redirect path
    const searchParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      // skip if value is undefined or null
      if (value == null) return;

      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    });
    redirectPath += `?${searchParams.toString()}`;
  }

  ssoUrl.searchParams.append('app', getAppName(gasket, hostname));
  ssoUrl.searchParams.append('realm', authOptions.realm);
  ssoUrl.searchParams.append('path', redirectPath);
  if (authOptions.risk) ssoUrl.searchParams.append('risk', authOptions.risk);
  if (authResults.authReason) ssoUrl.searchParams.append('auth_reason', String(authResults.authReason));

  if (req.headers.host) {
    const [, port] = req.headers.host.split(':');
    if (port) {
      ssoUrl.searchParams.append('port', port);
    }
  }

  return ssoUrl.href;
}

/**
 * Route matcher for SSO authentication route patterns.
 * Uses path-to-regexp for accurate route matching with dynamic segments.
 * @type {import('./internal').RouteMatcher}
 */
class RouteMatcher {
  /**
   * Create a RouteMatcher
   * @param {string} route - route pattern
   * @param {object} config - route config
   */
  constructor(route, config) {
    this.config = config;
    this.match = match(route, { decode: decodeURIComponent });
  }
}

/**
 * Cached route matchers for performance
 * @type {Map<symbol, import('./internal').RouteMatcher[]>}
 */
const routeMatchersMap = new Map();

/**
 * Check if route authentication is required and return SSO URL if redirect needed
 * @type {import('./internal').getRouteMatchers}
 */
function getRouteMatchers(gasket) {
  if (!routeMatchersMap.has(gasket.symbol)) {
    const authRoutes = gasket.config.auth?.authRoutes || {};
    const matchers = Object.keys(authRoutes)
      .map(route => new RouteMatcher(route, authRoutes[route]));
    routeMatchersMap.set(gasket.symbol, matchers);
  }
  return routeMatchersMap.get(gasket.symbol);
}

/**
 * Check if route authentication is required and return SSO URL if redirect needed
 * @type {import('./internal').checkRouteAuth}
 */
async function checkRouteAuth(gasket, req) {
  const authRoutes = gasket.config.auth?.authRoutes;

  // Only check if auth routes are configured
  if (!authRoutes) {
    return null;
  }

  // Normalize request
  const gasketReq = await makeGasketRequest(req);

  // Get or make route matchers
  const routeMatchers = getRouteMatchers(gasket);

  // Find matching route configuration using path-to-regexp for accurate matching
  const routeMatch = routeMatchers.find((matcher) => matcher.match(gasketReq.path));

  if (!routeMatch) {
    return null;
  }

  const { params = {} } = routeMatch.config;

  // Resolve the effective realm (route params override the auth config default)
  // so we know whether a browser SSO redirect is appropriate.
  const { realm } = fixupAuthOptions(params, gasket.config.auth);

  const checkAuth = await gasket.actions.getCheckAuth(gasketReq);
  const authResults = await checkAuth(params);

  if (!authResults.valid) {
    // The oauth realm serves machine-to-machine clients; an SSO browser
    // redirect is meaningless there, so signal a 401 instead.
    if (realm === 'oauth') {
      gasket.logger.debug('OAuth route auth failed; returning 401');
      return { unauthorized: true };
    }

    const ssoUrl = await buildSsoUrl(gasket, gasketReq, params, authResults);
    gasket.logger.debug('Redirecting to SSO: ' + ssoUrl);
    return ssoUrl;
  }

  return null;
}

export {
  getBaseDomain,
  checkRouteAuth
};
