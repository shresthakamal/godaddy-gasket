import type { ContentNode } from '@godaddy/gasket-content-nodes';
import type {
  ContentData,
  ContentContext,
  ContentTransform
} from '@godaddy/gasket-plugin-content';
import type { Asset, Entry, EntriesQueries, EntrySkeletonType, CreateClientParams } from 'contentful';
import type NodeCache from 'node-cache';

export type ContentfulPart = Asset | Entry<any> | any[] | string | number;

export type NodeTypeValue = string | ContentNode | ((part: any) => ContentNode | undefined);

export type RichTextNodeTypeMap = Record<string, NodeTypeValue>;

export type MimeTypeValue = string | ContentNode | ((part: Asset) => ContentNode | undefined);

export type AssetMimeTypeMap = Record<string, MimeTypeValue>;

export interface ContentfulContentSettings {
  richText?: RichTextNodeTypeMap
  asset?: AssetMimeTypeMap
  skipBadEntries?: boolean
  skipCrossSpaceErrors?: boolean
}

export interface SpaceConfig {
  space: string
  crossSpaceSource?: boolean
  mainEnvironment: string
  deliveryToken: string
  previewToken?: string
  cacheTTL?: number
  contentSettings?: ContentfulContentSettings
}

export interface ContentfulConfig {
  spaces: Record<string, SpaceConfig>
}

export type Entries = Entry<EntrySkeletonType, undefined, string>[] | Entry<EntrySkeletonType, 'WITH_ALL_LOCALES', string>[];

export type Query = ({ locale?: string } &
  EntriesQueries<EntrySkeletonType, undefined>)
  | EntriesQueries<EntrySkeletonType, 'WITH_ALL_LOCALES'>;

export type CustomClientParams = {
  withAllLocales?: boolean;
  enablePagination?: boolean;
}

export type ClientOptions = {
  spaceKey: string;
  environment?: string;
  isPreview?: boolean;
  /** @deprecated Use cacheOptions.cacheTransformed instead */
  cacheTransformed?: boolean;
  /** @deprecated Use cacheOptions.cacheKeyExtensions instead */
  cacheKeyExtensions?: Record<string, any>;
  /** @deprecated Use cacheOptions.dangerouslyCachePreview instead */
  dangerouslyCachePreview?: boolean;
  overrides?: Partial<CreateClientParams>;
} & CustomClientParams;

export const CACHE_STRATEGY = {
  NO_STALE: 'NO_STALE',
  STALE_WHILE_REVALIDATE: 'STALE_WHILE_REVALIDATE'
} as const;
export type CacheStrategy = (typeof CACHE_STRATEGY)[keyof typeof CACHE_STRATEGY];

export type NoStaleCacheOptions = {
  strategy: typeof CACHE_STRATEGY.NO_STALE;
  ttl?: number;
}

export type StaleCacheOptions = {
  strategy: typeof CACHE_STRATEGY.STALE_WHILE_REVALIDATE;
  maxFreshSeconds?: number;
  maxStaleSeconds?: number;
}

type BaseCacheOptions = {
  // previously part of ClientOptions
  cacheTransformed?: boolean;
  cacheKeyExtensions?: Record<string, any>;
  dangerouslyCachePreview?: boolean;
  /**
   * When true, returns the cached object by reference instead of a
   * deep clone.  Only opt in when you are certain that downstream
   * code will **not** mutate the returned ContentData.
   *
   * Defaults to `false` — every call returns a `structuredClone` so
   * the internal cache is never exposed to accidental mutation.
   */
  dangerouslyAllowMutation?: boolean;
}

export type CacheOptions = BaseCacheOptions & (NoStaleCacheOptions | StaleCacheOptions);

export type CacheOptionsByStrategy<T extends CacheStrategy = typeof CACHE_STRATEGY.NO_STALE> = BaseCacheOptions & (
  T extends typeof CACHE_STRATEGY.NO_STALE
    ? NoStaleCacheOptions
    : StaleCacheOptions
);

export type StaleWhileRevalidateCache = {
  get(itemKey: string): ContentData | undefined;
  set(itemKey: string, contentData: ContentData, cacheTTL?: number): boolean;
}

export type CacheStats = {
  noStale: {
    options: NodeCache.Options;
    stats: NodeCache.Stats;
  };
  staleWhileRevalidate: {
    options: NodeCache.Options;
    stats: NodeCache.Stats;
  };
};

export type SingleLocaleProps = {
  clientOptions: Omit<ClientOptions, 'withAllLocales'> & { withAllLocales?: false };
  cacheOptions?: CacheOptions;
  query: Query;
  transforms?: ContentTransform[];
};

export type MultiLocaleProps = {
  clientOptions: Omit<ClientOptions, 'withAllLocales'> & { withAllLocales: true };
  cacheOptions?: CacheOptions;
  query: Omit<Query, 'locale'>;
  transforms?: ContentTransform[];
}

export type Props = SingleLocaleProps | MultiLocaleProps;

declare module '@gasket/core' {
  export interface GasketConfig {
    contentful: ContentfulConfig
  }
  export interface GasketActions {
    getContentfulEntries: (props: Props, context: ContentContext) => Promise<ContentData>;
    getContentfulCacheStats: () => Promise<CacheStats>;
  }
}
