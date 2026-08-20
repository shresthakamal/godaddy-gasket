import { fetch } from '@gasket/fetch';
import { CacheOptions, JSONSerializable } from 'out-of-band-cache';

export interface memoryMethods {
  /**
   * Retrieve a stored value by key
   */
  get(key: string): Promise<any | undefined>;

  /**
   * Store a value by key
   */
  set(key: string, val: any): Promise<void>;

  /**
   * Remove a stored value by key
   * @param {string} key - the cache key
   */
  remove(key: string): Promise<void>;

  /**
   * Completely clears the cache
   */
  clear(): Promise<void>;

  /**
   * Gets the count of stored objects
   */
  size(): Promise<number>;
}

export interface memoryOptions {
  items?: Record<string, any>;
}

interface PcsCacheOptions {
  useOutOfBandCache?: boolean;
  cachingModule?: (opts?: memoryOptions) => Promise<memoryMethods>;
  /** a fetch-like module implementing the Fetch API */
  fetch?: fetch;
  defaultMaxAge?: number;
  fsCachePath?: string;
  maxAge?: number;
  maxStaleness?: number;
  memoryCacheMax?: number;
}

export function fetchWithCache(url: string): Promise<any>;

export async function fetchWithCacheSingleton(
  opts: PcsCacheOptions
): Promise<typeof fetchWithCache>;

interface ResponseHeaders {
  maxAge?: number;
  etag?: string;
  mustRevalidate: boolean;
}

export function parseResponseHeaders(
  /** fetch's Headers object */
  headers: Headers
): ResponseHeaders;

export async function pcsOutOfBandCache(
  options: CacheOptions
): Promise<typeof fetchWithCache>;

export interface memory {
  (opts?: memoryOptions): Promise<memoryMethods>;
}

export function onServerError(
  cacheEntry: { content: any } | null,
  err: Error
): any | null;

export function pcsCache(
  options?: PcsCacheOptions
): Promise<typeof fetchWithCache>;

export interface HandleFetchOptions {
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface HandleFetch {
  (
    url: string,
    opts: HandleFetchOptions,
    staleItem: JSONSerializable
  ): Promise<any>;
}

interface ResponseCacheObject {
  get(key: string): Promise<{
    expires: number;
    content: any;
    etag: string | null;
    isFresh: boolean;
  }>;
  set(
    key: string,
    content: any,
    meta: { etag?: string; maxAge?: number; expires?: number }
  ): Promise<void>;
}

export interface ResponseCache {
  ({ cachingModule: memory }): Promise<ResponseCacheObject>;
}
