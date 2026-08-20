/// <reference types="@gasket/plugin-webpack" />

const isGdAuth = /gd-auth$/;
const isGdAuthLib = /@godaddy\/gd-auth-lib$/;

function externalizeGdAuthLib(ctx, callback) {
  if (isGdAuthLib.test(ctx.request)) {
    return callback(null, ['commonjs', ctx.request].join(' '));
  }
  return callback();
}

/**
 * Externalize gd-auth in the Next.js server builds.
 * The `rsa-pem-from-mod-exp` package uses Buffer which does not work when webpacked.
 * @param {object} ctx - The context object containing the request string.
 * @param {Function} callback - The externals' callback.
 * @returns {void|*} results
 */
function externalizeGdAuth(ctx, callback) {
  if (isGdAuth.test(ctx.request)) {
    return callback(null, ['commonjs', ctx.request].join(' '));
  }
  return callback();
}

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
function webpackConfigHook(gasket, webpackConfig, { isServer }) {
  if (isServer) {
    if (Array.isArray(webpackConfig.externals)) {
      webpackConfig.externals.unshift(externalizeGdAuth);
      webpackConfig.externals.unshift(externalizeGdAuthLib);
    }
  } else {
    webpackConfig.resolve.alias['gd-auth'] = false;
    webpackConfig.resolve.alias['@godaddy/gd-auth-lib'] = false;
  }

  return webpackConfig;
}

export {
  webpackConfigHook as webpackConfig,
  externalizeGdAuth,
  externalizeGdAuthLib
};
