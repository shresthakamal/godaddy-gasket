import type { GasketConfig, MaybeAsync } from '@gasket/core';
import type { Metadata } from '@gasket/plugin-metadata';

export type HeaderName =
  'internal-sidebar' |
  'internal-header' |
  'application-header' |
  'brand-header' |
  'language-header' |
  'pass-header' |
  'investors-header' |
  'independents-header' |
  'partners-header' |
  'no-header' |
  'payment-header' |
  'sales-header' |
  'reseller-sales-header' |
  'storefront-header'

export interface PCData {
  assets?: {
    css?: string;
    js?: string;
    prefetch?: string;
    preload?: string;
    deferjs?: string;
  };
  header?: string;
  footer?: string;
  globals?: string;
  loaders?: string;
  pwamanifest?: {
    icons?: number[];
    start_url?: string;
  };
  hints?: {
    preconnect?: string;
    dnsprefetch?: string;
    prefetch?: string;
    preload?: {
      css?: string;
      fonts?: string;
      js?: string;
    }
  }
}

export interface PCParams {
  /**
   * The name of your app that is known by the UXPlatform team.
   * Defaults to `name` property of `package.json`.
   */
  app?: string;
  /**
   * Which type of header do we want to request.
   * Defaults to `application-header`, or `internal-header` when hostname is gdcorp.tools.
   * Use with version 2.0
   */
  header?: HeaderName
  /**
   * Which type of header do we want to request.
   * Defaults to `application-header`, or `internal-header` when hostname is gdcorp.tools.
   * Use with version 3.0
   */
  manifest?: HeaderName
  /**
   * Determined by @godaddy/gasket-plugin-visitor by default
   */
  market?: string;
  /**
   * Determined by @godaddy/gasket-plugin-visitor by default
   */
  privateLabel?: number;
  privateLabelId?: number;
  pwamanifest?: string;
  /**
   * The version of React we're using, this is auto-detected.
   */
  react?: string;
  split?: string;
  /**
   * Use to force a particular theme. e.g. `go-dark:brand` for
   * internal apps.
   */
  theme?: string;
  /**
   * Palette associated with the branding (also can fetch theme)
   * @deprecated
   */
  paletteId?: string;
  /**
   * Use a stunt double url for the PC request
   */
  stuntDouble?: boolean;
  /**
   * Specifying this parameter to `false` disables the Tealium tracking.
   */
  tealium?: boolean;
  /**
   * Specifying this parameter to `disable` disables the Traffic tracking.
   */
  traffic?: string;
  /**
   * Specifying a uxcore version, or disable the bundle with `false`.
   */
  uxcore?: number | string | false;
  /**
   * Specifying a deferjs parameter
   */
  deferjs?: boolean
  /**
   * Override the Presentation Central request URL for this request.
   * When set via the `presentationCentral` lifecycle hook, the singleton client
   * uses this URL instead of its boot-time URL, allowing per-request targeting
   * (e.g. a locally running header service). Not forwarded to PC as a query param.
   */
  url?: string;
  /**
   * Override the Presentation Central environment for this request.
   * When set via the `presentationCentral` lifecycle hook, selects the
   * corresponding endpoint (dev, test, or prod). Normalised the same way as
   * `presentationCentral.env` in `gasket.ts`. Not forwarded to PC as a query param.
   */
  env?: string;
}

interface PCMeta {
  url?: string;
  headers?: {
    etag?: string;
    [key: string]: string | undefined;
  };
}

interface PCError {
  message?: string;
  response?: {
    data?: {
      stack?: string;
    };
  };
}

export interface PCContent {
  data: PCData;
  meta: PCMeta;
  error?: PCError;
  // custom
  page?: string;
  disableRTL?: boolean;
}

export interface PCConfig {
  /**
   * Enable persisting cache to disk by default so reboots do not
   * need refresh data, but can use cache from disk.
   * Defaults to `presentation-central-cache` under `os.tmpdir()`.
   */
  fsCachePath?: string;
  /**
   * The environment that we need to run in.
   * Defaults to the derivative of the Gasket runtime environment.
   */
  env?: string;
  /**
   * Which API version of presentation-central we should use.
   * Defaults to `2.0`.
   */
  version?: '2.0' | '3.0'
  /**
   * Enable to manually override and disable RTL for all markets.
   */
  disableRTL?: boolean;
  /**
   * Maximum time we allow a presentation-central request to take.
   * Defaults to `10 seconds`.
   */
  timeout?: number;
  /**
   * maxStaleness + maxAge is the maximum age of a single cache item that we are allowed to use.
   * Defaults to `5 minutes`
   */
  maxStaleness?: number;
  /**
   * Max age of presentation-central response before it should automatically refresh.
   * Defaults to `30 minutes`
   */
  maxAge?: number;
  /**
   * Any Presentation Central API params
   */
  params?: PCParams;
  /**
   * Disable Presentation Central for this environment.
   */
  disabled?: boolean;
  enablePartnersHeaderOverride?: boolean;
  app?: string;
  page?: string;

  /**
   * The URL to the alternate HCS API.
   */
  pcStuntDoubleUrl?: string;
}

export interface UxpCreateContext {
  app: string;
  header: HeaderName;
  isGoDark: boolean;
  useRtl: boolean;
  useMintl: boolean;
}

declare module 'create-gasket-app' {
  interface CreateContext {
    uxp: UxpCreateContext;
    header?: string;
    reactIntlPkg: string;
    useAppRouter?: boolean;
    nextDevProxy?: boolean;
    nextServerType?: string;
    hasGasketIntl?: boolean;
  }
}

declare module '@gasket/core' {
  import { RequestLike, GasketRequest } from '@gasket/request';

  interface PackageJson {
    browserslist?: string | string[];
    postcss?: {
      plugins?: Record<string, any>;
    };
  }

  export interface GasketActions {
    getPresentationCentral(req: RequestLike): Promise<PCContent>;
  }

  export interface GasketConfig {
    presentationCentral?: PCConfig;
    uxp?: {
      externals?: boolean;
      /** When true, client webpack externalizes react/jsx-runtime (React 19+ apps). Set by configure. */
      externalizeJsxRuntime?: boolean;
      useMintl?: boolean;
      /** Feature flags for opt-in plugin behaviour. */
      features?: {
        /** Enables server-side Hivemind bucketing via gasket-plugin-switchboard. */
        'header-experiment-beta'?: boolean;
        [key: string]: boolean | undefined;
      };
      /** Hivemind experiment labels to fetch when header-experiment-beta is enabled. */
      hivemindLabels?: string[];
    };
    /**
     * Opt into Turbopack support. When true, this plugin's `nextConfig` hook
     * adds `@godaddy/gasket-plugin-uxp` and `@ux/presentation-central` to
     * Next.js `serverExternalPackages` — mirroring the externalization applied
     * on the Webpack side. `@gasket/plugin-nextjs` declares the same field;
     * TypeScript merges both declarations.
     */
    turbopack?: boolean;
  }

  export interface HookExecTypes {
    presentationCentral(
      params: PCParams,
      context: { req?: GasketRequest }
    ): MaybeAsync<void>;

    headerContent(
      content: PCContent,
      context: { req?: GasketRequest }
    ): MaybeAsync<PCContent>;
  }
}

export default {
  name: '@godaddy/gasket-plugin-uxp',
  hooks: {}
};
