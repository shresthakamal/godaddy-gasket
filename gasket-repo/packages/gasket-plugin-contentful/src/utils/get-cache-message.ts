import { ContentData } from '@godaddy/gasket-plugin-content';
import { CacheOptions, CACHE_STRATEGY } from '../types.js';

const PREFIX = '  ⦿ ';

export function getCacheHitMessage(cacheTransformed: boolean | undefined, strategy: CacheOptions['strategy'], contentData: ContentData) {
  let message = PREFIX;
  if (strategy === CACHE_STRATEGY.STALE_WHILE_REVALIDATE) {
    message += `SWR Cache: [${contentData.debug.stale ? 'stale' : 'fresh'}] `;
  }
  message += `${cacheTransformed ? 'transformed' : 'raw'} cache hit`;
  return message;
}

export function getCacheMissMessage(strategy: CacheOptions['strategy']) {
  let message = PREFIX;
  if (strategy === CACHE_STRATEGY.STALE_WHILE_REVALIDATE) {
    message += `SWR Cache: `;
  }
  message += `cache miss`;
  return message;
}
