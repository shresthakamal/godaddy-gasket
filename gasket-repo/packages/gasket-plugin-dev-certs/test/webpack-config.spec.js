import { webpackConfig as webpackConfigHook, externalize } from '../lib/webpack-config.js';
import { readFileSync } from 'fs';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name } = packageJson;

describe('webpackConfig', function () {
  let mockGasket, mockWebpackConfig, mockContext;

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
    mockContext = { isServer: true };
  });

  it('externalize plugin in server builds', () => {
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, mockContext);
    expect(results.externals).toEqual(expect.arrayContaining([externalize]));

    // externalizes gd-auth
    externalize({ request: '@godaddy/gasket-plugin-dev-certs' }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('commonjs @godaddy/gasket-plugin-dev-certs');
    });

    // does NOT externalize other packages
    externalize({ request: 'some-other-auth' }, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBeUndefined();
    });
  });

  it('ensure not bundled in client builds', () => {
    mockContext.isServer = false;
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, mockContext);
    expect(results.resolve.alias).toEqual(expect.objectContaining({
      [name]: false
    }));
  });

  it('handle non-array externals gracefully', () => {
    mockWebpackConfig.externals = null;
    const results = webpackConfigHook(mockGasket, mockWebpackConfig, mockContext);
    expect(results.externals).toBeNull();
  });
});
