import memory from './memory.js';

/**
 * Creates expiry and etag aware cache
 * @type {import('./internal').ResponseCache}
 */
async function responseCache(options) {
  const { cachingModule = memory } = options || {};
  const cache = await cachingModule();

  return {
    async get(key) {
      const entry = await cache.get(key);
      if (entry) {
        const isFresh = entry.expires > Date.now();
        return { ...entry, isFresh };
      }
      return null;
    },

    async set(key, content, meta = {}) {
      const { etag = null, maxAge, expires } = meta;
      const _expires = expires ? expires : Date.now() + Number(maxAge) * 1000;
      cache.set(key, {
        content,
        etag,
        expires: _expires
      });
    }
  };

}

export default responseCache;
