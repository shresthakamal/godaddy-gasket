import { describe, it, expect, beforeEach, vi } from 'vitest';
import responseCache from '../../lib/cache/response-cache.js';

describe('responseCache', () => {

  let cache;
  let now = 0;

  const advanceTime = (sec) => { now = now + sec * 1000; };

  beforeEach(async () => {
    cache = await responseCache();
    now = 0;
    Date.now = vi.spyOn(Date, 'now').mockImplementation(() => now);
  });

  it('Expires content based on maxAge value', async () => {

    await cache.set('my_key', 'my_content', { etag: 'my_etag', maxAge: 8 });

    expect((await cache.get('my_key')).isFresh).toEqual(true);

    advanceTime(5);

    expect((await cache.get('my_key')).isFresh).toEqual(true);

    advanceTime(4);

    expect((await cache.get('my_key')).isFresh).toEqual(false);

    expect((await cache.get('my_key'))).toEqual({
      etag: 'my_etag',
      expires: 8000,
      content: 'my_content',
      isFresh: false
    });

  });


  it('Expires content based on expires value', async () => {

    await cache.set('my_key', 'my_content', { etag: 'my_etag', expires: 10000 });

    expect((await cache.get('my_key')).isFresh).toEqual(true);

    advanceTime(5);

    expect((await cache.get('my_key')).isFresh).toEqual(true);

    advanceTime(6);

    expect((await cache.get('my_key')).isFresh).toEqual(false);

    expect((await cache.get('my_key'))).toEqual({
      etag: 'my_etag',
      expires: 10000,
      content: 'my_content',
      isFresh: false
    });
  });

  it('Return null for non-existent keys', async () => {
    await cache.set('my_key', 'my_content');
    expect(await cache.get('my_key')).toBeTruthy();
    expect(await cache.get('non_existent_key')).toEqual(null);
  });




});
