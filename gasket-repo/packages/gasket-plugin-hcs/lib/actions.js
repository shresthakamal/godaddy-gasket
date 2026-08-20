import Apps from '@ux/apps';
import envModule from '@ux/environments';

const shortEnv = envModule('short');

let appsSingleton;

/**
 * Produces a singleton apps client.
 * @type {import('@gasket/core').ActionHandler<'getAppsClient'>}
 */
function getAppsClient(gasket) {
  const { config: { env, switchboard } } = gasket;
  const {
    cert,
    key,
    certPath,
    keyPath,
    primaryRegion,
    secondaryRegion
  } = switchboard.auth;

  let switchboardAuth;

  if (env === 'local') {
    switchboardAuth = {
      certPath,
      keyPath
    };
  } else if (cert && key) {
    switchboardAuth = {
      cert,
      key
    };
  } else {
    switchboardAuth = {
      primaryRegion,
      secondaryRegion
    };
  }

  if (!appsSingleton) {
    appsSingleton = new Apps({
      env: shortEnv(env) || 'dev',
      useFallbackProvider: true,
      switchboardAuth
    });
  }

  return appsSingleton;
}

/**
 * Resets singleton apps client.
 * @type {import('./internal').resetAppsClient}
 * @private
 */
function resetAppsClient() {
  appsSingleton = null;
}

export {
  getAppsClient,
  resetAppsClient
};
