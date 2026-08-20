import { describe, it, expect, beforeEach, vi } from 'vitest';
import pcsCache from '../../lib/cache/pcs-cache.js';

describe('pcsCache', () => {

  let now = 0;
  const advanceTime = (sec) => { now = now + sec * 1000; };

  let headers = {}, status = 200, response = {}, ok = true, err = null;

  const setupFetch = (opts) => {
    ({ headers = {}, status = 200, response = {}, err = null } = opts);
    ok = status >= 200 && status < 300;
  };

  let fetchMock;
  let fetchWithCache;

  const reset = (async () => {
    now = 0;
    Date.now = vi.spyOn(Date, 'now').mockImplementation(() => now);
    fetchMock = vi.fn(async () => {
      if (err) {
        throw err;
      }
      return {
        headers: {
          get: (headerName) => headers[headerName]
        },
        status,
        ok,
        json: async () => response
      };
    });
    fetchWithCache = await pcsCache({ fetch: fetchMock });
  });

  beforeEach(async () => {
    await reset();
  });

  it('Calls the server when no cache entries', async () => {
    setupFetch({
      status: 200,
      response: 'CONTENT',
      headers: {
        'etag': 'ETAG-1',
        'cache-control': 'max-age=10'
      }
    });
    expect(await fetchWithCache('https://domain.com/some_url1')).toEqual('CONTENT');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenLastCalledWith('https://domain.com/some_url1', {});

  });

  it('fetches from cache when in cache and not stale', async () => {
    setupFetch({
      status: 200,
      response: 'CONTENT',
      headers: {
        'etag': 'ETAG-1',
        'cache-control': 'max-age=10'
      }
    });
    await fetchWithCache('https://domain.com/some_url1');

    // still fresh after 1 sec
    advanceTime(1);

    expect(await fetchWithCache('https://domain.com/some_url1')).toEqual('CONTENT');
    // now from cache only
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('Calls server to revalidate once cache is stale', async () => {
    setupFetch({
      status: 200,
      response: 'CONTENT',
      headers: {
        'etag': 'ETAG-1',
        'cache-control': 'max-age=10'
      }
    });
    await fetchWithCache('https://domain.com/some_url1');

    // let's make cache stale (max-age was 10 sec)
    advanceTime(11);

    setupFetch({
      status: 304,
      headers: {
        'etag': 'ETAG-1',
        'cache-control': 'max-age=10'
      }
    });
    expect(await fetchWithCache('https://domain.com/some_url1')).toEqual('CONTENT');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://domain.com/some_url1',
      {
        headers: {
          'If-None-Match': 'ETAG-1'
        }
      });
  });

  it('If got header cache-control: must-revalidate makes cache entry immediately stale', async () => {
    setupFetch({
      status: 200,
      response: 'CONTENT',
      headers: {
        'etag': 'ETAG-1',
        'cache-control': 'must-revalidate'
      }
    });

    expect(await fetchWithCache('https://domain.com/some_url2')).toEqual('CONTENT');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenLastCalledWith('https://domain.com/some_url2', {});

    setupFetch({
      status: 304,
      headers: {
        'etag': 'ETAG-1',
        'cache-control': 'must-revalidate'
      }
    });

    // Call again immediately

    expect(await fetchWithCache('https://domain.com/some_url2')).toEqual('CONTENT');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://domain.com/some_url2',
      {
        headers: {
          'If-None-Match': 'ETAG-1'
        }
      });
  });

  it('For error on subsequent calls returns from cache even if stale', async () => {
    const unique = Symbol('There can be only one!');
    setupFetch({
      status: 200,
      response: unique,
      headers: {
        'etag': 'ETAG-1',
        'cache-control': 'max-age=10'
      }
    });
    expect(await fetchWithCache('https://domain.com/some_url1')).toEqual(unique);

    // let's make cache stale (max-age was 10 sec)
    advanceTime(20);

    // fetch will throw
    setupFetch({
      status: 500,
      err: 'Some error happened'
    });

    // we got exactly the same object from cache, even though stale
    expect(await fetchWithCache('https://domain.com/some_url1')).toEqual(unique);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });


  it('For error without cached response it throws', async () => {
    // fetch will throw
    setupFetch({
      status: 500,
      err: 'Some error happened'
    });

    try {
      await expect(fetchWithCache('https://domain.com/some_url1'))
        .rejects
        .toThrow();
      // eslint-disable-next-line no-empty
    } catch {}

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });


  it('For unknown status code and without cached response it throws', async () => {

    setupFetch({
      status: 404
    });

    try {
      await expect(fetchWithCache('https://domain.com/some_url1'))
        .rejects
        .toThrow();
      // eslint-disable-next-line no-empty
    } catch {}

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });



});
