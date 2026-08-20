import set from 'lodash.set';
import get from 'lodash.get';
import { default as produce } from 'immer';
import mimeTypes from 'mime-types';
import isObject from 'lodash.isobject';
import transform from 'lodash.transform';

import { makeGetHashFunc, isSimpleTag, getHostName } from './utils.js';

/**
 * Factory function to create asset manager instance
 * @type {import('./internal').createAssetManager}
 */
// eslint-disable-next-line max-statements
const createAssetManager = (options) => {
  const { memoize = true } = options || {};

  /** @type {import('./internal').Asset[]} */
  const assets = [];
  /** @type {import('./internal').JavascriptChunk[]} */
  const chunks = [];

  /**
   * Insert or push an asset to the assetStack.
   * @type {import('./internal').AddAsset}
   */
  function addAsset(asset, prepend = false) {
    prepend === true ? assets.unshift(asset) : assets.push(asset);
  }

  /**
   * Factory function to create asset factory
   * @type {import('./internal').makeAssetFactory}
   */
  function makeAssetFactory(config) {
    const {
      dataPath,
      tagName,
      defaultProps = {},
      requiredProps = []
    } = config || {};

    if (!dataPath || !tagName) {
      throw new Error(`${!dataPath ? 'dataPath' : 'tagName'} is required`);
    }

    return function makeAsset(props = {}) {
      requiredProps.forEach(function (prop) {
        if (!props[prop]) {
          throw new Error(`'${prop}' is a required attribute`);
        }
      });

      return { path: dataPath, tagName, ...defaultProps, ...props };
    };
  }

  /**
   * Shorthand to createMethod with isContentMethod=false
   * @type {import('./internal').createTagMethod}
   */
  function createTagMethod(config) {
    const makeAsset = makeAssetFactory(config);

    return function withTag(props = {}, withTagOptions = {}) {
      const { prepend = false } = withTagOptions;
      const asset = makeAsset(props);
      addAsset(asset, prepend);
    };
  }

  /**
   * Shorthand to createMethod with isContentMethod=true
   * @type {import('./internal').createContentMethod}
   */
  function createContentMethod(config) {
    const makeAsset = makeAssetFactory(config);

    return function withContent(innerHTML, props = {}, assetOptions = {}) {
      const { prepend = false } = assetOptions;
      const asset = makeAsset({ ...props, innerHTML });
      addAsset(asset, prepend);
    };
  }

  /**
   * Merges tracked calls to asset creation methods with an existing raw manifest
   * @type {import('./internal').merge}
   */
  function merge(manifest = {}) {
    return produce(manifest, (draftManifest) =>
      assets.reduce((result, asset) => {
        const { path, tagName, ...props } = asset;
        const existingEntry = get(result, path);
        const newEntry = { tagName, ...props };

        // if already an array, push to it
        if (Array.isArray(existingEntry)) {
          existingEntry.push(newEntry);
          set(result, path, existingEntry);
          // if any other valid value, make it an array
        } else if (existingEntry !== void 0 && existingEntry != null) {
          set(result, path, [existingEntry, newEntry]);
          // path is pristine, just create it
        } else {
          set(result, path, newEntry);
        }

        return result;
      }, draftManifest)
    );
  }

  // -------------------------
  // Hints
  // -------------------------

  /**
   * Registers a prefetch hint in the manifest
   */
  const addPrefetchHint = createTagMethod({
    dataPath: 'hints.prefetch',
    tagName: 'link',
    defaultProps: { rel: 'prefetch' },
    requiredProps: ['href']
  });

  /**
   * Registers a dns-prefetch hint in the manifest
   */
  const addDnsPrefetchHint = createTagMethod({
    dataPath: 'hints.dnsprefetch',
    tagName: 'link',
    defaultProps: { rel: 'dns-prefetch' },
    requiredProps: ['href']
  });

  /**
   * Registers a preconnect hint in the manifest
   */
  const addPreconnectHint = createTagMethod({
    dataPath: 'hints.preconnect',
    tagName: 'link',
    defaultProps: { rel: 'preconnect' },
    requiredProps: ['href']
  });

  /**
   * Registers a JS preload hint in the manifest
   */
  const addJsPreloadHint = createTagMethod({
    dataPath: 'hints.preload.js',
    tagName: 'link',
    defaultProps: { rel: 'preload', as: 'script' },
    requiredProps: ['href']
  });

  /**
   * Registers a CSS preload hint in the manifest
   */
  const addCssPreloadHint = createTagMethod({
    dataPath: 'hints.preload.css',
    tagName: 'link',
    defaultProps: { rel: 'preload', crossOrigin: 'anonymous', as: 'style' },
    requiredProps: ['href']
  });

  /**
   * Registers a font preload hint in the manifest
   */
  const addFontPreloadHint = createTagMethod({
    dataPath: 'hints.preload.fonts',
    tagName: 'link',
    defaultProps: { rel: 'preload', as: 'font', crossOrigin: 'anonymous' },
    requiredProps: ['href', 'type']
  });

  // -------------------------
  // Scripts
  // -------------------------

  /**
   * Registers an inline script in the manifest
   */
  const addInlineScript = createContentMethod({
    dataPath: 'config.hcs',
    tagName: 'script'
  });

  /**
   * Registers a remote script in the manifest
   * @private
   */
  const addBlockingScript = createTagMethod({
    dataPath: 'js.hcs',
    tagName: 'script',
    requiredProps: ['src']
  });

  /**
   * Registers a deferred remote script in the manifest
   * @private
   */
  const addDeferredScript = createTagMethod({
    dataPath: 'deferjs.hcs',
    tagName: 'script',
    requiredProps: ['src'],
    defaultProps: { defer: true, async: false }
  });

  /**
   * Registers a remote script in the manifest
   * @type {import('./internal').addScript}
   */
  const addScript = (props, opts = {}) => {
    props.crossOrigin ??= 'anonymous';
    opts.deferjs
      ? addDeferredScript(props, opts)
      : addBlockingScript(props, opts);
  };

  // -------------------------
  // Webpack chunks
  // -------------------------

  /**
   * Registers a remote JS chunk in the manifest
   * @type {import('../index').AddChunk}
   */
  const addChunk = ({ name, src }) => {
    chunks.push({ name, src });
  };

  /**
   * Aggregate chunks and add them in the manifest
   * @type {import('./internal').renderChunks}
   */
  const renderChunks = () => {
    if (chunks.length === 0) {
      return;
    }

    const flat = chunks.reduce((acc, chunk) => {
      const safeName = chunk.name.replace(/"/g, '');
      return acc + `"${safeName}": "${encodeURI(chunk.src)}",`;
    }, '');
    const script = `
    ux.data.cdn = {
      ...(ux.data.cdn || {}),
      ${flat}
    }
  `;
    addInlineScript(script);
  };

  // -------------------------
  // CSS
  // -------------------------

  /**
   * Registers an inline CSS in the manifest
   */
  const addInlineCss = createContentMethod({
    dataPath: 'css.hcs',
    tagName: 'style',
    defaultProps: { type: 'text/css' }
  });

  /**
   * Registers a remote stylesheet in the manifest
   */
  const addCss = createTagMethod({
    dataPath: 'css.hcs',
    tagName: 'link',
    defaultProps: { rel: 'stylesheet', media: 'all', crossOrigin: 'anonymous' },
    requiredProps: ['href']
  });

  /**
   * Registers an inline font CSS in the manifest
   */
  const addInlineFontCss = createContentMethod({
    dataPath: 'css.fonts',
    tagName: 'style',
    defaultProps: { type: 'text/css' }
  });

  /**
   * Registers an inline hydrate script in the manifest
   */
  const addHydrateScript = createContentMethod({
    dataPath: 'hydrate',
    tagName: 'script',
    defaultProps: {}
  });

  const hintMethods = {
    addPrefetchHint,
    addDnsPrefetchHint,
    addPreconnectHint,
    addJsPreloadHint,
    addCssPreloadHint,
    addFontPreloadHint
  };

  const scriptMethods = {
    addInlineScript,
    addScript,
    addChunk
  };

  const cssMethods = {
    addInlineCss,
    addCss,
    addInlineFontCss
  };

  /**
   * Returns the internal assets array
   * @type {import('./internal').getAssets}
   */
  const getAssets = () => assets;

  /**
   * Accumulates the CSP hashes in the CSP directives for link tags
   * @type {import('./internal').accumulateCSPScriptDirective}
   * @private
   */
  function accumulateCSPScriptDirective(obj, accumulator) {
    if (obj.innerHTML) {
      const createHash = makeGetHashFunc(memoize);
      const cspHash = createHash(obj.innerHTML);
      accumulator.scripts.add(cspHash);
    } else if (obj.src) {
      const hostname = getHostName(obj.src);
      if (hostname) {
        accumulator.scripts.add(hostname);
      }
    }
  }

  /**
   * Accumulates the CSP hashes in the CSP directives for script tags
   * @type {import('./internal').accumulateCSPLinkDirective}
   * @private
   */
  function accumulateCSPLinkDirective(obj, accumulator) {
    const hostname = getHostName(obj.href);

    if (!hostname) {
      return; // don't add empty strings
    }

    const mimeType = mimeTypes.lookup(obj.href) || '';

    if (mimeType === 'text/css') {
      accumulator.styles.add(hostname);
    } else if (mimeType.startsWith('image/')) {
      accumulator.images.add(hostname);
    } else if (mimeType.startsWith('font/')) {
      accumulator.fonts.add(hostname);
    } else {
      accumulator.default.add(hostname);
    }
  }

  /**
   * Accumulates the CSP hashes in the appropriate CSP directives
   * @type {import('./internal').accumulateCSPDirective}
   * @private
   */
  function accumulateCSPDirective(obj, accumulator) {
    if (obj.tagName === 'script') {
      accumulateCSPScriptDirective(obj, accumulator);
    } else if (obj.tagName === 'link' && obj.href?.length) {
      accumulateCSPLinkDirective(obj, accumulator);
    }
  }

  /**
   * Recursively transforms the manifest to create CSP Data
   * @type {import('./internal').createCSPData}
   * @private
   */
  function createCSPData(obj, accumulator) {
    return transform(
      obj,
      (acc, val) => {
        if (isObject(val)) {
          isSimpleTag(val)
            ? accumulateCSPDirective(val, acc)
            : createCSPData(val, acc);
        }
      },
      accumulator
    );
  }

  /**
   * Adds CSP directives to the manifest
   * @type {import('./internal').addCSPDirectives}
   */
  function addCSPDirectives(manifest) {
    const csp = createCSPData(manifest, {
      default: new Set(),
      scripts: new Set(),
      styles: new Set(),
      fonts: new Set(),
      images: new Set()
    });

    return {
      csp: {
        'default-src': ['self', ...csp.default],
        'script-src': ['self', ...csp.scripts],
        'style-src': ['self', ...csp.styles],
        'image-src': ['self', ...csp.images],
        'font-src': ['self', ...csp.fonts]
      },
      ...manifest
    };
  }

  return {
    hintMethods,
    scriptMethods,
    cssMethods,
    ...hintMethods,
    ...scriptMethods,
    ...cssMethods,
    addHydrateScript,
    merge,
    getAssets,
    createTagMethod,
    createContentMethod,
    renderChunks,
    addCSPDirectives
  };
};

export default createAssetManager;
