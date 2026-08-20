import { describe, it, expect, beforeEach } from 'vitest';
import createAssetManager from '../../lib/asset-manager/asset-manager.js';
import renderManifest from '../../lib/asset-manager/render-manifest.js';

import v3RawManifest from './__test__/v3-manifest.json';
import combinedRawManifest from './__test__/combined-raw-manifest.json';


// eslint-disable-next-line no-unused-vars,no-console
const debugLog = (o) => console.log(require('util').inspect(o, { depth: null }));

describe('AssetManager', () => {

  describe('createTagMethod/createContentMethod', () => {
    let assetManager;

    beforeEach(() => {
      assetManager = createAssetManager();
    });

    it('Check required arguments', () => {
      expect(() => assetManager.createTagMethod()).toThrow('dataPath is required');
      expect(() => assetManager.createTagMethod({ dataPath: 'path' })).toThrow('tagName is required');
    });

    it('Creates a method', () => {
      const myMethod = assetManager.createTagMethod({
        dataPath: 'some.path',
        tagName: 'sometag',
        defaultProps: { defProp1: 'defVal1', defProp2: 'defVal2' },
        requiredProps: ['prop3']
      });

      myMethod({
        prop3: 'val3',
        prop4: 'val4'
      });

      expect(assetManager.getAssets()).toEqual([{
        tagName: 'sometag',
        defProp1: 'defVal1',
        defProp2: 'defVal2',
        path: 'some.path',
        prop3: 'val3',
        prop4: 'val4'
      }]);

    });

    it('Creates a content method', () => {
      const myContentMethod = assetManager.createContentMethod({
        dataPath: 'some.path',
        tagName: 'sometag',
        defaultProps: { defProp1: 'defVal1' }
      });

      myContentMethod('Here goes inner HTML');

      expect(assetManager.getAssets()).toEqual([{
        tagName: 'sometag',
        defProp1: 'defVal1',
        path: 'some.path',
        innerHTML: 'Here goes inner HTML'
      }]);

      myContentMethod('Earlier required HTML', { defProp1: 'defVal0' }, { prepend: true });

      expect(assetManager.getAssets()).toEqual([{
        tagName: 'sometag',
        defProp1: 'defVal0',
        path: 'some.path',
        innerHTML: 'Earlier required HTML'
      }, {
        tagName: 'sometag',
        defProp1: 'defVal1',
        path: 'some.path',
        innerHTML: 'Here goes inner HTML'
      }]);
    });

    it('Can add deferred scripts to the stack', function () {
      assetManager.addScript({ src: 'https://img6.wsimg.com/some/script.js' });
      assetManager.addScript({ src: 'https://img6.wsimg.com/some/script.js' }, { deferjs: true, prepend: true });

      expect(assetManager.getAssets()).toEqual([
        {
          path: 'deferjs.hcs',
          tagName: 'script',
          crossOrigin: 'anonymous',
          src: 'https://img6.wsimg.com/some/script.js',
          defer: true,
          async: false
        },
        {
          crossOrigin: 'anonymous',
          path: 'js.hcs',
          tagName: 'script',
          src: 'https://img6.wsimg.com/some/script.js'
        }
      ]);
    });

    it('Can prepend assets to the stack', function () {
      assetManager.addScript({ src: 'https://img6.wsimg.com/i/was/first.js' });
      assetManager.addScript({ src: 'https://img6.wsimg.com/needed/before/first/setup.js' }, { prepend: true });

      expect(assetManager.getAssets()).toEqual([{
        crossOrigin: 'anonymous',
        path: 'js.hcs',
        tagName: 'script',
        src: 'https://img6.wsimg.com/needed/before/first/setup.js'
      }, {
        crossOrigin: 'anonymous',
        path: 'js.hcs',
        tagName: 'script',
        src: 'https://img6.wsimg.com/i/was/first.js'
      }]);
    });

    it('Created method checks required props', () => {
      const myMethod = assetManager.createTagMethod({
        dataPath: 'some.path',
        tagName: 'sometag',
        defaultProps: { defProp1: 'defVal1', defProp2: 'defVal2' },
        requiredProps: ['prop3']
      });


      expect(() => myMethod({ prop: 'val' })).toThrow('\'prop3\' is a required attribute');

    });

  });

  it('Example use case using chunks', async () => {

    const assetManager = createAssetManager();

    const chunksHook = (scriptsOnlyAssetManagerMethods) => {
      scriptsOnlyAssetManagerMethods.addChunk({ name: 'chunk-one', src: 'https://godaddy.com/js/chunk-1.js' });
      scriptsOnlyAssetManagerMethods.addChunk({ name: 'chunk-two', src: 'https://godaddy.com/js/chunk-2.js' });
    };

    chunksHook(assetManager.scriptMethods);

    // Existing manifest coming from e.g. PCS
    const existingManifest = {
      hints: {
        prefetch: [
          {
            tagName: 'link',
            href: 'https://cdn.net/prefetch-from-original-manifest'
          }
        ],
        preconnect: {
          tagName: 'link',
          href: 'https://cdn.net/preconnect-from-original-manifest'
        }
      },
      favicons: [
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '57x57',
          href: '//img6.dev-wsimg.com/ux/favicon/apple-icon-57x57.png'
        },
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '60x60',
          href: '//img6.dev-wsimg.com/ux/favicon/apple-icon-60x60.png'
        }
      ]
    };

    assetManager.renderChunks();

    const rawManifest = assetManager.merge(existingManifest);
    const renderedManifest = renderManifest(rawManifest);

    expect(renderedManifest).toEqual({
      config: {
        hcs: `<script>
    ux.data.cdn = {
      ...(ux.data.cdn || {}),
      "chunk-one": "https://godaddy.com/js/chunk-1.js","chunk-two": "https://godaddy.com/js/chunk-2.js",
    }
  </script>`
      },
      favicons:
                '<link rel="apple-touch-icon" sizes="57x57" href="//img6.dev-wsimg.com/ux/favicon/apple-icon-57x57.png"/> ' +
                '<link rel="apple-touch-icon" sizes="60x60" href="//img6.dev-wsimg.com/ux/favicon/apple-icon-60x60.png"/>',
      hints: {
        prefetch: '<link href="https://cdn.net/prefetch-from-original-manifest"/>',
        preconnect: '<link href="https://cdn.net/preconnect-from-original-manifest"/>'
      }
    });

  });

  it('Example use case using convenience methods in appropriate hooks', async () => {

    const assetManager = createAssetManager();

    const hintsHook = (hintsOnlyAssetManagerMethods) => {
      hintsOnlyAssetManagerMethods.addPrefetchHint({ href: 'https://godaddy.com/dnsprefetch/url1' });
      hintsOnlyAssetManagerMethods.addPrefetchHint({ href: 'https://godaddy.com/dnsprefetch/url2' });
      hintsOnlyAssetManagerMethods.addPrefetchHint({ href: 'https://godaddy.com/dnsprefetch/url3' });
      hintsOnlyAssetManagerMethods.addPreconnectHint({ href: 'https://godaddy.com/preconnect/url1' });
      hintsOnlyAssetManagerMethods.addPreconnectHint({ href: 'https://godaddy.com/preconnect/url2' });
      hintsOnlyAssetManagerMethods.addPreconnectHint({ href: 'https://godaddy.com/preconnect/url3' });
      hintsOnlyAssetManagerMethods.addDnsPrefetchHint({ href: 'https://dnsprefetch1.godaddy.com' });
      hintsOnlyAssetManagerMethods.addDnsPrefetchHint({ href: 'https://dnsprefetch2.godaddy.com' });
      hintsOnlyAssetManagerMethods.addJsPreloadHint({ href: 'https://godaddy.com/jsPrload/url1' });
      hintsOnlyAssetManagerMethods.addJsPreloadHint({ href: 'https://godaddy.com/jsPrload/url2' });
      hintsOnlyAssetManagerMethods.addCssPreloadHint({ href: 'https://godaddy.com/cssPreload/url1' });
      hintsOnlyAssetManagerMethods.addCssPreloadHint({ href: 'https://godaddy.com/cssPreload/url2' });
    };

    const scriptsHook = (scriptsOnlyAssetManagerMethods) => {
      scriptsOnlyAssetManagerMethods.addScript({ src: 'https://godaddy.com/js/script1.js' });
      scriptsOnlyAssetManagerMethods.addInlineScript(`console.log('Hello world!')`);
      scriptsOnlyAssetManagerMethods.addScript({ src: 'https://godaddy.com/js/script2.js' });
    };

    const cssHook = (cssOnlyAssetManagerMethods) => {
      cssOnlyAssetManagerMethods.addInlineCss('.some-class: { color: red }');
      cssOnlyAssetManagerMethods.addInlineFontCss('@font-face { font-family: gdsherpa; ' +
                'src: url(//img6.dev-wsimg.com/ux/fonts/sherpa/2.0/gdsherpa-vf.woff2) format("woff2") ; ' +
                'font-weight: 700; font-display: swap; }');
      cssOnlyAssetManagerMethods.addCss({ href: 'https://godaddy.com/css/styles1.css' });
      cssOnlyAssetManagerMethods.addCss({ href: 'https://godaddy.com/css/styles2.css' });
    };

    // Emulating how we call different Gasket hooks and pass only the relevant AssetManager methods:
    hintsHook(assetManager.hintMethods);
    scriptsHook(assetManager.scriptMethods);
    cssHook(assetManager.cssMethods);

    // Existing manifest coming from e.g. PCS
    const existingManifest = {
      hints: {
        prefetch: [
          {
            tagName: 'link',
            href: 'https://cdn.net/prefetch-from-original-manifest'
          }
        ],
        preconnect: {
          tagName: 'link',
          href: 'https://cdn.net/preconnect-from-original-manifest'
        }
      },
      favicons: [
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '57x57',
          href: '//img6.dev-wsimg.com/ux/favicon/apple-icon-57x57.png'
        },
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '60x60',
          href: '//img6.dev-wsimg.com/ux/favicon/apple-icon-60x60.png'
        }
      ]
    };

    const rawManifest = assetManager.merge(existingManifest);
    const renderedManifest = renderManifest(rawManifest);
    // debugLog(rawManifest);
    // debugLog(renderedManifest);

    expect(rawManifest).toEqual({
      hints: {
        prefetch: [
          {
            tagName: 'link',
            href: 'https://cdn.net/prefetch-from-original-manifest'
          },
          {
            tagName: 'link',
            rel: 'prefetch',
            href: 'https://godaddy.com/dnsprefetch/url1'
          },
          {
            tagName: 'link',
            rel: 'prefetch',
            href: 'https://godaddy.com/dnsprefetch/url2'
          },
          {
            tagName: 'link',
            rel: 'prefetch',
            href: 'https://godaddy.com/dnsprefetch/url3'
          }
        ],
        preconnect: [
          {
            tagName: 'link',
            href: 'https://cdn.net/preconnect-from-original-manifest'
          },
          {
            tagName: 'link',
            rel: 'preconnect',
            href: 'https://godaddy.com/preconnect/url1'
          },
          {
            tagName: 'link',
            rel: 'preconnect',
            href: 'https://godaddy.com/preconnect/url2'
          },
          {
            tagName: 'link',
            rel: 'preconnect',
            href: 'https://godaddy.com/preconnect/url3'
          }
        ],
        dnsprefetch: [
          {
            tagName: 'link',
            rel: 'dns-prefetch',
            href: 'https://dnsprefetch1.godaddy.com'
          },
          {
            tagName: 'link',
            rel: 'dns-prefetch',
            href: 'https://dnsprefetch2.godaddy.com'
          }
        ],
        preload: {
          js: [
            {
              tagName: 'link',
              rel: 'preload',
              as: 'script',
              href: 'https://godaddy.com/jsPrload/url1'
            },
            {
              tagName: 'link',
              rel: 'preload',
              as: 'script',
              href: 'https://godaddy.com/jsPrload/url2'
            }
          ],
          css: [
            {
              tagName: 'link',
              rel: 'preload',
              as: 'style',
              crossOrigin: 'anonymous',
              href: 'https://godaddy.com/cssPreload/url1'
            },
            {
              tagName: 'link',
              rel: 'preload',
              as: 'style',
              crossOrigin: 'anonymous',
              href: 'https://godaddy.com/cssPreload/url2'
            }
          ]
        }
      },
      favicons: [
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '57x57',
          href: '//img6.dev-wsimg.com/ux/favicon/apple-icon-57x57.png'
        },
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '60x60',
          href: '//img6.dev-wsimg.com/ux/favicon/apple-icon-60x60.png'
        }
      ],
      js: {
        hcs: [
          {
            crossOrigin: 'anonymous',
            tagName: 'script',
            src: 'https://godaddy.com/js/script1.js'
          },
          {
            crossOrigin: 'anonymous',
            tagName: 'script',
            src: 'https://godaddy.com/js/script2.js'
          }
        ]
      },
      config: {
        hcs: {
          tagName: 'script',
          innerHTML: "console.log('Hello world!')"
        }
      },
      css: {
        hcs: [
          {
            tagName: 'style',
            type: 'text/css',
            innerHTML: '.some-class: { color: red }'
          },
          {
            tagName: 'link',
            rel: 'stylesheet',
            media: 'all',
            href: 'https://godaddy.com/css/styles1.css',
            crossOrigin: 'anonymous'
          },
          {
            tagName: 'link',
            rel: 'stylesheet',
            media: 'all',
            href: 'https://godaddy.com/css/styles2.css',
            crossOrigin: 'anonymous'
          }
        ],
        fonts: {
          tagName: 'style',
          type: 'text/css',
          innerHTML: '@font-face { font-family: gdsherpa; ' +
                            'src: url(//img6.dev-wsimg.com/ux/fonts/sherpa/2.0/gdsherpa-vf.woff2) format("woff2") ; ' +
                            'font-weight: 700; font-display: swap; }'
        }
      }
    });

    expect(renderedManifest).toEqual({
      config: {
        hcs: `<script>console.log('Hello world!')</script>`
      },
      css: {
        fonts: '<style type="text/css">@font-face { font-family: gdsherpa; ' +
                    'src: url(//img6.dev-wsimg.com/ux/fonts/sherpa/2.0/gdsherpa-vf.woff2) format("woff2") ; ' +
                    'font-weight: 700; font-display: swap; }</style>',
        hcs: '<style type="text/css">.some-class: { color: red }</style> ' +
          '<link rel="stylesheet" media="all" crossorigin="anonymous" href="https://godaddy.com/css/styles1.css"/> ' +
          '<link rel="stylesheet" media="all" crossorigin="anonymous" href="https://godaddy.com/css/styles2.css"/>'
      },
      hints: {
        prefetch: '<link href="https://cdn.net/prefetch-from-original-manifest"/> ' +
                    '<link rel="prefetch" href="https://godaddy.com/dnsprefetch/url1"/> ' +
                    '<link rel="prefetch" href="https://godaddy.com/dnsprefetch/url2"/> ' +
                    '<link rel="prefetch" href="https://godaddy.com/dnsprefetch/url3"/>',
        preconnect: '<link href="https://cdn.net/preconnect-from-original-manifest"/> ' +
                    '<link rel="preconnect" href="https://godaddy.com/preconnect/url1"/> ' +
                    '<link rel="preconnect" href="https://godaddy.com/preconnect/url2"/> ' +
                    '<link rel="preconnect" href="https://godaddy.com/preconnect/url3"/>',
        dnsprefetch: '<link rel="dns-prefetch" href="https://dnsprefetch1.godaddy.com"/> ' +
                    '<link rel="dns-prefetch" href="https://dnsprefetch2.godaddy.com"/>',
        preload: {
          js: '<link rel="preload" as="script" href="https://godaddy.com/jsPrload/url1"/> ' +
                        '<link rel="preload" as="script" href="https://godaddy.com/jsPrload/url2"/>',
          css: '<link rel="preload" crossorigin="anonymous" as="style" href="https://godaddy.com/cssPreload/url1"/> ' +
                        '<link rel="preload" crossorigin="anonymous" as="style" href="https://godaddy.com/cssPreload/url2"/>'
        }
      },
      favicons:
                '<link rel="apple-touch-icon" sizes="57x57" href="//img6.dev-wsimg.com/ux/favicon/apple-icon-57x57.png"/> ' +
                '<link rel="apple-touch-icon" sizes="60x60" href="//img6.dev-wsimg.com/ux/favicon/apple-icon-60x60.png"/>',
      js: {
        hcs: '<script src="https://godaddy.com/js/script1.js" crossorigin="anonymous"></script> ' +
                    '<script src="https://godaddy.com/js/script2.js" crossorigin="anonymous"></script>'
      }
    });
  });

  it('Example use case using addCSPDirectives', async () => {
    const assetManager = createAssetManager();

    // Existing manifest coming from e.g. PCS
    const existingManifest = {
      favicons: [
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '57x57',
          href: '//cdn.net/ux/favicon/apple-icon-57x57.png'
        },
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '60x60',
          href: '//cdn.net/ux/favicon/apple-icon-60x60.png'
        }
      ],
      config: {
        trfq: {
          tagName: 'script',
          innerHTML: '(function testScript(){//some executable script;})())'
        }
      },
      js: {
        uxcore: [
          {
            tagName: 'script',
            src: 'https://cdn.net/path-to-package/uxcore2.js',
            defer: true,
            async: false
          }
        ]
      },
      css: {
        uxcore: [
          {
            tagName: 'link',
            href: 'https://style-cdn.net/path-to-package/uxcore2.css',
            defer: true,
            async: false,
            crossorigin: 'anonymous'
          }
        ]
      },
      fonts: [
        {
          tagName: 'link',
          rel: 'preload',
          href: 'https://font-cdn.net/some-path/specific-font.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        {
          tagName: 'link',
          rel: 'preload',
          href: 'https://cdn.net/some-path/other-specific-font.ttf',
          as: 'font',
          type: 'font/ttf',
          crossorigin: 'anonymous'
        }
      ]
    };

    assetManager.renderChunks();

    const manifestWithCSP = assetManager.addCSPDirectives(existingManifest);

    expect(manifestWithCSP).toEqual({
      csp: {
        'default-src': ['self'],
        'script-src': ['self', "'sha256-QuANVQC8yguBxLHys1VvZjyVO7SswnSszp1cf3kQgyQ='", 'cdn.net'],
        'style-src': ['self', 'style-cdn.net'],
        'image-src': ['self', 'cdn.net'],
        'font-src': ['self', 'font-cdn.net', 'cdn.net']
      },
      favicons: [
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '57x57',
          href: '//cdn.net/ux/favicon/apple-icon-57x57.png'
        },
        {
          tagName: 'link',
          rel: 'apple-touch-icon',
          sizes: '60x60',
          href: '//cdn.net/ux/favicon/apple-icon-60x60.png'
        }
      ],
      config: {
        trfq: {
          tagName: 'script',
          innerHTML: '(function testScript(){//some executable script;})())'
        }
      },
      js: {
        uxcore: [
          {
            tagName: 'script',
            src: 'https://cdn.net/path-to-package/uxcore2.js',
            defer: true,
            async: false
          }
        ]
      },
      css: {
        uxcore: [
          {
            tagName: 'link',
            href: 'https://style-cdn.net/path-to-package/uxcore2.css',
            defer: true,
            async: false,
            crossorigin: 'anonymous'
          }
        ]
      },
      fonts: [
        {
          tagName: 'link',
          rel: 'preload',
          href: 'https://font-cdn.net/some-path/specific-font.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous'
        },
        {
          tagName: 'link',
          rel: 'preload',
          href: 'https://cdn.net/some-path/other-specific-font.ttf',
          as: 'font',
          type: 'font/ttf',
          crossorigin: 'anonymous'
        }
      ]
    });
  });

  it('Merges onto an actual raw PCS header correctly', async () => {

    const assetManager = createAssetManager();

    assetManager.addPreconnectHint({ href: 'https://godaddy.com/preconnect/url2' });
    assetManager.addDnsPrefetchHint({ href: 'https://dnsprefetch1.godaddy.com' });
    assetManager.addJsPreloadHint({ href: 'https://godaddy.com/jsPrload/url1' });
    assetManager.addCssPreloadHint({ href: 'https://godaddy.com/cssPreload/url1' });
    assetManager.addScript({ src: 'https://godaddy.com/js/script1.js' });
    assetManager.addInlineScript(`console.log('Hello world!')`);
    assetManager.addInlineCss('.some-class: { color: red }');
    assetManager.addInlineFontCss('@font-face { font-family: gdsherpa; ' +
            'src: url(//img6.dev-wsimg.com/ux/fonts/sherpa/2.0/gdsherpa-vf.woff2) format("woff2") ; ' +
            'font-weight: 700; font-display: swap; }');
    assetManager.addCss({ href: 'https://godaddy.com/css/styles1.css' });

    const rawCombinedManifest = assetManager.merge(v3RawManifest);

    // Check for immutability
    expect(rawCombinedManifest === v3RawManifest).toEqual(false);
    expect(rawCombinedManifest.hints.dnsprefetch === v3RawManifest.hints.dnsprefetch).toEqual(false);

    expect(rawCombinedManifest).toEqual(combinedRawManifest);
  });


});
