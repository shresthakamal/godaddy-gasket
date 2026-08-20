import parseCacheControl from 'parse-cache-control';

/**
 * Parses out etag, must-revalidate and max-age headers
 * @type {import('./internal').parseResponseHeaders}
 */
function parseResponseHeaders(headers) {
  const cacheControl = headers.get('cache-control');

  const etag = headers.get('etag') || null;
  const parsedCacheControl = parseCacheControl(cacheControl) || {};
  const mustRevalidate = !!parsedCacheControl['must-revalidate'];
  let maxAge = parsedCacheControl['max-age'];
  maxAge = maxAge === void 0 ? null : maxAge;

  return {
    etag,
    mustRevalidate,
    maxAge
  };
}

export default parseResponseHeaders;
