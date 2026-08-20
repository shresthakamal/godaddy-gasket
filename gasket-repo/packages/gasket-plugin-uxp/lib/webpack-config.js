/// <reference types="@gasket/plugin-webpack" />
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * @param {object} umd - `@ux/react-bundle/externals` UMD map
 * @param {boolean} externalizeJsxRuntime - When false, bundle jsx-runtime from node_modules
 * @returns {object} Webpack externals map for the client bundle
 */
function getClientExternals(umd, externalizeJsxRuntime) {
  const clientExternals = { ...umd };

  if (!externalizeJsxRuntime) {
    delete clientExternals['react/jsx-runtime'];
    delete clientExternals['react/jsx-dev-runtime'];
  }

  return clientExternals;
}

const isPresentationCentral = /@ux[/\\]presentation-central$/;
const isUxpPlugin = /@godaddy\/gasket-plugin-uxp/;

/**
 * Externalize @ux/presentation-central in the Next.js server build.
 * This avoids bundle errors that are encounter with app router.
 * @param {object} ctx - The context object containing the request string.
 * @param {Function} callback - The externals' callback.
 * @returns {void|*} callback
 */
function externalizePresentationCentral(ctx, callback) {
  if (isPresentationCentral.test(ctx.request)) {
    const externalsType = ctx.dependencyType === 'esm' ? 'module' : 'commonjs';
    return callback(null, [externalsType, ctx.request].join(' '));
  }
  return callback();
}

/**
 Externalize this plugin in the Next.js server build.
 * @param {object} ctx - The context object containing the request string.
 * @param {Function} callback - The externals' callback.
 * @returns {void|*} results
 */
function externalizePlugin(ctx, callback) {
  if (isUxpPlugin.test(ctx.request)) {
    return callback(null, ['commonjs', ctx.request].join(' '));
  }
  return callback(null);
}

/**
 * @type {import('@gasket/core').HookHandler<'webpackConfig'>}
 */
function webpackConfigHook(gasket, webpackConfig, { isServer }) {
  if (Array.isArray(webpackConfig.externals)) {
    // Apply to all client builds (Next 16+ names pages client "pages-dir-browser", not "client")
    if (
      gasket.config.uxp?.externals !== false &&
      !isServer
    ) {
      // @ts-ignore - does not export types
      const { umd } = require('@ux/react-bundle/externals');

      webpackConfig.externals.push(
        getClientExternals(umd, gasket.config.uxp?.externalizeJsxRuntime === true)
      );
      webpackConfig.output = {
        ...webpackConfig.output,
        libraryTarget: 'umd',
        enabledLibraryTypes: [
          ...(webpackConfig.output?.enabledLibraryTypes ?? []),
          'umd'
        ]
      };
    }

    if (isServer) {
      webpackConfig.externals.unshift(externalizePlugin);
      webpackConfig.externals.unshift(externalizePresentationCentral);
    }
  }

  webpackConfig.resolve ??= {};
  webpackConfig.resolve.fallback ??= {};

  // this ponyfill no longer necessary - alias to use native fetch
  webpackConfig.resolve.alias['@godaddy/fetch'] = require.resolve('./native-fetch.cjs');
  if (gasket.config.uxp?.useMintl) {
    webpackConfig.resolve.alias['react-intl'] = require.resolve('@godaddy/react-mintl');
  }

  return webpackConfig;
}

export {
  externalizePresentationCentral,
  externalizePlugin,
  getClientExternals,
  webpackConfigHook as webpackConfig
};
