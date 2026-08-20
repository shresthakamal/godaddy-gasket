import type { Gasket, MaybeMultiple, Plugin } from '@gasket/core';
import type { RequestLike } from '@gasket/request';
import type { Handler } from 'express';
import type { Options as CacheConfigOptions } from 'lru-cache';

/* global BodyInit, RequestInit, HeadersInit */

declare module 'express-serve-static-core' {
  interface Request {
    originalRequest?: Request;
  }

  interface Response {
    originalResponse?: Response;
  }
}

declare module '@gasket/core' {
  export interface GasketConfig {
    proxy?: ProxyPluginConfig;
  }

  export interface GasketActions {
    getProxies(): Promise<Record<string, ProxyFn>>;
  }

  type ExtendedPlugin = Plugin & {
    defaultRequestAdapter: typeof defaultRequestAdapter;
  };
}

declare module 'http' {
  export interface IncomingMessage {
    proxies?: {
      [proxy: string]: (req?: IncomingMessage) => Promise<ProxyResponse>;
    };
  }
}

/** Proxy plugin configuration object */
export interface ProxyPluginConfig {
  /**
   * Object with proxy names as keys, and to description as values. These
   * describe the methods attached to `req.proxies` and so keys should follow
   * the `verbNoun` pattern.
   */
  proxies: Record<string, ProxyDescription>;
  /** Options to be passed to the requestAdapter for making request to API. */
  options?: MaybeDynamic<OptionsConfig>;
  /** Cache configuration settings which can be used to override defaults. */
  cache?: MaybeDynamic<CacheConfigOptions>;
  /** LogLevel settings which can be used to override defaults. */
  logLevels?: MaybeDynamic<LogLevelsConfig>;
  /** Optionally substitute the default request adapter. */
  requestAdapter?: RequestAdapter;
  /**
   * Express endpoint additional middleware. JSON parser added by default for
   * HTTP methods which can expect a payload.
   */
  middleware?: MaybeMultiple<Handler>;
}

/** Proxy Description object */
export interface ProxyDescription {
  /**
   * URL of the endpoint which is being proxied. Supports path and query params.
   */
  targetUrl: MaybeDynamic<string>;
  /**
   * Options to be passed to the requestAdapter for making request to API.
   */
  options?: MaybeDynamic<OptionsConfig>;
  /**
   * Enable caching for proxy and can be used to override defaults.
   */
  cache?: boolean | MaybeDynamic<CacheConfigOptions>;
  /**
   * LogLevel settings which can be used to override defaults.
   */
  logLevels?: MaybeDynamic<LogLevelsConfig>;
  /**
   * Callback that overrides the default logging of responses. Target receives
   * the gasket object, the log level, and the response object.
   */
  logResponse?: ({
    gasket,
    level,
    response
  }: {
    gasket: Gasket;
    level: string;
    response: ProxyResponse;
  }) => void;
  /**
   * Transform the AdapterRequest before it is passed to RequestAdapter.
   */
  requestTransform?: MaybeDynamic<RequestTransformFn>;
  /**
   * Transform the ProxyResponse returned by the RequestAdapter.
   */
  responseTransform?: MaybeDynamic<ResponseTransformFn>;
  /**
   * Optionally substitute the default request adapter.
   */
  requestAdapter?: RequestAdapter;
  /**
   * Express endpoint route path. If not specified, no endpoint will be setup,
   * only the proxy function.
   */
  url?: string;
  /**
   * Express endpoint HTTP method. Defaults to GET. Supports express route paths
   * with path and query params.
   */
  method?: string;
  /**
   * Express endpoint additional middleware. JSON parser added by default for
   * HTTP methods which can expect a payload.
   */
  middleware?: MaybeMultiple<Handler>;
}

/**
 * Callback function to create config. Should return the type expected by
 * property to which it is assigned.
 */
export type ConfigCallback<T> = (context: ConfigContext) => T;

export type MaybeDynamic<Cfg> = Cfg | ConfigCallback<Cfg>;

/** Context object that gets passed along to all config functions. */
export type ConfigContext = {
  gasket: Gasket;
  req: RequestLike;
};
/**
 * Context object that gets passed to makeRequest and request adapter.
 */
export type RequestContext = {
  originalReq: RequestLike;
  gasket: Gasket;
};
/**
 * Options which are passed to the request adapter.
 */
export type OptionsConfig = Partial<RequestInit>;

