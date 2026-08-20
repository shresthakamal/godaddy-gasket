/// <reference types="@gasket/plugin-webpack" />
import type { HookHandler } from '@gasket/core';
import type { ExternalItemFunctionData } from 'webpack';

const isSwitchboard = /@switchboard\/client$/;

/**
 * Externalize the @switchboard/client module in webpack builds.
 */
export function externalize(ctx: ExternalItemFunctionData, callback: (error: Error | null, result?: string) => void): void {
  if (ctx.request && isSwitchboard.test(ctx.request)) {
    return callback(null, ['commonjs', ctx.request].join(' '));
  }
  return callback(null);
}

const webpackConfigHook: HookHandler<'webpackConfig'> = function webpackConfigHook(gasket, webpackConfig, context) {
  if (context.isServer) {
    if (Array.isArray(webpackConfig.externals)) {
      webpackConfig.externals.unshift(externalize);
    }
  } else if (webpackConfig.resolve?.alias) {
    // @ts-expect-error - webpackConfig.resolve.alias is not typed
    webpackConfig.resolve.alias['@switchboard/client'] = false;
  }

  return webpackConfig;
};

export default webpackConfigHook;
