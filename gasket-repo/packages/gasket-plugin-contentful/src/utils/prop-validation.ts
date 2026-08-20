import { z } from 'zod';
import type { ClientOptions, ContentfulConfig, CacheOptions } from '../types.js';
import { CACHE_STRATEGY } from '../types.js';

const ClientOptionsSchema: z.ZodType<ClientOptions> = z.object({
  spaceKey: z.string(),
  isPreview: z.boolean().optional(),
  environment: z.string().optional(),
  overrides: z.record(z.any()).optional(),
  withAllLocales: z.boolean().optional(),
  enablePagination: z.boolean().optional(),
  /** @deprecated Use cacheOptions.cacheTransformed instead */
  cacheTransformed: z.boolean().optional(),
  /** @deprecated Use cacheOptions.cacheKeyExtensions instead */
  cacheKeyExtensions: z.record(z.any()).optional(),
  /** @deprecated Use cacheOptions.dangerouslyCachePreview instead */
  dangerouslyCachePreview: z.boolean().optional()
});

export function validateClientOptions(clientOptions: unknown, contentfulConfig: ContentfulConfig): ClientOptions {
  const spaceKeys = Object.keys(contentfulConfig.spaces);
  try {
    const parsedOptions = ClientOptionsSchema.parse(clientOptions);
    if (!parsedOptions.spaceKey || !spaceKeys.includes(parsedOptions.spaceKey)) {
      throw new Error(`contentful: invalid space key. Must be one of: ${spaceKeys.join(', ')}`);
    }
    if (parsedOptions.isPreview && !contentfulConfig.spaces[parsedOptions.spaceKey].previewToken) {
      throw new Error('contentful: preview token is required to use Preview API');
    }
    return parsedOptions;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(`contentful: invalid client options:\n${JSON.stringify(error.errors, null, 2)}`);
    }
    throw error;
  }
}

function reassignDeprecatedOptions(clientOptions: ClientOptions, cacheOptions: Record<string, any>) {
  const mergedCacheOptions = structuredClone(cacheOptions);
  if (clientOptions.cacheKeyExtensions) {
    mergedCacheOptions.cacheKeyExtensions ??= clientOptions.cacheKeyExtensions;
  }

  if (clientOptions.cacheTransformed) {
    mergedCacheOptions.cacheTransformed ??= clientOptions.cacheTransformed;
  }

  if (clientOptions.dangerouslyCachePreview) {
    mergedCacheOptions.dangerouslyCachePreview ??= clientOptions.dangerouslyCachePreview;
  }
  return mergedCacheOptions;
}

const BaseCacheOptionsSchema = z.object({
  cacheTransformed: z.boolean().optional(),
  cacheKeyExtensions: z.record(z.any()).optional(),
  dangerouslyCachePreview: z.boolean().optional(),
  dangerouslyAllowMutation: z.boolean().optional()
});

const CacheOptionsSchema: z.ZodType<CacheOptions> = z.union([
  BaseCacheOptionsSchema.extend({
    strategy: z.literal(CACHE_STRATEGY.NO_STALE),
    ttl: z.number().optional()
  }).refine(
    (data) => !('maxStaleSeconds' in data) && !('maxFreshSeconds' in data),
    {
      message: 'maxStaleSeconds and maxFreshSeconds are not allowed when strategy is NO_STALE',
      path: ['maxStaleSeconds']
    }
  ),
  BaseCacheOptionsSchema.extend({
    strategy: z.literal(CACHE_STRATEGY.STALE_WHILE_REVALIDATE),
    maxFreshSeconds: z.number().optional(),
    maxStaleSeconds: z.number().optional()
  }).refine(
    (data) => {
      if (data.maxFreshSeconds != null && data.maxStaleSeconds != null) {
        return data.maxStaleSeconds > data.maxFreshSeconds;
      }
      return true;
    },
    {
      message: 'maxStaleSeconds must be greater than maxFreshSeconds',
      path: ['maxStaleSeconds']
    }
  )
]);

export function validateCacheOptions(cacheOptions: unknown, clientOptions: ClientOptions) {

  cacheOptions ??= { strategy: CACHE_STRATEGY.NO_STALE };
  if (typeof cacheOptions !== 'object' || cacheOptions == null) {
    throw new Error('contentful: cache options must be an object');
  }

  const mergedCacheOptions = reassignDeprecatedOptions(clientOptions, cacheOptions);

  try {
    CacheOptionsSchema.parse(mergedCacheOptions);
    return mergedCacheOptions as CacheOptions;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new Error(`contentful: invalid cache options:\n${JSON.stringify(error.errors, null, 2)}`);
    }
    throw error;
  }
}
