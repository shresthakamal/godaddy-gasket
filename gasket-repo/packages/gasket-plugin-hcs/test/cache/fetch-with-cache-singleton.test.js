import { describe, it, expect, vi } from 'vitest';
vi.mock('../../lib/cache/pcs-cache.js', () => ({
  default: vi.fn(() => 42)
}));
import pcsCache from '../../lib/cache/pcs-cache.js';

import fetchWithCacheSingleton from '../../lib/cache/fetch-with-cache-singleton.js';

describe('fetchWithCacheSingleton', () => {

  it('get as singleton', async () => {
    await fetchWithCacheSingleton({});
    expect(pcsCache).toHaveBeenCalledTimes(1);
    await fetchWithCacheSingleton({});
    await fetchWithCacheSingleton({});
    // still called only once since it's returning cached pcsCache
    expect(pcsCache).toHaveBeenCalledTimes(1);
  });

});
