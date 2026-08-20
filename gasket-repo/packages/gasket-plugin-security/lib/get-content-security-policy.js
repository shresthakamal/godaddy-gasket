import { getDefaultDirectives, createHash, createNonce } from './utils.js';

/**
 * Get default CSP directives for a hostname and execute contentSecurityPolicy
 * lifecycle for plugins to hook and modify.
 * @type {import('.').getContentSecurityPolicy}
 */
export default async function getContentSecurityPolicy(gasket, { req, res }) {
  const directives = getDefaultDirectives(req.hostname);

  gasket.logger.warn(
    'contentSecurityPolicy lifecycle is deprecated and will be removed in a future version. ' +
    'Consider using helmet\'s built-in CSP configuration directly.'
  );

  return await gasket.execWaterfall('contentSecurityPolicy', directives, { req, res }, { createHash, createNonce });
}
