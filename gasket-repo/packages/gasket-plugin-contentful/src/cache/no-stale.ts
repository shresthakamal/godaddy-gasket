import NodeCache from 'node-cache';
import { ContentData } from '@godaddy/gasket-plugin-content';

const TWO_MINUTES_IN_SECONDS = 120;

export type NoStaleCache = Omit<NodeCache, 'get' | 'set'> & {
  get(cacheKey: string): ContentData | undefined;
  set(cacheKey: string, contentData: ContentData, cacheTTL?: number): boolean;
};

export const cache = new NodeCache({ stdTTL: TWO_MINUTES_IN_SECONDS, useClones: false }) as NoStaleCache;
