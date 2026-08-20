import type { MaybeAsync, GasketRequest, GasketConfig, Gasket } from '@gasket/core';
import type { IncomingMessage } from 'http';

type HCRequest = IncomingMessage & HCRequest;

interface PCSharedHeaderConfig {
  params: {
    app: string;
    options?:  { [key: string]: any };
  },
  client?: {
    options?: {
      cache?: Function;
      cacheOnError?: boolean;
      onHeaderCacheHit?: Function;
      onHeaderCacheMiss?: Function;
      onMenuCacheHit?: Function;
      onMenuCacheMiss?: Function;
      url?: string;
    };
  }
  prefetch?: boolean;
}

interface SHClient {
  getHeader: <T>(params: T, opts?: object) => Promise<any>;
  getMenu: <T>(params: T, opts?: object) => Promise<any>;
  clearHeaderCache: <T>(params: T, opts?: object) => void;
  clearMenuCache: <T>(params: T, opts?: object) => void;
  getByVenture: <T>(params: T, opts?: object) => Promise<any>;
  clearVentureCache: <T>(params: T, opts?: object) => void;
  getByDomain: <T>(params: T, opts?: object) => Promise<any>;
  clearDomainCache: <T>(params: T, opts?: object) => void;
  getByBusiness: <T>(params: T, opts?: object) => Promise<any>;
  clearBusinessCache: <T>(params: T, opts?: object) => void;
  getByBusinessAndStore: <T>(params: T, opts?: object) => Promise<any>;
  clearBusinessAndStoreCache: <T>(params: T, opts?: object) => void;
  getByStore: <T>(params: T, opts?: object) => Promise<any>;
  clearStoreCache: <T>(params: T, opts?: object) => void;
  getByAppId: <T>(params: T, opts?: object) => Promise<any>;
  clearAppIdCache: <T>(params: T, opts?: object) => void;
  getByAccountId: <T>(params: T, opts?: object) => Promise<any>;
  clearAccountIdCache: <T>(params: T, opts?: object) => void;
}

interface SharedHeader {
  accountId?: string;
  appId?: string;
  businessId?: string;
  domainName?: string;
  options?: { [key: string]: any };
  storeId?: string;
  ventureId?: string;
  websiteId?: string;
}

interface SharedHeaderData {
  jwt:  string;
  app: string;
  locale: string;
  plid: number;
  options: { [key: string]: any };
}

interface ParamsData {
  jwt?:  string;
  app?: string;
  locale?: string;
  plid?: number;
  options?: { [key: string]: any };
  accountId?: string;
  appId?: string;
  businessId?: string;
  domainName?: string;
  options?: { [key: string]: any };
  storeId?: string;
  ventureId?: string;
  websiteId?: string;
  hostname?: string;
  type?: string;
}

export function getPcSharedHeaderConfig(gasket: Gasket): PCSharedHeaderConfig;
export function getSharedHeaderClient(gasket: Gasket): SHClient;
export function prefetchHeaders(gasket: Gasket, req: HCRequest): MaybeAsync<any>;
export function getParams(gasket: Gasket, req: HCRequest): Promise<ParamsData>;
export function request(gasket: Gasket, params: ParamsData):Promise<any>
export function getHeaders(gasket: Gasket, req: HCRequest): Promise<any>;

export function getEnvFromRuntime(config: GasketConfig): string;

declare module '@gasket/core' {
  export interface GasketActions {
    getSharedHeader(req: HCRequest): MaybeAsync<any>;
  }

  export interface HookExecTypes {
    sharedHeader(context: { req: HCRequest }, data: SharedHeaderData): MaybeAsync<SharedHeader>;
  }

  export interface GasketConfig {
    pcSharedHeader?: PCSharedHeaderConfig;
  }
}

export default {
  name: '@godaddy/gasket-plugin-shared-header',
  hooks: {}
};
