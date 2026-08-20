import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, GasketConfigDefinition, Hook, MaybeAsync } from '@gasket/core';
import '@godaddy/gasket-plugin-hcs';
import type {
  CacheAdapter, CssManager,
  HcsProps,
  HintsManager, ScriptsManager, WarehouseData,
  WarehouseRequest,
  WarehouseResults
} from '@godaddy/gasket-plugin-hcs';


const mockCache: CacheAdapter<string> = options => ({
  get: async key => 'value',
  set: async (key, value) => {
  },
  remove: async (key: string) => {
  },
  clear: () => {
  },
  size: () => 123
});

describe('@godaddy/gasket-plugin-hcs', () => {
  it('adds a hcs section to Gasket config', () => {
    const config: GasketConfigDefinition = {
      plugins: [],
      hcs: {
        pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1', // base url for server side
        pcsOverrideQuery: { // additional query params for pcsUrl
          appdata: false
        },
        cachingModule: mockCache,
        defaultCacheMaxAge: 0,
        devMode: true,
        enableBundleAnalyzer: false,
        webpackDevServer: {
          port: 9212,
          host: 'localhost'
        },
        removeManifest: true,
        buildMetadataPath: '/path/to/metadata',
        useMintl: true,
        entry: 'path/to/entry',
        webpack: {
          generateManifest: function (seed, files) {
            return files.reduce((acc, file) => {
              acc[file.path] = {
                isChunk: file.isChunk && !file.isInitial
              };
              return acc;
            }, {});
          }
        },
        skipSSR: false
      }
    };
  });

  it('adds a dangerouslyModifyManifest lifecycle', function () {
    const hook: Hook<'dangerouslyModifyManifest'> = (gasket: Gasket, pcsResponse: object): MaybeAsync<void> => {
    };
  });

  it('adds a wrhsPackageRequests lifecycle', function () {
    const hook: Hook<'wrhsPackageRequests'> = (gasket: Gasket, context): MaybeAsync<WarehouseRequest[]> => {
      const params: {} = context.params;
      const locale: string = context.locale;

      return [{
        name: '@org/package',
        env: 'test',
        version: '1.0.0',
        acceptedVariants: ['fr-FR', 'en-US']
      }];
    };
  });

  it('adds a hcsHints lifecycle', function () {
    const hook: Hook<'hcsHints'> = (
      gasket: Gasket,
      hintsManager: HintsManager,
      packages: WarehouseResults,
      props: HcsProps
    ): MaybeAsync<void> => {
      const pkgData: WarehouseData = packages['@some/package'];
      const {
        header, footer, shared,
        // @ts-expect-error - HcsProps is not typed
        bogus
      } = props;

      hintsManager.addPrefetchHint({ some: 'value' }, { prepend: true });
      hintsManager.addDnsPrefetchHint({ some: 'value' }, { prepend: true });
      hintsManager.addPreconnectHint({ some: 'value' }, { prepend: true });
      hintsManager.addJsPreloadHint({ some: 'value' }, { prepend: true });
      hintsManager.addCssPreloadHint({ some: 'value' }, { prepend: true });
      hintsManager.addFontPreloadHint({ some: 'value' }, { prepend: true });
    };
  });

  it('adds a hcsScripts lifecycle', function () {
    const hook: Hook<'hcsScripts'> = (
      gasket: Gasket,
      scriptsManager: ScriptsManager,
      packages: WarehouseResults,
      props: HcsProps
    ): MaybeAsync<void> => {
      const pkgData: WarehouseData = packages['@some/package'];
      const {
        header, footer, shared,
        // @ts-expect-error - HcsProps is not typed
        bogus
      } = props;

      scriptsManager.addInlineScript('<script>const awesome = true</script>', { some: 'value' }, { prepend: true });
      scriptsManager.addScript({ some: 'value' }, { prepend: true });
      scriptsManager.addChunk({ name: 'some-chunk', src: 'https://some.cdn/some-chunk.js' });
    };
  });

  it('adds a hcsCss lifecycle', function () {
    const hook: Hook<'hcsCss'> = (
      gasket: Gasket,
      cssManager: CssManager,
      packages: WarehouseResults,
      props: HcsProps
    ): MaybeAsync<void> => {
      const pkgData: WarehouseData = packages['@some/package'];
      const {
        header, footer, shared,
        // @ts-expect-error - HcsProps is not typed
        bogus
      } = props;

      cssManager.addInlineCss('.awesome: { color: blue } }', { some: 'value' }, { prepend: true });
      cssManager.addCss({ some: 'value' }, { prepend: true });
      cssManager.addInlineFontCss('.serif { font-family: Times, serif }', { some: 'value' }, { prepend: true });
    };
  });

  it('adds a hcsProps lifecycle', function () {
    const hook: Hook<'hcsProps'> = (
      gasket: Gasket,
      baseProps: Record<string, unknown>,
      req: IncomingMessage
    ): MaybeAsync<Partial<HcsProps>> => {
      return {
        header: {
          some: 'header value'
        },
        footer: {
          some: 'footer value'
        },
        shared: {
          some: 'shared value'
        }
      };
    };
  });
});
