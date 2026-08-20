import { elemBuilder, ensureStringValues } from './utils.js';

/**
 * Moves js to a deferJs property and removes preload js from hints. This
 * informs the document to render the js scripts in the head with `defer`
 * attribute.
 * @type {import('./internal').setupDeferManifest}
 */
export function setupDeferManifest(pcData) {
  const { hints, js, ...restData } = pcData;

  const {
    // eslint-disable-next-line no-unused-vars
    js: preloadJs,
    ...restPreload
  } = hints?.preload || {};

  return {
    ...restData,
    hints: {
      ...hints,
      preload: restPreload
    },
    deprecatedDeferJs: js
  };
}

/**
 * Extracts specific PC properties from the V3 response and organizes them into
 * a v2 format
 * @type {import('./internal').normalizeManifest}
 */
export function normalizeManifest(data) {
  const {
    browserDeprecation = '',
    hints = {},
    css = '',
    favicons = '',
    config = '',
    components = '',
    hydrate = '',
    deferjs = '',
    js = ''
  } = data;

  const faviconLink =
    (typeof favicons !== 'string' && favicons.links) || favicons;

  /**
   * scripts to load in lower part of body
   * @type {string}
   */
  const globals =
    (typeof config !== 'string' &&
      [config.setup, config.hcs, config.hivemind, config.tealium]
        .filter(Boolean)
        .join('')) ||
    config;

  /** @type {import('.').PcContentData} */
  const results = {
    hints: ensureStringValues(hints),
    assets: {
      css: [
        browserDeprecation,
        elemBuilder(css, 'link'),
        elemBuilder(faviconLink, 'link'),
        elemBuilder(favicons.meta, 'meta')
      ].join(''),
      js: elemBuilder(js, 'script')
    },
    header: components.header || components,
    footer: components.footer || components,
    loaders: hydrate,
    globals
  };

  if (deferjs) {
    results.assets.deferjs = elemBuilder(deferjs, 'script');
  }

  return results;
}
