import { vi, describe, expect, beforeEach, it } from 'vitest';
import { makeGasket } from '@gasket/core';
import { DetailData, PluginData } from '@gasket/plugin-metadata';
import plugin from '../src/index.js';

vi.spyOn(console, 'warn').mockImplementation(() => {
});

vi.mock('@switchboard/client', () => {
  throw new Error('This should not be imported until needed after startup.');
});

describe('@godaddy/gasket-plugin-switchboard', () => {
  it('has expected hooks', () => {
    const expected = [
      'initReduxState',
      'metadata',
      'onSignal',
      'publicGasketData',
      'webpackConfig'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('metadata', () => {
    let results: PluginData;

    beforeEach(async () => {
      const gasket = makeGasket({ plugins: [plugin] });
      gasket.config = {
        switchboard: {
          callingService: 'mock-app'
        }
      } as any;

      const metadataResults = await gasket.exec(
        'metadata',
        { name: '@godaddy/gasket-plugin-switchboard' }
      );
      results = metadataResults.find((p: PluginData) => p.name === '@godaddy/gasket-plugin-switchboard')!;
      results = {
        name: results.name,
        actions: results.actions,
        metadata: {
          name: results.name,
          lifecycles: results.lifecycles,
          configurations: results.configurations
        }
      };
    });

    it('documents lifecycles', () => {
      expect(results.metadata).toHaveProperty('lifecycles');
      expect(
        results.metadata &&
        results.metadata.lifecycles?.some((l: Record<string, any>) => l.name === 'switchboardPerRequestParams')
      ).toEqual(true);
      expect(
        results.metadata &&
        results.metadata.lifecycles?.some((l: Record<string, any>) => l.name === 'switchboardBrowserState')
      ).toEqual(true);
    });

    it('documents the switchboard configuration', () => {
      expect(results.metadata).toHaveProperty('configurations');
      expect(
        (results.metadata as any).configurations?.some((c: DetailData) => c.name === 'switchboard')
      ).toEqual(true);
    });
  });
});
