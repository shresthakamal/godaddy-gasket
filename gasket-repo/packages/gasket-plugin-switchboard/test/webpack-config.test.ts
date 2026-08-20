import { describe, expect, beforeEach, it } from 'vitest';
import type { WebpackContext } from '@gasket/plugin-webpack';
import type { Gasket } from '@gasket/core';
import type { Configuration } from 'webpack';
import webpackConfigHook, { externalize } from '../src/webpack-config.js';

describe('webpackConfig', function () {
  let mockGasket: Gasket, mockWebpackConfig: Configuration, mockContext: WebpackContext;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/path/to/root'
      }
    } as Gasket;
    mockWebpackConfig = {
      resolve: {
        alias: {}
      },
      plugins: [],
      externals: []
    } as Configuration;
    mockContext = { isServer: true } as WebpackContext;
  });

  it('externalize @switchboard/client in server builds', async () => {
    const results = await webpackConfigHook(mockGasket, mockWebpackConfig, mockContext);
    expect(results.externals).toEqual(expect.arrayContaining([externalize]));

    // externalizes gd-auth
    externalize({ request: '@switchboard/client' }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('commonjs @switchboard/client');
    });

    // does NOT externalize other packages
    externalize({ request: 'some-other-auth' }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeUndefined();
    });
  });

  it('ensure gd-auth not bundled in client builds', async () => {
    mockContext.isServer = false;
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, mockContext);
    const config = await results;
    expect(config.resolve?.alias).toEqual(expect.objectContaining({
      '@switchboard/client': false
    }));
  });

  it('handle non-array externals gracefully', async () => {
    // @ts-expect-error - mockWebpackConfig.externals is not typed
    mockWebpackConfig.externals = null;
    const results = await webpackConfigHook(mockGasket, mockWebpackConfig, mockContext);
    expect(results.externals).toBeNull();
  });
});
