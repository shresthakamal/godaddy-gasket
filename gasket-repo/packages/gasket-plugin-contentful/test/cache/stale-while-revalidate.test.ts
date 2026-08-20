/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { CACHE_STRATEGY } from '../../src/types.js';
import { cache as swrCacheFromModule, getSWRCache, revalidateInBackground, locks } from '../../src/cache/stale-while-revalidate.js';
import { ContentData } from '@godaddy/gasket-plugin-content';

const mockError = vi.fn();
const mockDebug = vi.fn();
const mockWarn = vi.fn();

describe('cache: stale-while-revalidate', () => {
  let cacheOptions : any;
  let mockGasket: any;

  beforeAll(() => {
    mockGasket = {
      logger: {
        error: mockError,
        debug: mockDebug,
        warn: mockWarn
      },
      config: {
        contentful: {}
      }
    };
  });

  beforeEach(() => {
    swrCacheFromModule.flushAll();
    mockError.mockClear();
    mockDebug.mockClear();
    mockWarn.mockClear();
    cacheOptions = { strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE };
  });

  describe('getSWRCache', () => {
    it('should return a function', () => {
      const cache = getSWRCache(cacheOptions);
      expect(cache).toHaveProperty('get');
      expect(cache).toHaveProperty('set');
      expect(cache.get).toBeInstanceOf(Function);
      expect(cache.set).toBeInstanceOf(Function);
    });

    it('should return undefined if the item is not found', () => {
      const cache = getSWRCache(cacheOptions);
      expect(cache.get('test')).toBeUndefined();
    });
  });

  describe('setting', () => {
    it('should set the item in the cache', () => {
      const cacheKey = '123abc';
      const contentData: ContentData = {
        contentNodes: [['Component', { some: 'prop' }]],
        debug: { fromCache: true, cacheKey }
      };
      const cache = getSWRCache(cacheOptions);
      cache.set(cacheKey, contentData, 1000);
      expect(cache.get(cacheKey)?.contentNodes).toEqual(contentData.contentNodes);
    });
  });

  describe('getting', () => {
    it('should get the item from the cache with the correct stale flag', () => {
      vi.useFakeTimers();
      cacheOptions.maxFreshSeconds = 1;
      const maxStaleSeconds = 3;
      const cacheKey = '123abc';
      const retrievedAt = new Date().toISOString();
      const contentData: ContentData = {
        contentNodes: [['Component', { some: 'prop' }]],
        debug: { fromCache: true, cacheKey, retrievedAt }
      };
      const cache = getSWRCache(cacheOptions);
      cache.set(cacheKey, contentData, maxStaleSeconds);
      expect(cache.get(cacheKey)?.debug.stale).toBe(false);
      vi.advanceTimersByTime(2 * 1000);
      expect(cache.get(cacheKey)?.debug.stale).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('background revalidation', () => {
    const resolver = vi.fn();

    beforeEach(() => {
      locks.clear();
      resolver.mockClear();
    });

    it('should not call the resolver immediately', async () => {
      vi.useFakeTimers();
      revalidateInBackground('test', resolver);
      expect(resolver).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(resolver).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('does not call the resolver again if the lock is already held', async () => {
      vi.useFakeTimers();
      revalidateInBackground('test', resolver);
      expect(resolver).not.toHaveBeenCalled();
      revalidateInBackground('test', resolver);
      expect(resolver).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(resolver).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('calls the resolver if the lock is released', async () => {
      vi.useFakeTimers();
      revalidateInBackground('test', resolver);
      expect(resolver).not.toHaveBeenCalled();
      await vi.runAllTimersAsync();
      expect(resolver).toHaveBeenCalledTimes(1);
      revalidateInBackground('test', resolver);
      await vi.runAllTimersAsync();
      expect(resolver).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });

  it('removes items from the cache after the max stale seconds', () => {
    vi.useFakeTimers();
    cacheOptions.maxStaleSeconds = 1;
    const cacheKey = '123abc';
    const contentData: ContentData = {
      contentNodes: [['Component', { some: 'prop' }]],
      debug: { fromCache: true, cacheKey }
    };
    const cache = getSWRCache(cacheOptions);
    cache.set(cacheKey, contentData, cacheOptions.maxStaleSeconds);
    expect(cache.get(cacheKey)).toBeDefined();
    vi.advanceTimersByTime((cacheOptions.maxStaleSeconds * 1000) + 100);
    expect(cache.get(cacheKey)).toBeUndefined();
  });
});
