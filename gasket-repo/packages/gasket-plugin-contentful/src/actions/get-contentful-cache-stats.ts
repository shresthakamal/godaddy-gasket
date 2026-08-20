import type { ActionHandler } from '@gasket/core';
import { cache as noStaleCache } from '../cache/no-stale.js';
import { cache as swrCache } from '../cache/stale-while-revalidate.js';

export const getContentfulCacheStats: ActionHandler<'getContentfulCacheStats'> = async (gasket) => {
  await gasket.isReady;

  return {
    noStale: {
      options: noStaleCache.options,
      stats: noStaleCache.getStats()
    },
    staleWhileRevalidate: {
      options: swrCache.options,
      stats: swrCache.getStats()
    }
  };
};
