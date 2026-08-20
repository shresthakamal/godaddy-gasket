/// <reference types="@gasket/plugin-logger" />

import Cache from 'out-of-band-cache';
import path from 'path';
import { Request } from 'wrhs';
import { DEFAULT_VARIANTS, DEFAULT_TTL } from './constants.js';

/** @typedef {import('./internal').WrhsObjectVariant} WrhsObjectVariant  */

/* eslint-disable no-process-env */
const {
  WRHS_USERNAME,
  WRHS_PASSWORD,
  WRHS_ENDPOINT
} = process.env;
/* eslint-enable no-process-env */

let cache;

/**
 * @type {import('./internal').getWrhsDataGetter}
 */
export function getWrhsDataGetter({ client, name, acceptedVariants, env, version }) {
  return async function () {
    /** @type {WrhsObjectVariant | WrhsObjectVariant[]} */
    const variant = await client.get(`/objects/${encodeURIComponent(name)}`, {
      accepted_variants: acceptedVariants,
      env,
      version
    });
    return variant;
  };
}

/**
 * Fetch assets from Warehouse based on the package version.
 * @type {import('./internal').wrhsAssets}
 */
export default async function wrhsAssets(gasket, wrhsReqs = []) {

  cache =
    cache ||
    new Cache({
      maxAge: DEFAULT_TTL,
      fsCachePath:
        gasket.config.wrhs?.fsCachePath ||
        path.join(gasket.config.root, '.wrhs-cache')
    });

  const { baseUrl, username, password } = gasket.config?.wrhs || {};
  const client =
    gasket.wrhs ||
    new Request({
      baseUrl: baseUrl || WRHS_ENDPOINT,
      username: username || WRHS_USERNAME,
      password: password || WRHS_PASSWORD
    });

  /** @type {(WrhsObjectVariant | null)[]} */
  const variants = await Promise.all(
    wrhsReqs.map(async (wrhsReq) => {
      let { ttl = DEFAULT_TTL } = wrhsReq;
      const {
        name,
        env = gasket.config.env || 'development',
        version,
        acceptedVariants = DEFAULT_VARIANTS
      } = wrhsReq;
      const variantsStr = acceptedVariants.join(',');
      const key = `${name}_${env}_${version}_${variantsStr}`;

      if (ttl === -1) {
        ttl = 365 * 24 * 60 * 60 * 1000; // Cache for 365 days (one year)
      }

      try {
        const { value: variant, fromCache = false } = await cache.get(
          key,
          { maxAge: ttl, skipCache: ttl === 0 },
          getWrhsDataGetter({
            client,
            name,
            acceptedVariants: variantsStr,
            version,
            env
          })
        );

        if (fromCache) {
          gasket.logger.info(`wrhs request for ${key} resolved from cache`);
        }

        // Be extra safe in case API changes in the future
        if (Array.isArray(variant)) {
          const [v] = variant;
          return v;
        }

        /** @type {WrhsObjectVariant} */
        return variant;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const status = err?.statusCode ?? err?.status ?? err?.response?.status;
        if (status === 404 || /\b404\b/.test(message)) {
          gasket.logger.warn(`wrhs: no assets found for ${key}: ${message}`);
        } else {
          gasket.logger.error(`wrhs: unexpected error fetching assets for ${key}: ${message}`);
        }
        return null;
      }
    })
  );

  return variants.filter(/** @returns {v is WrhsObjectVariant} */ (v) => v != null).reduce((acc, variant) => {
    acc[variant.name] = variant.data;
    return acc;
  }, {});
}
