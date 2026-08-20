import { CacheOptions, StaleWhileRevalidateCache } from '../types.js';
import { CACHE_STRATEGY } from '../types.js';
import { cache as NoStaleCache } from './no-stale.js';
import { getSWRCache } from './stale-while-revalidate.js';

export function getCacheByOptions(cacheOptions: CacheOptions): typeof NoStaleCache | StaleWhileRevalidateCache {
  if (cacheOptions.strategy === CACHE_STRATEGY.NO_STALE) {
    return NoStaleCache;
  }
  return getSWRCache(cacheOptions);
}
