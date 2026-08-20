import { Gasket, GasketConfig } from '@gasket/core';
import { PCContent, PCParams, PCData, UxpCreateContext, HeaderName } from './index';
import { GasketRequest, RequestLike } from '@gasket/request';
import { Metadata } from '@gasket/plugin-metadata';
import { PackageJsonBuilder } from 'create-gasket-app';
import { Log } from '@gasket/plugin-logger';

type Dependencies = Record<string, string>;

type ExtendedMetadata = Metadata & {
  app: {
    package: Dependencies;
  };
};

export async function getContent(
  gasket: Gasket,
  req: GasketRequest
): Promise<PCContent | object>;

export async function setupRequestParams(
  gasket: Gasket,
  client: {
    version?: string,
    params?: PCParams
  },
  req: GasketRequest
): Promise<Record<string, unknown>>;

export async function setupRequestOptions(
  gasket: Gasket,
  req: GasketRequest,
  params: PCParams
): {
  requestUserAgent: string,
  params: PCParams,
  url?: string,
  env?: string,
  stuntDouble?: {
    url: string,
    remoteIP: string,
  }
  cache?: any
};

/** Checks to see if the dependency passed to function is a direct dependency */
export type checkDirectDeps = (
  gasket: { metadata: ExtendedMetadata; logger: Log },
  directDependency: string
) => void;

/** Disable Next.js telemetry by default. Opt-in by setting env variable. */
export type ensureTelemetryStatus = () => void;

/** Filters dependency properties by name of npm dependency */
export type filterDependenciesByName = (
  deps: Dependencies,
  filterName: string
) => Dependencies;

/** Creates the manifest transform function to add assets */
export type makeAddCdnAssets = (assets: string[]) => addCdnAssets;

export type addCdnAssets = (originalManifest: any) => object;

/** Parse a bitfield integer segment */
export type parseBitSegment = (
  /** the parse bitfield */
  value: number,
  /** where does your segment start */
  offset: number,
  /** how many bits does your segment have */
  bitWidth: number
) => number;

export type getShopperInfoFromCookie = (req: RequestLike & { cookies?: Record<string, any> }) => {
  auth?: string;
  pcx?: string;
  segopts?: number;
};

export type getEnvFromRuntime = (gasketConfig: GasketConfig) => string;

export type fixupPrivateLabelId = (hostname: string, privateLabel: number) => number;

/**
 * Parse Presentation Central manifest for any CDN Urls and return a list of
 * filtered results for precaching.
 */
export type parseCdnAssets = (manifest: PCData) => string[];

export type getFilteredDeps = (metadata: ExtendedMetadata) => Dependencies;

/** Update package.json with the latest versions of dependencies */
export type updatePackage = (options: {
  pkg: PackageJsonBuilder;
  uxp: UxpCreateContext;
}) => void;

export function normalizeEnv(env?: string): string;
