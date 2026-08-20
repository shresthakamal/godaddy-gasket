/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-elastic-apm" />
/// <reference types="@godaddy/gasket-plugin-uxp" />

import { hosts } from './default-config.js';
import { resolveEnvKey } from './utils.js';

/** @type {import('@gasket/core').HookHandler<'configure'>} */
export default function configureHandler(gasket, baseConfig) {
  return {
    ...baseConfig,
    auth: buildAuthConfig(baseConfig),
    elasticAPM: getElasticConfig(baseConfig)
  };
}

/**
 * Build the auth config
 * @type {import('./internal').buildAuthConfig}
 */
function buildAuthConfig(baseConfig) {
  const {
    env,
    presentationCentral: { params = {} } = {},
    auth = {}
  } = baseConfig;
  const { realm = 'idp' } = auth;

  const appName = auth.appName || params.app;

  let { basePath = baseConfig.basePath || '' } = baseConfig.auth || {};
  basePath = basePath.replace(/\/$/, '');

  let { host } = auth;
  if (!host) {
    host = hosts[resolveEnvKey(env)];
  }

  // The per-env default oauthIssuer is resolved lazily on the FFI path.
  // Here we only pass through any explicit config.
  const oauth = { ...(auth.oauth || {}) };

  return {
    ...auth,
    host,
    appName,
    basePath,
    realm,
    oauth
  };
}

/**
 * Get the Elastic APM config
 * @type {import('./internal').getElasticConfig}
 */
function getElasticConfig(baseConfig) {
  const {
    elasticAPM = {}
  } = baseConfig;

  return {
    ...elasticAPM,
    sensitiveCookies: [...new Set([
      ...(elasticAPM.sensitiveCookies || []),
      'auth_idp',
      'auth_jomax',
      'cust_idp'
    ])]
  };
}

