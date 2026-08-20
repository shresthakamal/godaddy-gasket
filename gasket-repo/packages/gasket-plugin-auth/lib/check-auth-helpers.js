/// <reference types="@godaddy/gasket-plugin-visitor" />
/// <reference types="@gasket/plugin-logger" />

import { GdAuthWrapper } from './auth-lib-wrapper.js';
import { GdAuth } from 'gd-auth';
import { ensureArray, typeDefaults, AuthRealm, objToKey } from './utils.js';
import getFetchKeyFunction from './get-fetch-key-function.js';

// A common mistake is to prefix the `host` auth option with `sso`; this helps
// to automatically strip that.
const ssoPrefix = /^sso\./i;

// Cache instances of GdAuth keyed by options
const gdAuthCache = new Map();

// Pick out an SSO token from Authorization header
const reAuthHeader = /^(\w+)-jwt\s?(.*)$/i;

/**
 * Accepts a query object from req or passed directly and returns options with defaults.
 * @type {import('./internal').fixupAuthOptions}
 */
// eslint-disable-next-line complexity
function fixupAuthOptions(options, authConfig) {
  if (!authConfig) authConfig = {};
  if (!options) options = {};

  const {
    realm = authConfig.realm ?? 'idp',
    risk = authConfig.risk ?? 'low',
    groups = authConfig.groups ?? false,
    certs = authConfig.certs ?? false,
    roles = authConfig.roles ?? false,
    scopes = authConfig.scopes ?? false,
    allowHeartbeat = authConfig.allowHeartbeat ?? false,
    use12HourExpiration = authConfig.use12HourExpiration ?? true
  } = options;

  const type = ensureArray(options.type)
    || ensureArray(authConfig.type)
    || typeDefaults[realm];

  const results = {
    realm,
    type,
    risk,
    allowHeartbeat,
    use12HourExpiration
  };

  if (groups) {
    results.groups = ensureArray(groups);
  }

  if (certs) {
    results.certs = ensureArray(certs);
  }

  if (roles) {
    results.roles = ensureArray(roles);
  }

  if (scopes) {
    results.scopes = ensureArray(scopes);
  }

  return results;
}

/**
 * Accepts a query object from req or passed directly and returns options with defaults.
 * @type {import('./internal').fixupValidateOptions}
 */
function fixupValidateOptions(authOptions, authConfig, app, visitor) {
  // OAuth validation only exists on the FFI path, so the oauth realm forces it
  // regardless of the app-level flag. Derive the effective selection once so
  // `verify` and `useFFILibrary` below stay consistent.
  const useFFILibrary = (authConfig.useFFILibrary || false) || authOptions.realm === 'oauth';
  const { apiProxy } = authConfig;
  const fetchKey = apiProxy && getFetchKeyFunction(apiProxy);

  const hosts = ensureArray(authConfig.host).map(domain => domain.replace(ssoPrefix, ''));
  // hostname will be missing for static renders
  const idx = hosts.findIndex(domain => visitor.hostname?.includes(domain));
  const host = `sso.${hosts[idx] || hosts[0]}`;
  // use query plid for browser checks, or fall back to visitor from visitor plugin
  const { plid } = visitor;

  const oauthConfig = authConfig.oauth || {};

  const results = {
    app,
    auths: authOptions.type,
    type: AuthRealm[authOptions.realm],
    realm: authOptions.realm,
    verify: useFFILibrary ? authOptions.risk : GdAuth.risk[authOptions.risk],
    allowHeartbeat: authOptions.allowHeartbeat,
    use12HourExpiration: authOptions.use12HourExpiration,
    host,
    fetchKey,
    plid,
    useFFILibrary
  };

  // Purely additive for non-oauth realms: only the oauth realm gets these keys.
  // oauthIssuer may be undefined here; the FFI wrapper resolves the per-env
  // default from the gd-auth-lib `OAuthIssuer` enum when it is not set.
  if (authOptions.realm === 'oauth') {
    results.oauthIssuer = oauthConfig.oauthIssuer;
    results.oauthAudience = oauthConfig.oauthAudience;
  }

  return results;
}


/**
 * Get the app name from the config or hostname
 * @type {import('./internal').getAppName}
 */
