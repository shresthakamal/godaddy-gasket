import { describe, it, expect, vi } from 'vitest';
const mockFetchWithCache = vi.fn();
vi.mock('../lib/cache/fetch-with-cache-singleton', () => ({
  default: () => mockFetchWithCache
}));

import fetchPCS from '../lib/pcs.js';

describe('PCS Hook', () => {
  it('Constructs URL and calls fetchWithCache with this URL', async () => {
    const mockGasket = {
      config: {
        hcs: {
          pcsUrl: 'https://pcs.godaddy.com/pcs',
          pcsOverrideQuery: { param1: 1, param2: 2 },
          cachingModule: () => null,
          defaultCacheMaxAge: 10 * 60, // 10 minutes,
          hivemind: {
            labels: ['experiment1', 'experiment2']
          }
        }
      }
    };
    const params = {
      appKey: 'someApp',
      fromQuery: 'someValue'
    };

    await fetchPCS(mockGasket, params);

    expect(mockFetchWithCache).toHaveBeenLastCalledWith(
      'https://pcs.godaddy.com/pcs/someApp?fromQuery=someValue&param1=1&param2=2&hivemind=experiment1%2Cexperiment2'
    );
  });

  it('prefers value from PCS_HOST for pcsUrl', async () => {
    process.env.PCS_HOST = 'pcs-test-address'; // eslint-disable-line no-process-env

    const mockGasket = {
      config: {
        hcs: {
          pcsUrl: 'https://pcs.godaddy.com/pcs'
        }
      }
    };
    const params = {
      appKey: 'someApp',
      fromQuery: 'someValue'
    };

    await fetchPCS(mockGasket, params);

    expect(mockFetchWithCache).toHaveBeenLastCalledWith(
      'pcs-test-address/someApp?fromQuery=someValue'
    );
  });

  it('Throws if pcsUrl is missing from gasket.config.js:pcs.pcsUrl', async () => {
    const params = {
      appKey: 'someApp',
      fromQuery: 'someValue'
    };
    const mockGasket = null;

    try {
      await expect(fetchPCS(mockGasket, params)).rejects.toThrow();

    } catch {
      // empty
    }
  });
});
