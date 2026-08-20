import type { CreateClientParams } from 'contentful';
import type { ActionHandler } from '@gasket/core';
import { ContentData } from '@godaddy/gasket-plugin-content';
import { CustomClientParams, CACHE_STRATEGY, SpaceConfig, CacheOptions } from '../types.js';

import { getEntries } from '../utils/client.js';
import { getClientParams } from '../utils/get-client-params.js';
import { getCacheHitMessage, getCacheMissMessage } from '../utils/get-cache-message.js';
import { validateClientOptions, validateCacheOptions } from '../utils/prop-validation.js';

import { toContentNodes } from '../transforms/to-content-nodes.js';

import { getCacheKey } from '../cache/utils.js';
import { getCacheByOptions } from '../cache/index.js';
import { type Resolver, revalidateInBackground, DEFAULT_MAX_STALE_SECONDS } from '../cache/stale-while-revalidate.js';

const DEFAULT_TTL_SECONDS = 120;
function getTTL(cacheOptions: CacheOptions, spaceConfig: SpaceConfig): number {
  const { strategy } = cacheOptions;
  if (strategy === CACHE_STRATEGY.NO_STALE) {
    return cacheOptions.ttl ?? spaceConfig.cacheTTL ?? DEFAULT_TTL_SECONDS;
  }
  if (strategy === CACHE_STRATEGY.STALE_WHILE_REVALIDATE) {
    return cacheOptions.maxStaleSeconds ?? DEFAULT_MAX_STALE_SECONDS;
  }
  return spaceConfig.cacheTTL ?? DEFAULT_TTL_SECONDS;
}

// eslint-disable-next-line complexity, max-statements
export const getContentfulEntries: ActionHandler<'getContentfulEntries'> = async (gasket, props, context) => {
  await gasket.isReady;
  const { contentful } = gasket.config;
  if (!contentful) throw new Error('contentful: missing gasket config object - "contentful"');

  const { query, transforms = [] } = props;

  const clientOptions = validateClientOptions(props.clientOptions, contentful);
  const { spaceKey, isPreview = false } = clientOptions;

  const spaceConfig = contentful.spaces[spaceKey];

  const cacheOptions = validateCacheOptions(props.cacheOptions, clientOptions);
  const { strategy, cacheTransformed, dangerouslyCachePreview = false, dangerouslyAllowMutation = false } = cacheOptions;

  const cache = getCacheByOptions(cacheOptions);
  const cacheKey = getCacheKey(cacheTransformed ? props : { clientOptions, cacheOptions, query });
  const ttl = getTTL(cacheOptions, spaceConfig);
  const isCacheAllowed = !isPreview || (isPreview && dangerouslyCachePreview);

  let contentData: ContentData | undefined;

  if (isCacheAllowed) {
    contentData = cache.get(cacheKey);
    if (contentData) {
      const message = getCacheHitMessage(cacheTransformed, strategy, contentData);
      gasket.trace(message);
      contentData.debug.fromCache = true;
    } else {
      const message = getCacheMissMessage(strategy);
      gasket.trace(message);
    }
  }

  const isStale: boolean = (strategy === CACHE_STRATEGY.STALE_WHILE_REVALIDATE && contentData?.debug.stale) ?? false;

  const resolver: Resolver<ContentData> = async (isRunningInBackground = false) => {
    if (!contentData || (isStale && isRunningInBackground)) {
      const clientParams: CreateClientParams = getClientParams(contentful, clientOptions);

      const customClientParams: CustomClientParams = {
        withAllLocales: !!clientOptions.withAllLocales,
        enablePagination: !!clientOptions.enablePagination
      };

      const { debug, entries } = await getEntries(gasket, clientParams, customClientParams, query);

      contentData = {
        debug: {
          ...debug,
          retrievedAt: new Date().toISOString(),
          fromCache: false,
          stale: false,
          cacheKey
        },
        contentNodes: toContentNodes(entries, spaceConfig.contentSettings, gasket.logger)
      };

      if (context.enableSnapshots) {
        contentData.debug.rawEntries = entries;
      }

      if (isCacheAllowed && !cacheTransformed) {
        cache.set(cacheKey, contentData, ttl);
      }
    }

    const transformWouldBeWasted = (!cacheTransformed && isRunningInBackground);
    if (transforms.length === 0 || transformWouldBeWasted) {
      return dangerouslyAllowMutation ? contentData : structuredClone(contentData);
    }

    const transformed = await gasket.actions.getTransformedContent(transforms, contentData, context);
    if (isCacheAllowed && cacheTransformed) {
      cache.set(cacheKey, transformed, ttl);
      return dangerouslyAllowMutation ? transformed : structuredClone(transformed);
    }
    return transformed;
  };

  if (contentData && isStale) {
    revalidateInBackground(cacheKey, resolver);
  }

  if (cacheTransformed && contentData?.debug?.fromCache) {
    return dangerouslyAllowMutation ? contentData : structuredClone(contentData);
  }

  return resolver();
};