function getAppName(gasket, hostname) {
  const { config, logger } = gasket;
  const { auth: { appName } } = config;
  const localAppName =
    hostname?.indexOf('local.gasket') > -1
    && 'local.gasket';

  if (!appName) {
    const msg = 'appName not configured for @godaddy/gasket-plugin-auth.';
    if (localAppName) {
      logger.warn(msg + ' Using "local.gasket".');
    } else {
      throw new Error(msg);
    }
  }

  return localAppName || appName;
}

/** @type {import('./internal').getToken} */
function getToken(realmType, req) {
  const token = getTokenFromHeader(realmType, req) || getTokenFromCookies(realmType, req);
  if (!token) {
    throw new Error('Missing token in header or cookie');
  }
  return token;
}

/** @type {import('./internal').logAuthChecked} */
function logAuthChecked(gasket, req, result, authOptions) {
  const success = result.valid;
  const message = result.reason ?? `${authOptions.realm.toUpperCase()} - Succeeded`;
  gasket.exec('authChecked', {
    ...authOptions,
    success,
    req,
    message
  });
}

/** @type {import('./internal').fetchJomaxGroups } */
async function fetchJomaxGroups(options, req) {
  const { host } = options;
  const token = getToken(options.type, req);

  try {
    if (!token || !host) {
      return [];
    }

    const response = await fetch(`https://${host}/api/my/ad_membership`, {
      headers: {
        Authorization: `sso-jwt ${token}`
      }
    });

    if (response.ok) {
      const json = await response.json();
      return json.data.groups;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch groups: ${e}`);
  }

  return [];
}

/** @type {import('./internal').validateGroups } */
function validateGroups(expectedGroups, groups) {
  const groupSet = new Set(groups.map(g => g.toLowerCase()));
  if (!expectedGroups.some(expected => groupSet.has(expected.toLowerCase()))) {
    throw new Error('Unauthorized groups');
  }
}

/** @type {import('./internal').getAuthInstance } */
function getAuthInstance(options, gasket) {
  const { useFFILibrary = false, use12HourExpiration } = options;
  const key = objToKey(options) + (useFFILibrary ? '-ffi' : '');
  if (!gdAuthCache.has(key)) {
    if (useFFILibrary) {
      gdAuthCache.set(key, new GdAuthWrapper({
        ...options,
        useFFILibrary: true,
        useNewExpiration: use12HourExpiration,
        pcpId: gasket?.config?.auth?.pcpId,
        client: gasket?.config?.auth?.client,
        env: gasket?.config?.env,
        logger: gasket?.logger
      }));
    } else {
      // Pass use12HourExpiration to gd-auth as useNewExpiration
      // Defaults to true (new 12h/30d policy) via fixupAuthOptions
      const gdAuthOptions = {
        ...options,
        useNewExpiration: use12HourExpiration
      };
      gdAuthCache.set(key, new GdAuth(gdAuthOptions));
    }
  }
  return gdAuthCache.get(key);
}

/** @type {import('./internal').performAuthenticate } */
async function performAuthenticate(options, req, gasket) {
  const token = getToken(options.type, req);

  const inst = getAuthInstance(options, gasket);
  let jwt;
  try {
    jwt = await inst.authenticate(options.host, token, options.verify);
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      throw new Error(`Unable to reach ${options.host}`);
    }
    throw err;
  }

  return jwt;
}

/** @type {import('./internal').getTokenFromHeader} */
function getTokenFromHeader(realm, req) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-authorization'];
    if (typeof authHeader !== 'string') return;

    if (realm === 'oauth') {
      const m = /^Bearer\s+(.+)$/i.exec(authHeader);
      if (m) return m[1].trim();
      return;
    }

    const authHeaderMatch = reAuthHeader.exec(authHeader);
    if (!authHeaderMatch || authHeaderMatch.index !== 0) {
      return;
    }
    const type = authHeaderMatch[1].toLowerCase();
    const token = authHeaderMatch[2];
    if (type !== realm && type !== 'sso') {
      return;
    }
    return token;
  } catch {
    // ignore
  }
}

/** @type {import('./internal').getTokenFromCookies} */
function getTokenFromCookies(realm, req) {
  const cookies = req.cookies;
  if (cookies) {
    const cookieName = `auth_${realm}`;
    return cookies[cookieName];
  }
}

export {
  fixupAuthOptions,
  fixupValidateOptions,
  getAppName,
  getToken,
  logAuthChecked,
  fetchJomaxGroups,
  validateGroups,
  getAuthInstance,
  performAuthenticate
};
