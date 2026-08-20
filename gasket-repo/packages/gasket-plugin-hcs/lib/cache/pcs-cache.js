import gasketFetch from '@gasket/fetch';
import parseResponseHeaders from './parse-response-headers.js';
import memory from './memory.js';
import responseCache from './response-cache.js';
import { DEFAULT_MAX_AGE } from '../constants.js';

/**
 * Handle the non 2xx or 304 responses
 * @type {import('./internal').onServerError}
 */
function onServerError(cacheEntry, err) {
  if (cacheEntry) {
    return cacheEntry.content;
  }
  throw err;
}

/**
 * Returns an async cached fetch function that calls the server only if the result is not in the cache and is not stale
 * @type {import('./internal').pcsCache}
 */
async function pcsCache({
  cachingModule = memory,
  fetch = gasketFetch,
  defaultMaxAge = DEFAULT_MAX_AGE
} = {}) {
  const cache = await responseCache({ cachingModule });


  /**
   * An async cached fetch function that calls the server only if the result
   * is not in the cache and is not stale observing the relevant header values
   * @type {import('./internal').fetchWithCache}
   */
  // eslint-disable-next-line max-statements
  async function fetchWithCache(url) {
    const cacheEntry = await cache.get(url);

    if (cacheEntry) {
      if (cacheEntry.isFresh) {
        return cacheEntry.content;
      }
    }

    let response = null;
    try {
      // If we have a previous etag, let's tack it on the request
      const opts = {};
      if (cacheEntry && cacheEntry.etag) {
        opts.headers = {
          'If-None-Match': cacheEntry.etag
        };
      }
      response = await fetch(url, opts);
    } catch (err) {
      return onServerError(cacheEntry, err);
    }

    const { status } = response;
    const {
      etag,
      mustRevalidate,
      maxAge
    } = parseResponseHeaders(response.headers);

    // 304: Not Modified, let's return from cache anyways, set expires according to maxAge/mustRevalidate
    if (status === 304) {
      const _maxAge = mustRevalidate ? 0 : maxAge;
      const { content } = cacheEntry;
      const cacheMeta = {
        maxAge: _maxAge,
        etag: cacheEntry.etag
      };
      // no need to wait for cache.set()
      cache.set(url, content, cacheMeta);
      return content;
    }

    // we got 2XX resp.
    if (response.ok) {
      const content = await response.json();

      // If the server didn't send a max-age value, let's use defaultMaxAge
      let _maxAge = typeof maxAge === 'number' ? maxAge : defaultMaxAge;
      if (mustRevalidate) {
        _maxAge = -1;
      }

      const cacheMeta = {
        maxAge: _maxAge,
        etag
      };

      // no need to wait for cache.set()
      cache.set(url, content, cacheMeta);
      return content;
    }

    // any other uncaught cases, attempt to return from cache before throwing an error
    return onServerError(cacheEntry, new Error(`HTTP Error, statusCode: ${status}, url: ${url}`));
  }

  return fetchWithCache;
}

export default pcsCache;
