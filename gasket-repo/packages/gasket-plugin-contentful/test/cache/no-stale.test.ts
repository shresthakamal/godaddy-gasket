import { describe, it, expect, vi } from 'vitest';
import type { ContentNode } from '@godaddy/gasket-content-nodes';
import type{ ContentData } from '@godaddy/gasket-plugin-content';
import { cache } from '../../src/cache/no-stale.js';

describe('cache: no-stale', () => {
  it('returns cached content node', () => {
    const cacheKey = 'foo';
    const contentNode: ContentNode = ['Component', { some: 'prop' }];
    const contentData: ContentData = {
      contentNodes: [contentNode],
      debug: { fromCache: true, cacheKey }
    };

    let result = cache.get(cacheKey);
    expect(result).toBeUndefined();

    cache.set(cacheKey, contentData);
    result = cache.get(cacheKey);
    expect(result).toEqual(contentData);
  });

  it('allows custom ttl', async () => {
    vi.useFakeTimers();
    const cacheKey = 'foo2';
    const contentNode: ContentNode = ['Component', { some: 'prop' }];
    const contentData: ContentData = {
      contentNodes: [contentNode],
      debug: { fromCache: true, cacheKey }
    };

    let result = cache.get(cacheKey);
    expect(result).toBeUndefined();

    cache.set(cacheKey, contentData, 1);
    result = cache.get(cacheKey);
    expect(result).toEqual(contentData);

    vi.advanceTimersByTime(1100);

    // expired
    result = cache.get(cacheKey);
    expect(result).toBeUndefined();
    vi.useRealTimers();
  });
});
