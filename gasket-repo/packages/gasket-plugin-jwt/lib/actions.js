/// <reference types="@gasket/plugin-logger" />

import fetchJwt from './fetch-jwt.js';
import NodeCache from 'node-cache';
import GdAuthManager from './gd-auth-manager.js';

// Lazy load FFI constants from types.js to avoid loading when not needed
let SecurityLevel, Auths, AuthType;
/**
 * Get FFI constants from types.js
 * @returns {Promise<object>} FFI constants
 */
async function getFFIConstants() {
  if (!SecurityLevel) {
    const types = await import('@godaddy/gd-auth-lib');
    SecurityLevel = types.SecurityLevel;
    Auths = types.Auths;
    AuthType = types.AuthType;
  }
  return { SecurityLevel, Auths, AuthType };
}

const gdAuthCache = new GdAuthManager();
const jwtCache = new NodeCache();

/** @type {import('@gasket/core').ActionHandler<'getJwt'>} */
// eslint-disable-next-line max-statements, complexity
async function getJwt(gasket, key) {
  const config = gasket.config.jwt[key];
  if (!config) {
    throw new Error(`No jwt configuration found for ${key}`);
  }

  if (jwtCache.has(key)) {
    const token = jwtCache.get(key);
    try {
      const useFFILibrary = gasket.config.auth?.useFFILibrary || false;
      const gdAuth = gdAuthCache.getGdAuthInstance(key, useFFILibrary);
      if (useFFILibrary) {
        // Use new FFI library - app config is already set, just pass auth options
        const { SecurityLevel: LoadedSecurityLevel, Auths: LoadedAuths, AuthType: LoadedAuthType } = await getFFIConstants();

        // Auth options from request/config - these are per-request parameters
        // For gd-auth-lib >= 0.13.2, use nested structure with godaddySso
        const authOptions = {
          godaddySso: {
            host: config.ssoHost,
            // Support both securityLevel (new) and riskLevel (deprecated)
            securityLevel: config.securityLevel ?? config.riskLevel ?? LoadedSecurityLevel.LOW,
            auths: config.auths ?? [LoadedAuths.BASIC],
            authType: config.authType ?? LoadedAuthType.IDP
          }
          // Note: omit 'oauth' key to disable OAuth validation
        };
        gdAuth.parseToken(token, authOptions); // This will throw if invalid
      } else {
        // Use legacy library
        const { GdAuth } = await import('gd-auth');
        const riskLevel = config.riskLevel || GdAuth.risk.low;
        await gdAuth.authenticate(config.ssoHost, token, riskLevel);
      }
      return token;
    } catch {
      gasket.logger.debug(`Invalid token found in cache for ${key}`);
      // If the token is invalid, delete it from the cache and fetch a new one
      jwtCache.del(key);
    }
  }

  try {
    const jwt = await fetchJwt(gasket, config);
    jwtCache.set(key, jwt, config.ttl);
    gdAuthCache.setGdAuthInstance(gasket, key, config);
    return jwt;
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      throw new Error(`Unable to reach ${config.ssoHost}`);
    }
    throw err;
  }
}

export { getJwt };
