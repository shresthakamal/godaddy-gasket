/* eslint-disable no-undefined, @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Gasket } from '@gasket/core';
import { getContentfulEntries } from '../../src/actions/get-contentful-entries.js';
import contentPlugin, { ContentTransform, ContentData, ContentContext } from '@godaddy/gasket-plugin-content';
import mockPageEntry from '../fixtures/mock-page-entry.json' with { type: 'json' };
import mockContentNodes from '../fixtures/mock-content-nodes.json' with { type: 'json' };
import type { Props } from '../../src/types.js';
import * as client from '../../src/utils/client.js';
import { cache as NoStaleCache } from '../../src/cache/no-stale.js';
import { cache as SWRCache } from '../../src/cache/stale-while-revalidate.js';
import { CACHE_STRATEGY } from '../../src/types.js';

// import for type declarations
import './../../src/configure.js';
import './../../src/types.js';

const mockDebug = {
  client: {
    space: '123',
    environment: 'master',
    host: 'cdn.contentful.com'
  },
  errors: [],
  queries: [
    {
      content_type: 'page',
      limit: 1,
      include: 10
    }
  ]
};

const mockCrossSpaceSourceConfig = {
  crossSpaceSource: true,
  space: '123',
  mainEnvironment: 'master',
  deliveryToken: 'delivery123',
  previewToken: 'preview456'
};

const getEntriesSpy = vi.spyOn(client, 'getEntries').mockResolvedValue({
  entries: [mockPageEntry] as any,
  debug: mockDebug
});

const mockEmptyConfig: Gasket = {
  // @ts-expect-error
  config: {}
};

describe('actions.getContentfulEntries', () => {
  let mockGasket: Gasket;
  let mockProps: Props & { cacheOptions: NonNullable<Props['cacheOptions']> };
  const mockTransform = {
    name: 'test-transform',
    handler: vi.fn().mockImplementation((_gasket, contentNodes) => Promise.resolve(contentNodes))
  };
  const mockOtherTransform = {
    name: 'other-transform',
    handler: vi.fn().mockImplementation((_gasket, contentNodes) => Promise.resolve(contentNodes))
  };

  beforeEach(() => {
    getEntriesSpy.mockClear();
    NoStaleCache.flushAll();
    mockProps = {
      clientOptions: {
        spaceKey: 'primary'
      },
      query: {
        'sys.id': '123',
        'include': 10
      },
      cacheOptions: {
        strategy: CACHE_STRATEGY.NO_STALE
      }
    };
    mockGasket = {
      trace: vi.fn(),
      isReady: vi.fn().mockResolvedValue(true),
      execWaterfall: vi.fn().mockResolvedValue(mockContentNodes),
      plugins: [],
      root: '/path/to/root',
      config: {
        env: 'local',
        contentful: {
          spaces: {
            primary: {
              space: '123',
              mainEnvironment: 'master',
              deliveryToken: 'delivery123',
              previewToken: 'preview456'
            }
          }
        }
      },
      actions: {
        getVisitor: vi.fn(),
        getMetadata: vi.fn(),
        getContentfulEntries
      },
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
    } as unknown as Gasket;

    // Create a spy that calls through to the actual getTransformedContent function
    // Gasket actions are called without gasket param, but the actual function needs it
    const actualGetTransformedContent = contentPlugin.actions?.getTransformedContent;
    mockGasket.actions.getTransformedContent = vi.fn((
      transforms: ContentTransform[],
      contentData: ContentData,
      context: ContentContext
    ) => {
      if (actualGetTransformedContent) {
        return actualGetTransformedContent(mockGasket, transforms, contentData, context);
      }
      return Promise.resolve(contentData);
    });
  });

  it('throws on missing "contentful" configuration', async () => {
    await expect(getContentfulEntries(mockEmptyConfig, mockProps, {})).rejects.toThrow();
  });

  it('calls getEntries with when supplied valid props', async () => {
    await getContentfulEntries(mockGasket, mockProps, {});
    expect(getEntriesSpy).toHaveBeenCalled();
  });

  describe('clientOptions', () => {
    it('does not call getEntries if query or clientOptions are invalid', async () => {
      // @ts-expect-error
      mockProps.clientOptions.spaceKey = undefined;
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err) {
        // ignore
      }
      expect(getEntriesSpy).not.toHaveBeenCalled();
    });

    it('throws if client options are invalid', async () => {
      // @ts-expect-error
      mockProps.clientOptions.spaceKey = undefined;
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err: any) {
        expect(err.message).toMatch(/invalid client options/);
      }
    });

    it('throws if client options spaceKey is not in config', async () => {
      mockProps.clientOptions.spaceKey = 'secondary';
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err: any) {
        expect(err.message).toMatch(/space key/);
      }
    });

    it('allows overrides', async () => {
      mockProps.clientOptions.overrides = {
        space: 'override-space'
      };
      await getContentfulEntries(mockGasket, mockProps, {});
      const callArgs = getEntriesSpy.mock.calls[0];
      expect(callArgs).toContainEqual(
        expect.objectContaining({
          space: 'override-space',
          host: 'cdn.contentful.com',
          environment: 'master',
          accessToken: 'delivery123'
        })
      );
    });

    it('does not override cross space header', async () => {
      mockGasket.config.contentful.spaces.cross = mockCrossSpaceSourceConfig;
      mockProps.clientOptions.overrides = {
        headers: {
          'X-Contentful-Resource-Resolution': 'cross-space-token'
        }
      };
      await getContentfulEntries(mockGasket, mockProps, {});
      const callArgs = getEntriesSpy.mock.calls[0];
      expect(callArgs).not.toContainEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Contentful-Resource-Resolution': 'cross-space-token'
          })
        })
      );
    });
  });

  describe('cacheOptions', () => {
    it('does not call getEntries if cacheOptions are invalid', async () => {
      mockProps.cacheOptions = {
        // @ts-expect-error - type is invalid, but we want to test the error message
        strategy: 'invalid'
      };
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err) {
        // ignore
      }
      expect(getEntriesSpy).not.toHaveBeenCalled();
    });

    it('throws if cacheOptions are invalid', async () => {
      mockProps.cacheOptions = {
        // @ts-expect-error - type is invalid, but we want to test the error message
        strategy: 'invalid'
      };
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err: any) {
        expect(err.message).toMatch(/invalid cache options/);
      }
    });

    it('throws if maxStaleSeconds is provided when strategy is NO_STALE', async () => {
      mockProps.cacheOptions = {
        strategy: CACHE_STRATEGY.NO_STALE,
        // @ts-expect-error - type is invalid, but we want to test the error message
        maxStaleSeconds: 10
      };
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err: any) {
        expect(err.message).toMatch(/maxStaleSeconds/);
        expect(err.message).toMatch(/NO_STALE/);
      }
    });

    it('throws if maxStaleSeconds is less than maxFreshSeconds', async () => {
      mockProps.cacheOptions = {
        strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE,
        maxFreshSeconds: 10,
        maxStaleSeconds: 5
      };
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err: any) {
        expect(err.message).toMatch(/maxStaleSeconds/);
        expect(err.message).toMatch(/maxFreshSeconds/);
      }
    });
  });

  describe('caching', () => {
    describe('no-stale cache (default strategy)', () => {
      beforeEach(() => {
        mockProps.cacheOptions = {
          strategy: CACHE_STRATEGY.NO_STALE
        };
        mockTransform.handler.mockClear();
        getEntriesSpy.mockClear();
      });

      it('does not call getEntries if cached', async () => {
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);

        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});

        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        expect(firstResult.contentNodes).toStrictEqual(secondResult.contentNodes);
      });

      it('does not cache if isPreview is true', async () => {
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);
        mockProps.clientOptions.isPreview = true;

        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);

        expect(firstResult.contentNodes).toStrictEqual(secondResult.contentNodes);
      });

      it('caches preview content when dangerouslyCachePreview is true', async () => {
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);
        mockProps.clientOptions.isPreview = true;
        mockProps.cacheOptions.dangerouslyCachePreview = true;

        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        expect(firstResult.contentNodes).toStrictEqual(secondResult.contentNodes);
        expect(secondResult.debug.fromCache).toBe(true);
      });

      it('does not cache preview content when dangerouslyCachePreview is false', async () => {
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);
        mockProps.clientOptions.isPreview = true;
        mockProps.cacheOptions.dangerouslyCachePreview = false;

        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);

        expect(firstResult.contentNodes).toStrictEqual(secondResult.contentNodes);
        expect(secondResult.debug.fromCache).toBe(false);
      });

      it('caches non-preview content regardless of dangerouslyCachePreview value', async () => {
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);
        mockProps.clientOptions.isPreview = false;
        mockProps.cacheOptions.dangerouslyCachePreview = false;

        await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        NoStaleCache.flushAll();
        mockProps.cacheOptions.dangerouslyCachePreview = true;

        await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);

        await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);
      });

      it('creates different cache keys for different dangerouslyCachePreview values', async () => {
        mockProps.clientOptions.isPreview = true;
        mockProps.cacheOptions.dangerouslyCachePreview = true;

        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});
        const firstCacheKey = firstResult.debug.cacheKey;

        mockProps.cacheOptions.dangerouslyCachePreview = false;
        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        const secondCacheKey = secondResult.debug.cacheKey;

        expect(firstCacheKey).not.toEqual(secondCacheKey);
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);
      });

      it('retains debug data from cache', async () => {
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);

        const { debug: firstDebug }  = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        const { debug: secondDebug } = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);

        expect(firstDebug.retrievedAt).toBeDefined();
        expect(secondDebug.retrievedAt).toBeDefined();
        expect(firstDebug).toStrictEqual({ ...secondDebug, fromCache: expect.any(Boolean) });
        expect(firstDebug.fromCache).toBe(false);
        expect(secondDebug.fromCache).toBe(true);
      });

      it('varies cache key by transforms if cacheTransformed is true', async () => {
        mockProps.cacheOptions.cacheTransformed = true;
        const firstProps = { ...mockProps, transforms: [mockTransform] };
        const firstResult = await getContentfulEntries(mockGasket, firstProps, {});
        const secondProps = { ...mockProps, transforms: [mockTransform] };
        const secondResult = await getContentfulEntries(mockGasket, secondProps, {});
        expect(firstResult.debug.cacheKey).toEqual(secondResult.debug.cacheKey);
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        const thirdProps = { ...mockProps, transforms: [mockTransform, mockOtherTransform] };
        const thirdResult = await getContentfulEntries(mockGasket, thirdProps, {});
        expect(firstResult.debug.cacheKey).not.toEqual(thirdResult.debug.cacheKey);
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);
      });

      it('does not vary cache key by transforms if cacheTransformed is false', async () => {
        mockProps.cacheOptions.cacheTransformed = false;
        const firstProps = { ...mockProps, transforms: [mockTransform] };
        const firstResult = await getContentfulEntries(mockGasket, firstProps, {});
        const secondProps = { ...mockProps, transforms: [mockTransform, mockOtherTransform] };
        const secondResult = await getContentfulEntries(mockGasket, secondProps, {});
        expect(firstResult.debug.cacheKey).toEqual(secondResult.debug.cacheKey);
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
      });

      it('transforms for each call if cacheTransformed is false', async () => {
        mockProps.cacheOptions.cacheTransformed = false;
        const firstProps = { ...mockProps, transforms: [mockTransform] };
        await getContentfulEntries(mockGasket, firstProps, {});
        expect(mockTransform.handler).toHaveBeenCalledTimes(1);
        const secondProps = { ...mockProps, transforms: [mockTransform] };
        await getContentfulEntries(mockGasket, secondProps, {});
        expect(mockTransform.handler).toHaveBeenCalledTimes(2);
      });
    });

    describe('stale-while-revalidate cache (STALE_WHILE_REVALIDATE strategy)', () => {
      beforeEach(() => {
        SWRCache.flushAll();
        mockTransform.handler.mockClear();
        getEntriesSpy.mockClear();
        mockProps.transforms = [mockTransform];
        mockProps.cacheOptions = { strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE };
      });

      it('does not call getEntries if cached', async () => {
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);
        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        expect(firstResult.contentNodes).toStrictEqual(secondResult.contentNodes);
      });

      it('calls getEntries in the background if cached result is stale (cacheTransformed = false)', async () => {
        vi.useFakeTimers();
        const BUFFER_MS = 500;
        const MOCK_FRESH_MS = 1000;
        const MOCK_STALE_MS = 2000;
        mockProps.cacheOptions = {
          strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE,
          maxFreshSeconds: MOCK_FRESH_MS / 1000,
          maxStaleSeconds: MOCK_STALE_MS / 1000,
          cacheTransformed: false
        };

        // first invocation should call getEntries
        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        expect(mockTransform.handler).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(MOCK_FRESH_MS + BUFFER_MS);

        // second invocation should not call getEntries because the cache is still fresh
        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(secondResult.debug.stale).toBe(true);
        expect(firstResult.contentNodes).toStrictEqual(secondResult.contentNodes);
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        expect(mockTransform.handler).toHaveBeenCalledTimes(2);

        // cache should revalidate in the background and call getEntries
        vi.advanceTimersByTime(MOCK_STALE_MS + BUFFER_MS);
        await vi.runOnlyPendingTimersAsync();
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);

        // don't transform again in the background if cacheTransformed is false
        expect(mockTransform.handler).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
      });

      it('calls getEntries and transforms in the background if cacheTransformed is true', async () => {
        vi.useFakeTimers();
        const BUFFER_MS = 500;
        const MOCK_FRESH_MS = 1000;
        const MOCK_STALE_MS = 2000;
        mockProps.cacheOptions = {
          strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE,
          maxFreshSeconds: MOCK_FRESH_MS / 1000,
          maxStaleSeconds: MOCK_STALE_MS / 1000,
          cacheTransformed: true
        };

        // first invocation should call getEntries
        expect(getEntriesSpy).toHaveBeenCalledTimes(0);
        const firstResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        expect(mockTransform.handler).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(MOCK_FRESH_MS + BUFFER_MS);

        // second invocation should return stale cache without calling getEntries
        const secondResult = await getContentfulEntries(mockGasket, mockProps, {});
        expect(secondResult.debug.stale).toBe(true);
        expect(firstResult.contentNodes).toStrictEqual(secondResult.contentNodes);
        expect(getEntriesSpy).toHaveBeenCalledTimes(1);
        expect(mockTransform.handler).toHaveBeenCalledTimes(1);

        // cache should revalidate in the background and call getEntries
        vi.advanceTimersByTime(MOCK_STALE_MS + BUFFER_MS);
        await vi.runOnlyPendingTimersAsync();
        expect(getEntriesSpy).toHaveBeenCalledTimes(2);
        expect(mockTransform.handler).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
      });
    });
  });

  describe('querying', () => {
    it('calls getEntries with query', async () => {
      // @ts-ignore
      mockProps.query.locale = 'fr-FR';
      await getContentfulEntries(mockGasket, mockProps, {});
      const callArgs = getEntriesSpy.mock.calls[0];
      expect(callArgs).toContainEqual(mockProps.query);
    });

    it('uses Preview API if isPreview', async () => {
      mockProps.clientOptions.isPreview = true;
      await getContentfulEntries(mockGasket, mockProps, {});
      const callArgs = getEntriesSpy.mock.calls[0];
      expect(callArgs).toContainEqual({
        accessToken: 'preview456',
        environment: 'master',
        host: 'preview.contentful.com',
        space: '123'
      });
    });

    it('throws and does not call getEntries if isPreview without previewToken', async () => {
      mockProps.clientOptions.isPreview = true;
      delete mockGasket.config.contentful.spaces.primary.previewToken;
      try {
        await getContentfulEntries(mockGasket, mockProps, {});
      } catch (err: any) {
        expect(err.message).toMatch(/preview token/);
      }
      expect(getEntriesSpy).toHaveBeenCalledTimes(0);
    });

    it('uses cross space token if crossSpaceSource', async () => {
      mockGasket.config.contentful.spaces.cross = mockCrossSpaceSourceConfig;
      mockProps.clientOptions.spaceKey = 'primary';
      await getContentfulEntries(mockGasket, mockProps, {});
      const callArgs = getEntriesSpy.mock.calls[0];
      expect(callArgs).toContainEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Contentful-Resource-Resolution': expect.any(String)
          })
        })
      );
    });

    it('does not apply current space to cross space reference header', async () => {
      mockGasket.config.contentful.spaces.cross = mockCrossSpaceSourceConfig;
      mockProps.clientOptions.spaceKey = 'cross';
      await getContentfulEntries(mockGasket, mockProps, {});
      const callArgs = getEntriesSpy.mock.calls[0];
      expect(callArgs).not.toContainEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Contentful-Resource-Resolution': expect.any(String)
          })
        })
      );
    });

    it('returns empty array if no entries are found', async () => {
      getEntriesSpy.mockResolvedValueOnce({ entries: [] } as any);
      const { contentNodes } = await getContentfulEntries(mockGasket, mockProps, {});
      expect(contentNodes).toEqual([]);
    });
  });

  describe('transforms', () => {

    beforeEach(() => {
      // @ts-expect-error
      mockGasket.actions.getTransformedContent.mockClear();
    });

    it('does not call getTransformedContent if no transforms are provided', async () => {
      await getContentfulEntries(mockGasket, mockProps, {});
      expect(mockGasket.actions.getTransformedContent).not.toHaveBeenCalled();
    });

    it('calls getTransformedContent if transforms are provided', async () => {
      mockProps.transforms = [mockTransform];
      await getContentfulEntries(mockGasket, mockProps, {});
      expect(mockGasket.actions.getTransformedContent).toHaveBeenCalled();
    });

    it('does not cache getTransformedContent by default', async () => {
      mockProps.transforms = [mockTransform];
      const result1 = await getContentfulEntries(mockGasket, mockProps, {});
      const result2 = await getContentfulEntries(mockGasket, mockProps, {});
      expect(result1.debug.cacheKey).toEqual(result2.debug.cacheKey);
      expect(mockGasket.actions.getTransformedContent).toHaveBeenCalledTimes(2);
    });

    it('caches getTransformedContent if cacheTransformed is true', async () => {
      mockProps.transforms = [mockTransform];
      mockProps.cacheOptions.cacheTransformed = true;
      const result1 = await getContentfulEntries(mockGasket, mockProps, {});
      const result2 = await getContentfulEntries(mockGasket, mockProps, {});
      expect(result1.debug.cacheKey).toEqual(result2.debug.cacheKey);
      expect(mockGasket.actions.getTransformedContent).toHaveBeenCalledTimes(1);
    });

    it('cacheKeyExtensions are included in cache key', async () => {
      mockProps.transforms = [mockTransform];
      mockProps.cacheOptions.cacheTransformed = true;
      mockProps.cacheOptions.cacheKeyExtensions = { market: 'en-US', currency: 'USD' };
      const result1 = await getContentfulEntries(mockGasket, mockProps, {});
      mockProps.cacheOptions.cacheKeyExtensions = { market: 'en-US', currency: 'MXN' };
      const result2 = await getContentfulEntries(mockGasket, mockProps, {});
      expect(result1.debug.cacheKey).not.toEqual(result2.debug.cacheKey);
      expect(mockGasket.actions.getTransformedContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache immutability', () => {
    beforeEach(() => {
      NoStaleCache.flushAll();
      mockTransform.handler.mockClear();
      getEntriesSpy.mockClear();
    });

    const getEntries = (...args: Parameters<typeof getContentfulEntries>) =>
      getContentfulEntries(...args) as Promise<any>;

    it('returns a clone when no transforms are provided', async () => {
      const first = await getEntries(mockGasket, mockProps, {});
      first.contentNodes.push({ mutated: true });
      first.debug.retrievedAt = 'tampered';

      const second = await getEntries(mockGasket, mockProps, {});
      expect(second.contentNodes).not.toContainEqual({ mutated: true });
      expect(second.debug.retrievedAt).not.toBe('tampered');
    });

    it('returns a clone when transforms are provided and cacheTransformed is false', async () => {
      mockProps.transforms = [mockTransform];
      mockProps.cacheOptions.cacheTransformed = false;

      const first = await getEntries(mockGasket, mockProps, {});
      first.contentNodes.push({ mutated: true });

      const second = await getEntries(mockGasket, mockProps, {});
      expect(second.contentNodes).not.toContainEqual({ mutated: true });
    });

    it('returns a clone on cache miss when transforms are provided and cacheTransformed is true', async () => {
      mockProps.transforms = [mockTransform];
      mockProps.cacheOptions.cacheTransformed = true;

      const first = await getEntries(mockGasket, mockProps, {});
      expect(first.debug.fromCache).toBe(false);
      first.contentNodes.push({ mutated: true });

      const second = await getEntries(mockGasket, mockProps, {});
      expect(second.debug.fromCache).toBe(true);
      expect(second.contentNodes).not.toContainEqual({ mutated: true });
    });

    it('returns a clone on cache hit when transforms are provided and cacheTransformed is true', async () => {
      mockProps.transforms = [mockTransform];
      mockProps.cacheOptions.cacheTransformed = true;

      await getEntries(mockGasket, mockProps, {});

      const second = await getEntries(mockGasket, mockProps, {});
      expect(second.debug.fromCache).toBe(true);
      second.contentNodes.push({ mutated: true });

      const third = await getEntries(mockGasket, mockProps, {});
      expect(third.debug.fromCache).toBe(true);
      expect(third.contentNodes).not.toContainEqual({ mutated: true });
    });

    describe('cacheOptions.dangerouslyAllowMutation', () => {
      it('defaults to false', async () => {
        const first = await getEntries(mockGasket, mockProps, {});
        const second = await getEntries(mockGasket, mockProps, {});
        expect(first).not.toBe(second);
        expect(first.contentNodes).not.toBe(second.contentNodes);
      });

      it('returns the same reference when mutable is true and no transforms', async () => {
        mockProps.cacheOptions.dangerouslyAllowMutation = true;

        const first = await getEntries(mockGasket, mockProps, {});
        const second = await getEntries(mockGasket, mockProps, {});
        expect(first.contentNodes).toBe(second.contentNodes);
      });

      it('returns the same reference on cache hit when mutable is true and cacheTransformed is true', async () => {
        mockProps.transforms = [mockTransform];
        mockProps.cacheOptions.cacheTransformed = true;
        mockProps.cacheOptions.dangerouslyAllowMutation = true;

        await getEntries(mockGasket, mockProps, {});

        const second = await getEntries(mockGasket, mockProps, {});
        const third = await getEntries(mockGasket, mockProps, {});
        expect(second.debug.fromCache).toBe(true);
        expect(third.debug.fromCache).toBe(true);
        expect(second.contentNodes).toBe(third.contentNodes);
      });

      it('exposes the cache to mutation when mutable is true', async () => {
        mockProps.cacheOptions.dangerouslyAllowMutation = true;

        const first = await getEntries(mockGasket, mockProps, {});
        first.contentNodes.push({ mutated: true });

        const second = await getEntries(mockGasket, mockProps, {});
        expect(second.contentNodes).toContainEqual({ mutated: true });
      });

      it('does not expose the cache to mutation when mutable is false', async () => {
        mockProps.cacheOptions.dangerouslyAllowMutation = false;

        const first = await getEntries(mockGasket, mockProps, {});
        first.contentNodes.push({ mutated: true });

        const second = await getEntries(mockGasket, mockProps, {});
        expect(second.contentNodes).not.toContainEqual({ mutated: true });
      });
    });
  });

  describe('returns', () => {
    it('returns expected actions.getContentfulEntries signature', async () => {
      const results = await getContentfulEntries(mockGasket, mockProps, {});

      const keys = [
        'debug',
        'contentNodes'
      ];

      for (const key of keys) {
        expect(results).toHaveProperty(key);
      }
    });

    it('returns transformed content nodes', async () => {
      const contentData = await getContentfulEntries(mockGasket, mockProps, {});
      expect(contentData.contentNodes).toEqual([mockContentNodes]);
    });

    it('returns raw entries if enableSnapshots is true', async () => {
      const mockContext = { enableSnapshots: true };
      const contentData = await getContentfulEntries(mockGasket, mockProps, mockContext);
      expect(contentData.debug.rawEntries).toEqual([mockPageEntry]);
    });
  });
});
