/// <reference types="@gasket/plugin-webpack" />

const isDevCerts = /@godaddy\/gasket-plugin-dev-certs$/;

/**
 * Externalize for server builds.
 * @param {object} ctx - The context object containing the request string.
 * @param {Function} callback - The externals' callback.
 * @returns {void|*} results
 */
function externalize(ctx, callback) {
  if (isDevCerts.test(ctx.request)) {
    return callback(null, ['commonjs', ctx.request].join(' '));
  }
  return callback(null);
}

/** @type {import('@gasket/core').HookHandler<'webpackConfig'>} */
function webpackConfigHook(gasket, webpackConfig, context) {
  if (context.isServer) {
    if (Array.isArray(webpackConfig.externals)) {
      webpackConfig.externals.unshift(externalize);
    }
  } else {
    webpackConfig.resolve.alias['@godaddy/gasket-plugin-dev-certs'] = false;
  }

  return webpackConfig;
}

export {
  webpackConfigHook as webpackConfig,
  externalize
};
