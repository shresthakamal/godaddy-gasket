import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { umd } from '@ux/react-bundle/externals';
import path from 'path';
import {
  webpackConfig,
  getClientExternals,
  externalizePresentationCentral,
  externalizePlugin
} from '../lib/webpack-config.js';

describe('webpack', function () {
  let mockConfig, mockData, nextExternalsStub, mockGasket;

  beforeEach(() => {
    nextExternalsStub = vi.fn();

    mockGasket = {
      config: {
        root: path.join(__dirname, '..'),
        uxp: {
          externalizeJsxRuntime: true
        }
      },
      metadata: {
        app: {
          package: {
            dependencies: {
              next: '^10.0.0'
            }
          }
        }
      }
    };

    mockConfig = {
      module: {
        rules: []
      },
      resolve: {
        alias: {}
      },
      externals: [nextExternalsStub]
    };

    mockData = {
      defaultLoaders: {
        babel: f => f
      }
    };
  });

  afterEach(function () {
    vi.restoreAllMocks();
  });

  it('runs on the webpack lifecycle event', function () {
    expect(typeof webpackConfig).toBe('function');
  });

  it('replaces @godaddy/fetch with native fetch', function () {
    const result = webpackConfig(mockGasket, mockConfig, mockData);
    expect(result.resolve.alias['@godaddy/fetch']).toEqual(require.resolve('../lib/native-fetch.cjs'));
  });

  describe('client', () => {
    beforeEach(() => {
      mockConfig.name = 'client';
    });

    it('returns config', function () {
      const config = webpackConfig(mockGasket, mockConfig, mockData);

      expect(typeof config).toBe('object');
    });

    it('adds react externals to config', function () {
      const config = webpackConfig(mockGasket, mockConfig, mockData);
      expect(config).toHaveProperty('externals');
      const reactExternalsEntry = config.externals.find(
        (e) => typeof e === 'object' && e?.react && e?.['react-dom']
      );
      expect(reactExternalsEntry).toBeDefined();
      expect(reactExternalsEntry['react-dom/client']).toBeDefined();
    });

    it('keeps jsx-runtime externals when externalizeJsxRuntime is true', function () {
      const clientExternals = getClientExternals(umd, true);

      expect(clientExternals['react/jsx-runtime']).toBeDefined();
      expect(clientExternals['react/jsx-dev-runtime']).toBeDefined();
    });

    it('omits jsx-runtime externals when externalizeJsxRuntime is false', function () {
      const clientExternals = getClientExternals(umd, false);

      expect(clientExternals['react/jsx-runtime']).toBeUndefined();
      expect(clientExternals['react/jsx-dev-runtime']).toBeUndefined();
      expect(clientExternals.react).toEqual(umd.react);
    });

    it('omits jsx-runtime externals in webpack when externalizeJsxRuntime is false', function () {
      mockGasket.config.uxp.externalizeJsxRuntime = false;
      const config = webpackConfig(mockGasket, mockConfig, mockData);
      const reactExternalsEntry = config.externals.find(
        (e) => typeof e === 'object' && e?.react
      );

      expect(reactExternalsEntry['react/jsx-runtime']).toBeUndefined();
      expect(reactExternalsEntry['react/jsx-dev-runtime']).toBeUndefined();
    });

    it('sets libraryTarget', function () {
      const config = webpackConfig(mockGasket, mockConfig, mockData);
      expect(config.output).toHaveProperty('libraryTarget', 'umd');
    });

    it('overrides existing libraryTarget', function () {
      mockConfig.output = { libraryTarget: 'bogus' };
      const config = webpackConfig(mockGasket, mockConfig, mockData);
      expect(config.output).toHaveProperty('libraryTarget', 'umd');
    });

    it('sets enabledLibraryTypes', function () {
      const config = webpackConfig(mockGasket, mockConfig, mockData);
      expect(config.output).toHaveProperty('enabledLibraryTypes', expect.arrayContaining(['umd']));
    });

    it('adds to existing enabledLibraryTypes', function () {
      mockConfig.output = { enabledLibraryTypes: ['bogus'] };
      const config = webpackConfig(mockGasket, mockConfig, mockData);
      expect(config.output).toHaveProperty('enabledLibraryTypes', expect.arrayContaining(['bogus', 'umd']));
    });

    it('does not modify if uxp.externals disabled', function () {
      mockGasket.config.uxp = { externals: false };
      const config = webpackConfig(mockGasket, mockConfig, mockData);
      expect(config).toHaveProperty('externals');
      expect(config.externals).not.toEqual(expect.arrayContaining([umd]));
      expect(config).not.toHaveProperty('output');
    });

    it('does not add react externals for server bundles', () => {
      mockData.isServer = true;
      const result = webpackConfig(mockGasket, mockConfig, mockData);
      expect(result.externals).not.toEqual(expect.arrayContaining([umd]));
    });

    it('externalizes Presentation Central for server bundles', () => {
      mockData.isServer = true;
      const result = webpackConfig(mockGasket, mockConfig, mockData);
      expect(result.externals[0]).toBe(externalizePresentationCentral);
    });

    it('externalizes UXP plugin for server bundles', () => {
      mockData.isServer = true;
      const result = webpackConfig(mockGasket, mockConfig, mockData);
      expect(result.externals[1]).toBe(externalizePlugin);
    });

    it('sets react-mintl alias when useMintl is true', () => {
      mockGasket.config.uxp = { useMintl: true };
      const result = webpackConfig(mockGasket, mockConfig, mockData);
      expect(result.resolve.alias['react-intl']).toBe(require.resolve('@godaddy/react-mintl'));
    });

    it('does not set react-mintl alias when useMintl is fasly', () => {
      const result = webpackConfig(mockGasket, mockConfig, mockData);
      expect(result.resolve.alias['react-intl']).not.toBe(require.resolve('@godaddy/react-mintl'));
    });
  });
});

describe('externalizeGasketCore', () => {
  let mockCtx, mockCallback;

  beforeEach(() => {
    mockCtx = {
      request: '',
      dependencyType: ''
    };
    mockCallback = vi.fn();
  });

  it('returns module type for esm dependency when request matches gasket core', () => {
    mockCtx.request = '@ux/presentation-central';
    mockCtx.dependencyType = 'esm';
    externalizePresentationCentral(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, 'module @ux/presentation-central');
  });

  it('returns commonjs type for non-esm dependency when request matches gasket core', () => {
    mockCtx.request = '@ux/presentation-central';
    mockCtx.dependencyType = 'commonjs';
    externalizePresentationCentral(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, 'commonjs @ux/presentation-central');
  });

  it('returns undefined when request does not match gasket core', () => {
    mockCtx.request = 'other-package';
    externalizePresentationCentral(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith();
  });

  it('avoids closely name packages', () => {
    mockCtx.request = '@ux/presentation-central-utils';
    mockCtx.dependencyType = 'esm';
    externalizePresentationCentral(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith();
    expect(mockCallback).not.toHaveBeenCalledWith(null, 'module @ux/presentation-central-utils');
  });
});