/**
 * Configuration for setting the log levels of responses based on response
 * status codes.
 */
export type LogLevelsConfig = Record<number, string>;

export interface AdapterRequest {
  /** endpoint url to call. */
  url: string;
  /** method (GET/PUT/POST etc) */
  method: string;
  /**
   * http headers to pass with the call, including any auth headers or cookies.
   */
  headers?: HeadersInit | Record<string, string | undefined>;
  /** data to pass with PUT/POST calls. */
  body?: BodyInit;
}

/**
 * Transform the AdapterRequest before it is passed to RequestAdapter.
 */
type RequestTransformFn = (request: AdapterRequest) => AdapterRequest;

/**
 * Expected object structure from request adapter
 */
export interface ProxyResponse {
  /** Http status code */
  status: number;
  /** Any response headers to send back. */
  headers: Record<string, string | undefined>;
  /** Response body from api. */
  body: string;
}

export type ProxyFn = (req: RequestLike) => Promise<ProxyResponse>;

/**
 * Transform the ProxyResponse returned by the RequestAdapter.
 */
type ResponseTransformFn = (
  res: ProxyResponse,
  { req: AdapterRequest, originalReq: IncomingMessage }
) => ProxyResponse;

/** The adapter interface for using a different request library */
export type RequestAdapter = (
  adapterRequest: AdapterRequest,
  requestContext: RequestContext
) => Promise<ProxyResponse>;

export function makeProxies(gasket: Gasket):
/** Mapping of proxy description name to proxy function */
Record<string, ProxyFn>;

async function defaultRequestAdapter(
  /**
   * Parameters for making the fetch api call, including url, method and other
   */
  adapterRequest: AdapterRequest,
  /**
   * Object containing request data. This data is not being used in the default
   * adapter. However this makes it available to use in any custom adapter.
   */
  requestContext: RequestContext
): Promise<ProxyResponse>;

type ProxyConfig = {
  cache: boolean | MaybeDynamic<CacheConfigOptions>;
  logLevels: MaybeDynamic<LogLevelsConfig>;
  logResponse: ({ gasket, level, response }) => void;
  method: string;
  options: MaybeDynamic<OptionsConfig>;
  requestAdapter: RequestAdapter;
  requestTransform?: RequestTransformFn | ConfigCallback;
  responseTransform?: ResponseTransformFn | ConfigCallback;
  url: string;
};

export async function makeRequest(
  /** Endpoint data returned by configureProxy function. */
  proxyConfig: ProxyConfig,
  requestContext: RequestContext
): Promise<ProxyResponse>;

/**
 * Reads the plugin config and proxy description data and builds a set of props
 * that apply for a given endpoint.
 */
export function configureProxy(
  /** Context to be passed to config functions. */
  context: ConfigContext,
  /** Proxy description node */
  proxyDesc: ProxyDescription
): ProxyConfig;

/**
 * Many of the props in proxy description can either be json objects or a
 * function. If they are configured as function, this function executes it and
 * returns the output of that back.
 */
export function exec(context: ConfigContext, maybeFn: Function | *):
  object | string | Function;

/**
 * Checks if function is returned, indicating thunk setup. Allows context to be
 * passed to setup.
 */
export function  prepThunk (context: ConfigContext, maybeThunk: Function):
  Function | string;

/**
 * Transforms the targetUrl by using the parameters passed in path params and
 * query params
 */
export function fixTargetUrl(
  /** Context to be passed to config functions */
  context: ConfigContext,
  /** TargetUrl from proxy description */
  targetUrl: MaybeDynamic<string>
): string;

interface Options {
  method?: string;
  headers?: Headers | Record<string, string>;
  body?: any;
  [key: string]: any; // To allow for additional properties
}

/**
 * The headers from gasket seems to contain the `host` property, which is
 * causing issues with making some calls. This function is currently removing
 * that header entry for now. If we find more such headers causing problems, we
 * can handle those here as well.
 */
export function sanitizeOptions(
  /** Options prop for the endpoint. */
  options: Options
): Options;

/**
 * Normalize headers to a plain object with lowercase keys.
 * Headers can optionally be filtered by a function that receives a key/value entry
 */
export function normalizeHeaders(
  headers: HeadersInit | Headers | Record<string, string>,
  filter?: (entry: string[]) => boolean
): Record<string, string>;

export default {
  name: '@godaddy/gasket-plugin-proxy',
  hooks: {}
}
