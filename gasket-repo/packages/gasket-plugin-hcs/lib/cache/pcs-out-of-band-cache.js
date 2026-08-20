import gasketFetch from '@gasket/fetch';
import Cache from 'out-of-band-cache';

import parseResponseHeaders from './parse-response-headers.js';

/**
 * Returns an async cached fetch function that calls the server only if the result is not in the cache and is not stale
 * @type {import('./internal').pcsOutOfBandCache}
 */
async function pcsOutOfBandCache(options) {
  const {
    fetch = gasketFetch,
    fsCachePath,
    maxAge,
    maxStaleness
  } = options || {};
  const outOfBandCache = new Cache({
    maxAge,
    maxStaleness,
    fsCachePath
  });

  /**
   * Handles the fetch logic and cache update.
   * @type {import('./internal').HandleFetch}
   */
  async function handleFetch(url, opts, staleItem) {
    const oldEtag = staleItem && staleItem.etag;
    const reqOpts = {
      ...opts,
      headers: {
        'accept': 'application/json',
        ...opts.headers,
        'if-none-match': oldEtag || ''
      }
    };
    try {
      const response = await fetch(url, reqOpts);
      const { status, headers } = response;
      const { etag } = parseResponseHeaders(headers);

      if (oldEtag && status === 304) { return staleItem; }
      if (status >= 200 && status < 300) {
        const content = await response.json();
        return { items: content, meta: { url, status, headers, body: content }, etag };
      }
      throw new Error(`HTTP Error, statusCode: ${status}, url: ${url}`);
    } catch (err) {
      if (!oldEtag) {
        throw err;
      }
      return staleItem;
    }
  }

  /**
   * An async cached fetch function that calls the server only if the result
   * is not in the cache and is not stale observing the relevant header values
   * @type {import('./internal').fetchWithCache}
   */
  async function fetchWithCache(url) {
    const outOfBandCacheKey = encodeURI(url);
    /** @type {import('./internal').HandleFetchOptions} */
    const opts = {};
    const { value, fromCache } = await outOfBandCache.get(
      outOfBandCacheKey,
      {
        // @ts-ignore - meta can be part of the response value
        shouldCache: (res) => res.meta.status === 200,
        skipCache: opts.skipCache
      },
      async (key, staleItem) => handleFetch(url, opts, staleItem)
    );

    return {
      // @ts-ignore - items can be part of the value
      ...value.items,
      // @ts-ignore - meta can be part of the response value
      meta: { ...value.meta, cached: fromCache }
    };
  }

  return fetchWithCache;
}

export default pcsOutOfBandCache;
