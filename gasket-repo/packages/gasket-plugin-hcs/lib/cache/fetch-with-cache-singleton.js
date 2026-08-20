import pcsCache from './pcs-cache.js';
import pcsOutOfBandCache from './pcs-out-of-band-cache.js';

let _fetchWithCache = null;

/**
 * Singleton wrapper for pcsCache
 * @type {import('./internal').fetchWithCacheSingleton}
 */
async function fetchWithCacheSingleton(opts) {
  // NOTE: this factory function doesn't return a new fetchWithCache function on subsequent calls
  // with different arguments, but I think that's ok in this case
  if (_fetchWithCache) {
    return _fetchWithCache;
  }

  _fetchWithCache = opts.useOutOfBandCache ? await pcsOutOfBandCache(opts) : await pcsCache(opts);
  return _fetchWithCache;
}


export default fetchWithCacheSingleton;
