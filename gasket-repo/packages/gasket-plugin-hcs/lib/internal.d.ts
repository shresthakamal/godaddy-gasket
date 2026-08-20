import type { Gasket, GasketConfig, MaybeMultiple } from '@gasket/core';
import { SSR } from '@ux/ssr';
import { FetchWithCache } from './cache/internal';
import { Request as ExpressRequest } from 'express';
import { AssetManager } from './asset-manager/internal';
import Apps from '@ux/apps';
import { HcsProps } from '.';
import { WarehouseRequest } from '.';


interface WrhsObjectRequest {
  name: string;
  version: string;
  acceptedVariants: string[];
}

export function wrhsBasePackageRequest(
  gasket: Gasket,
  /** Requested locale */
  locale?: string
): WrhsObjectRequest;

export function getPackageName(gasket: Gasket): string;

interface WrhsFile {
  url: string;
  metadata: object;
}

export interface WrhsData {
  files: WrhsFile[];
  fingerprints: string[];
  recommended: string[];
}

export interface WrhsAssetsResult {
  [key: string]: WrhsData;
}

export async function wrhsAssets(
  gasket: Gasket,
  wrhsReqs: WarehouseRequest[]
): Promise<WrhsAssetsResult>;

export function getBaseUrl(config: GasketConfig): string;

export interface WrhsObjectVariant {
  name: string;
  env: string;
  version: string;
  variant: string;
  data: WrhsData;
  ttl: number;
  value: MaybeMultiple<string>;
}

interface WrhsClient {
  get: (
    path: string,
    wrhsObject: {
      accepted_variants: string;
      env: string;
      version: string;
    }
  ) => Promise<MaybeMultiple<WrhsObjectVariant>>;
}

interface RenderOptions {
  source: string;
  /** Manifest props */
  props: object;
  /** name of export from build lib */
  libraryExport: string;
}

export async function render(options: RenderOptions): string;

export function matchesGlob(str: string, pattern: string): boolean;

export function isChunk(
  /** asset URL or filepath */
  pathname: string,
  /** Build metadata */
  metadata: {
    isChunk?: boolean;
  }
): boolean;

export function addLocal(
  config: GasketConfig,
  assetManager: AssetManager,
  deferjs: boolean
): void;

export function defaultHCSAssets(
  gasket: Gasket,
  assetManager: AssetManager,
  packages: Record<string, WrhsData>,
  deferjs: boolean
): void;

/** Params for the getter function */
interface GetterOptions {
  /** Wrhs client */
  client: WrhsClient;
  /** Name of the package */
  name: string;
  /** Accepted variants as string (comma separated) */
  acceptedVariants: string;
  env: string;
  version: string;
}

export function getWrhsDataGetter(
  options: GetterOptions
): () => Promise<WrhsObjectVariant | WrhsObjectVariant[]>;

export interface renderHeader {
  (
    gasket: Gasket,
    /** Instance of @ux/ssr to perform renders */
    ssr: SSR,
    config: {
      /** Manifest props */
      props: Record<string, any>;
      libraryExport?: string;
    }
  ): Promise<string>;
}

export interface renderComponent {
  (
    gasket: Gasket,
    /** Instance of @ux/ssr to perform renders */
    ssr: SSR,
    config: {
      /** Manifest props */
      props: Record<string, any>;
      libraryExport?: string;
    }
  ): Promise<string>;
}

export interface renderFooter {
  (
    gasket: Gasket,
    /** Instance of @ux/ssr to perform renders */
    ssr: SSR,
    config: {
      /** Manifest props */
      props: Record<string, any>;
      libraryExport?: string;
    }
  ): Promise<string>;
}

export interface fetchPCS {
  (
    gasket: Gasket,
    params: {
      appKey?: string;
      deferjs?: string;
    }
  ): Promise<FetchWithCache>;
}

export interface generateHydrateScript {
  (
    gasket: Gasket,
    options: {
      props: Record<string, any>;
      params: {
        deferjs?: string;
      };
    }
  ): Promise<string>;
}

export interface getMergedProps {
  (
    gasket: Gasket,
    baseProps: Record<string, any>,
    req: ExpressRequest
  ): Promise<{
    header: Record<string, any>;
    footer: Record<string, any>;
    shared: Record<string, any>;
  }>;
}

export interface resetAppsClient {
  (): undefined;
}

export interface mockReq {
  (
    privateLabelId?: number
  ): any;
}

export interface registerAssets {
  (args: {
    gasket: Gasket;
    pcsManifest: Record<string, any>;
    params: {
      deferjs?: string;
    };
    props: HcsProps;
    locale: string;
  }): Promise<Record<string, any>>;
}

export interface CreateImporter {
  (options: {
    paths: string;
    extensions: string[];
    resolvers: string[];
  }): Function;
}

export interface Query {
  hivemind?: string;
  [key: string]: string;
}
