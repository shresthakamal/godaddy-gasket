import type { MaybeAsync } from '@gasket/core';
import type { IncomingMessage } from 'http';
import { Request } from 'wrhs';
import { Manifest, FileDescriptor } from 'webpack-manifest-plugin';
import { AuthConfig } from '@switchboard/client';
import Apps from '@ux/apps';

export interface WarehouseRequest {
  /** Name of the package */
  name: string;
  /** Environment */
  env?: string;
  /** Version */
  version: string;
  /** List of variants */
  acceptedVariants: string[];
  /** Time in milliseconds that the package response should be cached for */
  ttl?: number;
}

export interface WarehouseData {
  files: Array<{ url: string; metadata: Record<string, any> }>;
  fingerprints: string[];
  recommended: string[];
}

export type WarehouseResults = Record<string, WarehouseData>;
export type QueryParams = Record<string, string | number | boolean>;

export type AddInlineAssets = (
  innerHTML: string,
  props: {},
  options: { prepend?: boolean }
) => void;
export type AddAssets = (
  props: {},
  options?: { prepend?: boolean; deferjs?: boolean }
) => void;
export type AddChunk = (chunk: { name: string; src: string }) => void;

export interface HintsManager {
  addPrefetchHint: AddAssets;
  addDnsPrefetchHint: AddAssets;
  addPreconnectHint: AddAssets;
  addJsPreloadHint: AddAssets;
  addCssPreloadHint: AddAssets;
  addFontPreloadHint: AddAssets;
}

export interface ScriptsManager {
  addInlineScript: AddInlineAssets;
  addScript: AddAssets;
  addChunk: AddChunk;
}

export interface CssManager {
  addInlineCss: AddInlineAssets;
  addCss: AddAssets;
  addInlineFontCss: AddInlineAssets;
}

export interface HcsProps {
  shared: Record<string, any>;
  header: Record<string, any>;
  footer: Record<string, any>;
}

export type CacheAdapter<T> = (options: {}) => {
  get: (key: string) => MaybeAsync<T>;
  set: (key: string, val: T) => MaybeAsync<void>;
  remove: (key: string) => MaybeAsync<void>;
  clear: () => MaybeAsync<void>;
  size: () => MaybeAsync<number>;
};

export interface HcsConfig {
  /** base url for server side data, otherwise will use PCS_HOST */
  pcsUrl?: string;
  /** additional query params for pcsUrl */
  pcsOverrideQuery?: QueryParams;
  /** this will cause it to default to the 'memory' caching module */
  cachingModule?: CacheAdapter;
  /** defaults to 10 minutes */
  defaultCacheMaxAge?: number;
  /** enable webpack dev server */
  devMode?: boolean;
  /** enable webpack bundle analyzer */
  enableBundleAnalyzer?: boolean;
  /** configuration options for webpack dev server */
  webpackDevServer?: {
    port: number;
    host: string;
    [option: string]: any;
  };
  /** deletes the manifest */
  removeManifest?: true;
  packageName?: string;
  buildMetadataPath: string;
  useMintl: boolean;
  entry: string;
  webpack: {
    generateManifest: (
      seed: Record<any, any>,
      files: FileDescriptor[],
      entries: Record<string, string[]>
    ) => Manifest;
    externalizeJsxRuntime?: boolean;
  };
  skipSSR: boolean;
  hivemind?: Record<string, any>;
  useOutOfBandCache?: boolean;
  maxAge?: number;
  fsCachePath?: string;
  memoryCacheMax?: number;
  maxStaleness?: number;
  defaultWrhsPackageRequest?: boolean;
  defaultHcsScripts?: boolean;
  memoizeCSPHashes?: boolean;
  useSassLoader?: boolean;
  excludeChunks?: string[];
}

declare module '@gasket/core' {
  export interface Gasket {
    wrhs: Request;
  }

  export interface GasketConfig {
    hcs?: HcsConfig;
    switchboard: {
      auth: AuthConfig
    },
    wrhs?: {
      baseUrl: string;
      username: string;
      password: string;
      /** Package request file system cache path */
      fsCachePath: string;
      variant: string;
      expiry?: number;
      mustIncludeFiles?: string[];
      excludeFiles?: string[];
    };
  }

  export interface GasketActions {
    getAppsClient(): InstanceType<typeof Apps>
  }

  export interface HookExecTypes {
    /**
     * WARNING: 'dangerouslyModifyManifest' is just a temporary lifecycle to
     * solve certain early HCS issues and will go away at some point in the near future.
     * Please do not use.
     * @deprecated
     */
    dangerouslyModifyManifest(
      pcsResponse: Record<string, any>
    ): MaybeAsync<void>;

    /**
     * Specify assets that need to be fetched from warehouse.
     */
    wrhsPackageRequests(context: {
      params: QueryParams;
      locale: string;
    }): MaybeAsync<WarehouseRequest[]>;

    /**
     * Add hint tags, used to prefetch or preload assets for performance.
     */
    hcsHints(
      hintsManager: HintsManager,
      packages: WarehouseResults,
      props: HcsProps
    ): MaybeAsync<void>;

    /**
     * Add additional scripts to the manifest.
     */
    hcsScripts(
      scriptsManager: ScriptsManager,
      packages: WarehouseResults,
      props: HcsProps
    ): MaybeAsync<void>;

    /**
     * Add style tags to the manifest.
     */
    hcsCss(
      cssManager: CssManager,
      packages: WarehouseResults,
      props: HcsProps
    ): MaybeAsync<void>;

    /**
     * Adjust the props derived from the Platform Content Service (PCS).
     */
    hcsProps(
      baseProps: Record<string, any>,
      req: IncomingMessage
    ): MaybeAsync<Partial<HcsProps>>;

    /**
     * Mutate request parameters before calling Platform Content Service (PCS)
     */
    hcsParams(
      params: Record<string, string>
    ): MaybeAsync<Record<string, string>>;
  }
}

export default {
  name: '@godaddy/gasket-plugin-hcs',
  hooks: {}
};
