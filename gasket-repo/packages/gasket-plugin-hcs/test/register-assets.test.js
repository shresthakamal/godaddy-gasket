/* eslint no-undefined: 0 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import mockWrhsAssets from '../lib/wrhs-assets.js';
vi.mock('../lib/wrhs-assets.js');

import { registerAssets } from '../lib/express.js';
import path from 'path';

describe('registerAssets', () => {
  const execfn = vi.fn();

  const mockGasket = {
    exec: execfn,
    config: {
      root: path.join(__dirname, '..'),
      hcs: {
        devMode: false,
        defaultHcsScripts: false
      }
    }
  };

  const mockAsset = {
    acceptedVariants: [
      'en-US',
      'en'
    ],
    name: '@ux/application-sidebar-other-asset',
    version: '0.0.0'
  };

  beforeEach(() => {
    execfn.mockImplementation((event) => {
      if (event === 'wrhsPackageRequests') return [mockAsset];
      return undefined;
    });
  });

  it('appends default wrhs package request to the wrhsPackageRequests lifecycle results', async () => {
    mockGasket.config.wrhs = {
      variant: 'xyz42'
    };

    await registerAssets({
      gasket: mockGasket,
      pcsManifest: {},
      params: {},
      props: {}
    });

    expect(mockWrhsAssets).toHaveBeenCalledWith(mockGasket, [
      mockAsset,
      {
        acceptedVariants: [
          'xyz42',
          '_default'
        ],
        name: '@godaddy/gasket-plugin-hcs',
        version: expect.any(String)
      }
    ]);
  });
});
