import { webpackConfig as webpackConfigHook, externalizeGdAuth, externalizeGdAuthLib } from '../lib/webpack-config.js';

describe('webpackConfig', function () {
  let mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/path/to/root'
      }
    };
    mockWebpackConfig = {
      resolve: {
        alias: {}
      },
      plugins: [],
      externals: []
    };
  });

  it('externalize gd-auth in server builds', () => {
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, { isServer: true });
    expect(results.externals).toEqual(expect.arrayContaining([externalizeGdAuth]));

    // externalizes gd-auth
    externalizeGdAuth({ request: 'gd-auth' }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('commonjs gd-auth');
    });

    // does NOT externalize other packages
    externalizeGdAuth({ request: 'some-other-auth' }, (err, result) => {
      expect(err).toBeUndefined();
      expect(result).toBeUndefined();
    });
  });

  it('externalize gd-auth-lib in server builds', () => {
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, { isServer: true });
    expect(results.externals).toEqual(expect.arrayContaining([externalizeGdAuthLib]));

    // externalizes gd-auth-lib
    externalizeGdAuthLib({ request: '@godaddy/gd-auth-lib' }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('commonjs @godaddy/gd-auth-lib');
    });
  });

  it('ensure gd-auth not bundled in client builds', () => {
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, {});
    expect(results.resolve.alias).toEqual(expect.objectContaining({
      'gd-auth': false
    }));
  });

  it('ensure gd-auth-lib not bundled in client builds', () => {
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, {});
    expect(results.resolve.alias).toEqual(expect.objectContaining({
      '@godaddy/gd-auth-lib': false
    }));
  });

  it('handle non-array externals gracefully', () => {
    mockWebpackConfig.externals = null;
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, { isServer: true });
    expect(results.externals).toBeNull();
  });
});

