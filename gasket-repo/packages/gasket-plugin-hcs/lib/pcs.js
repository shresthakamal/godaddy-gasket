import queryString from 'querystring';
import get from 'lodash.get';
import fetch from '@gasket/fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import memory from './cache/memory.js';
import fetchWithCacheSingleton from './cache/fetch-with-cache-singleton.js';
import { DEFAULT_MAX_AGE,
  DEFAULT_MAX_NUMBER_OF_ITEMS,
  DEFAULT_MAX_STALENESS
} from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * PCS hook
 * @type {import('./internal').fetchPCS}
 * @private
 */
export default async function fetchPCS(gasket, params) {
  const hcsConfig = get(gasket, 'config.hcs');
  const {
    pcsOverrideQuery = {},
    hivemind = {},
    useOutOfBandCache,
    maxAge = useOutOfBandCache ? DEFAULT_MAX_AGE * 1000 : DEFAULT_MAX_AGE,
    fsCachePath = path.join(__dirname, '.hcs-cache'),
    memoryCacheMax = DEFAULT_MAX_NUMBER_OF_ITEMS,
    maxStaleness = useOutOfBandCache ? DEFAULT_MAX_STALENESS * 1000 : DEFAULT_MAX_STALENESS
  } = hcsConfig;
  // check for cluster-local address set by HCS helm chart
  const { PCS_HOST } = process.env; // eslint-disable-line no-process-env
  const pcsUrl = PCS_HOST || hcsConfig.pcsUrl;

  if (!pcsUrl) {
    throw new Error('gasket.js is missing hcs.pcsUrl and PCS_HOST is not set');
  }

  const cachingModule = hcsConfig.cachingModule || memory;

  const { appKey, ...passedQueryParams } = params;
  /** @type {import('.').QueryParams} */
  const query = { ...passedQueryParams, ...pcsOverrideQuery };

  if (hivemind && Array.isArray(hivemind.labels) && hivemind.labels.length > 0) {
    query.hivemind = hivemind.labels.join(',');
  }

  const pcsFullUrl = `${pcsUrl}/${appKey}?${queryString.stringify(query)}`;

  const fetchWithCache = await fetchWithCacheSingleton({
    cachingModule,
    fetch,
    fsCachePath,
    maxAge,
    maxStaleness,
    memoryCacheMax,
    useOutOfBandCache
  });

  return fetchWithCache(pcsFullUrl);
}
