import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const notInCache = 'notInCache';
const cachedKey = 'cachedKey';
const cachedJwt = 'cachedJwt';
const jwt = 'jwt';

const delJwtCacheMock = vi.fn();
const delJwtCache = () => delJwtCacheMock();
const setJwtCacheMock = vi.fn();
const setJwtCache = () => setJwtCacheMock();

const gdAuthAuthenticateMock = vi.fn();
const gdAuthAuthenticate = () => gdAuthAuthenticateMock();
const setGdAuthCacheMock = vi.fn();
const setGdAuthCache = () => setGdAuthCacheMock();

vi.mock('../lib/fetch-jwt.js', () => ({
  default: vi.fn()
}));

vi.mock('node-cache', () => ({
  default: class MockJwtCache {
    constructor() {
      this.cache = {
        cachedKey: cachedJwt
      };
    }

    get(cacheKey) {
      return this.cache[cacheKey];
    }

    set() {
      setJwtCache();
    }

    has(cacheKey) {
      return !!this.cache[cacheKey];
    }

    del() {
      delJwtCache();
    }
  }
}));

vi.mock('../lib/gd-auth-manager.js', () => ({
  default: class MockGdAuthManager {
    constructor() {
      this.cache = {
        cachedKey: {
          authenticate: gdAuthAuthenticate
        }
      };
    }

    setGdAuthInstance() {
      setGdAuthCache();
    }
    getGdAuthInstance(cacheKey) {
      return this.cache[cacheKey];
    }
  }
}));

const { getJwt } = await import('../lib/actions.js');
const fetchJwt = (await import('../lib/fetch-jwt.js')).default;

describe('actions', () => {
  describe('getJwt', () => {
    let gasket, loggerDebugMock;
    beforeEach(() => {
      loggerDebugMock = vi.fn();
      gasket = {
        config: {
          jwt: {
            notInCache: {},
            cachedKey: {}
          }
        },
        logger: {
          debug: loggerDebugMock
        }
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('throws an error if key is not found in the jwt config', async () => {
      const keyNotThere = 'notThere';

      await expect(getJwt(gasket, keyNotThere)).rejects.toThrow(`No jwt configuration found for ${keyNotThere}`);
    });

    it('fetches jwt when key is not in cache', async () => {
      // @ts-expect-error - mocked function
      fetchJwt.mockResolvedValue(jwt);

      const result = await getJwt(gasket, notInCache);

      expect(setGdAuthCacheMock).toHaveBeenCalled();
      expect(setJwtCacheMock).toHaveBeenCalled();
      expect(result).toBe(jwt);
    });

    it('gets cached jwt', async () => {
      // @ts-expect-error - mocked function
      fetchJwt.mockResolvedValue(jwt);
      const result = await getJwt(gasket, cachedKey);

      expect(gdAuthAuthenticateMock).toHaveBeenCalled();
      expect(result).toBe(cachedJwt);
    });

    it('fetches jwt when cached jwt is invalid', async () => {
      // @ts-expect-error - mocked function
      fetchJwt.mockResolvedValue(jwt);
      gdAuthAuthenticateMock.mockRejectedValue(new Error('jwt expired'));

      const result = await getJwt(gasket, cachedKey);

      expect(delJwtCacheMock).toHaveBeenCalled();
      expect(gasket.logger.debug).toHaveBeenCalledWith(`Invalid token found in cache for ${cachedKey}`);
      expect(setGdAuthCacheMock).toHaveBeenCalled();
      expect(setJwtCacheMock).toHaveBeenCalled();
      expect(result).toBe(jwt);
    });
  });
});
