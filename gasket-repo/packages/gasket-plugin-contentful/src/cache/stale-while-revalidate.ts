import NodeCache from 'node-cache';

import { ContentData } from '@godaddy/gasket-plugin-content';
import { CACHE_STRATEGY, CacheOptionsByStrategy, StaleWhileRevalidateCache } from '../types.js';

export type Resolver<T> = (isRunningInBackground?: boolean) => Promise<T>;

const LOG_PREFIX = 'plugin-contentful: [SWR-Cache] ';

const ONE_HOUR_IN_SECONDS = 60 * 60;
const FIVE_MINUTES_IN_SECONDS = 5 * 60;
export const DEFAULT_MAX_STALE_SECONDS = ONE_HOUR_IN_SECONDS;
export const DEFAULT_MAX_FRESH_SECONDS = FIVE_MINUTES_IN_SECONDS;

export const cache = new NodeCache({ stdTTL: ONE_HOUR_IN_SECONDS, useClones: false });
export const locks = new Set<string>();

export function getSWRCache(cacheOptions: CacheOptionsByStrategy<typeof CACHE_STRATEGY.STALE_WHILE_REVALIDATE>): StaleWhileRevalidateCache {
  const maxFreshSeconds = cacheOptions.maxFreshSeconds ?? DEFAULT_MAX_FRESH_SECONDS;

  function get(itemKey: string): ContentData | undefined {
    const result = cache.get<ContentData>(itemKey);
    if (!result) return;
    result.debug.stale = (Date.now() - new Date(result.debug.retrievedAt).getTime()) / 1000 > maxFreshSeconds;
    return result;
  }

  function set(itemKey: string, contentData: ContentData, maxStaleSeconds: number): boolean {
    if (contentData.debug.stale) throw new Error(LOG_PREFIX + `contentData is stale, cannot set item ${itemKey}`);
    return cache.set(itemKey, contentData, maxStaleSeconds);
  }

  return { get, set };
}

export function revalidateInBackground(cacheKey: string, resolver: Resolver<ContentData>) {
  if (locks.has(cacheKey)) return;
  locks.add(cacheKey);
  setImmediate(async () => {
    try {
      const isRunningInBackground = true;
      await resolver(isRunningInBackground);
    } catch (error: any) {
      throw new Error(LOG_PREFIX + `error revalidating cache for key ${cacheKey}`, error);
    } finally {
      locks.delete(cacheKey);
    }
  });
}
