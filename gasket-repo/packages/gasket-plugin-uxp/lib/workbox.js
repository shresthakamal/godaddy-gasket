/// <reference types="@gasket/plugin-workbox" />



/**
 * Parses out URLs for CDN assets.
 *
 * Does not capture style url() for fonts. Only fonts with preload links
 * will be captured for precache.
 * @type {RegExp}
 */
const reAsset = /=\\"(https:)?(\/\/img1\.(\w+-)?wsimg\.com\/[^"\\]+)/g;

/**
 * Some paths parsed may be files with extensions we do not want to precache.
 * @type {RegExp}
 */
const reExt = /(woff2|svg|png|jpg|css|js)$/;

/**
 * Parse Presentation Central manifest for any CDN Urls and return a list
 * of filtered results for precaching.
 * @type {import('./internal').parseCdnAssets}
 */
function parseCdnAssets(manifest) {
  const str = JSON.stringify(manifest.assets);
  const assets = new Set();

  let match = reAsset.exec(str);
  while (match != null) {
    const asset = match[2].trim();
    if (
      // Not all favicons are always used, nor are there version ids in paths
      !asset.includes('favicon') &&
      reExt.test(asset)
    ) {
      assets.add('https:' + asset);
    }
    match = reAsset.exec(str);
  }

  return Array.from(assets);
}

/**
 * Creates the manifest transform function to add assets
 * @type {import('./internal').makeAddCdnAssets}
 */
function makeAddCdnAssets(assets) {
  /**
   * Transforms the manifest by adding CDN assets from Presentation Central
   * @type {import('./internal').addCdnAssets}
   */
  return function addCdnAssets(originalManifest) {
    const manifest = [
      ...originalManifest,
      ...assets.map(a => ({ url: a }))
    ];
    return { manifest };
  };
}

/**
 * Workbox config partial to add next.js static assets to precache
 * @type {import('@gasket/core').HookHandler<'workbox'>}
 */
async function workbox(gasket, config, context) {
  const { req } = context;

  const partial = {
    runtimeCaching: [
      /**
       * Captures the polyfill and any static ux assets which do not have a
       * version identifier in the path. Uses the StaleWhileRevalidate strategy
       * since the most up-to-date resource is not critical for the app.
       * @see https://developers.google.com/web/tools/workbox/modules/workbox-strategies#stale-while-revalidate
       */
      {
        urlPattern: /^https:\/\/img1\.(\w+-)?wsimg\.com\/(ux|poly)\//,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'uxp-runtime'
        }
      },
      /**
       * Captures any warehouse assets and uses CacheFirst strategy.
       * Most (if not all) of these assets should be set to precaching. This
       * is a safeguard in case of non pre-known or dynamic assets requests.
       * @see https://developers.google.com/web/tools/workbox/modules/workbox-strategies#cache_first_cache_falling_back_to_network
       */
      {
        urlPattern: /^https:\/\/img1\.(\w+-)?wsimg\.com\/wrhs-assets\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'wrhs-runtime'
        }
      }]
  };

  if (req) {
    const pc = await gasket.actions.getPresentationCentral(req);
    partial.manifestTransforms = [
      makeAddCdnAssets(parseCdnAssets(pc.data))
    ];
  }

  return partial;
}

export {
  workbox,
  parseCdnAssets
};
