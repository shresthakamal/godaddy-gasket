/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="@gasket/plugin-middleware" />

import helmet from 'helmet';
import getContentSecurityPolicy from './get-content-security-policy.js';

/**
 * Attach an addCspHash method to the response for adding hash directives
 * @param {import('@gasket/core').Gasket} gasket - gasket object
 * @param {import('http').ServerResponse} res - Response object
 */
function attachAddCspHash(gasket, res) {
  /**
   * Creates a CSP hash for each of the content and adds those hashes in the CSP directives for the given type
   * @param {string} type - Directive type (i.e. script-src)
   * @param {...string} contents - Inline content to hash
   */
  res.addCspHash = function addCspHash(type, ...contents) {
    gasket.actions.addCspHash(res, type, ...contents);
  };
}

/**
 * Attach an insertCspHash method to the response for adding CSP hash directives
 * @param {import('@gasket/core').Gasket} gasket - gasket object
 * @param {import('http').ServerResponse} res - Response object
 */
function attachInsertCspHash(gasket, res) {
  /**
   * Accepts a type and a CSP hash value and inserts the CSP Hash value for the given type in the CSP header
   * @param {string} type - Directive type (i.e. script-src)
   * @param {string} cspHash - CSP hash to be inserted into the directive type
   */
  res.insertCspHash = function insertCspHash(type, cspHash) {
    gasket.actions.insertCspHash(res, type, cspHash);
  };
}

/**
 * Attach an addCspNonce method to the response for adding nonce directives
 * @param {import('@gasket/core').Gasket} gasket - gasket object
 * @param {import('http').ServerResponse} res - Response object
 */
function attachAddCspNonce(gasket, res) {
  /**
   * Add nonce to content security policy for directive type
   * @param {string} type - Directive type (i.e. script-src)
   * @returns {string|void} nonce id if set
   */
  res.addCspNonce = function addCspNonce(type = 'script-src') {
    gasket.actions.addCspNonce(res, type);
  };
}

/** @type {import('@gasket/core').HookHandler<'middleware'>} */
function middlewareHook(gasket) {
  const { helmet: helmetConfig = {} } = gasket.config;
  if (helmetConfig === false) return;

  const cspConfig = helmetConfig.contentSecurityPolicy;
  gasket.logger.info(
    'ContentSecurityPolicy is disabled for `gasket local`.'
  );

  return async function helmetWrapper(req, res, next) {
    let contentSecurityPolicy;
    // Disable CSP if explicitly set to false or not configured
    if (cspConfig === false || !cspConfig) {
      contentSecurityPolicy = false;
    // Use default directives if enabled flag is set to true
    } else if (cspConfig?.enabled === true) {
      gasket.logger.warn(
        'Content Security Policy (CSP) tooling in @godaddy/gasket-plugin-security is deprecated and will be removed in a future version. ' +
        'Consider using helmet\'s built-in CSP configuration directly.'
      );
      const directives = await getContentSecurityPolicy(gasket, { req, res });
      contentSecurityPolicy = { directives };
    // Otherwise use the provided CSP config directly (allows full helmet CSP config)
    } else {
      contentSecurityPolicy = cspConfig;
    }

    if (contentSecurityPolicy !== false) {
      attachAddCspHash(gasket, res);
      attachInsertCspHash(gasket, res);
      attachAddCspNonce(gasket, res);
    }

    let options = { ...helmetConfig, contentSecurityPolicy };
    options = await gasket.execWaterfall('helmet', options, { req, res });
    // @ts-ignore - helmet typings getting confused
    helmet(options)(req, res, next);
  };
}

export default {
  timing: {
    after: ['@godaddy/uxp']
  },
  handler: middlewareHook
};
