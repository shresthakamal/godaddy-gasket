import { describe, it, expect, beforeEach, vi } from 'vitest';
import pcsOutOfBandCache from '../../lib/cache/pcs-out-of-band-cache.js';

vi.mock('@gasket/fetch');

describe('pcsOutOfBandCache', () => {
  let fetchMock;
  let fetchWithCache;
  let headers = {}, status = 200, response = {}, ok = true;

  // Function to generate a random ETag
  const generateRandomEtag = () => 'etag-' + Math.random().toString(36).substring(2, 15);

  beforeEach(async () => {
    fetchMock = vi.fn(async () => ({
      headers: {
        get: vi.fn((headerName) => headers[headerName])
      },
      status,
      ok,
      json: async () => response
    }));

    fetchWithCache = await pcsOutOfBandCache({ fetch: fetchMock });
  });

  it('should fetch data and return it', async () => {
    headers = { etag: generateRandomEtag() };
    response = { data: 'response' };
    status = 200;
    ok = true;

    const url = 'https://domain.com/some_url1';
    const res = await fetchWithCache(url);
    expect(res.meta.body).toEqual({ data: 'response' });
    expect(fetchMock).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should handle cache correctly', async () => {
    headers = { etag: generateRandomEtag() };
    response = { data: 'response' };

    const url = 'https://domain.com/some_url2';
    const res1 = await fetchWithCache(url);
    expect(res1.meta.body).toEqual({ data: 'response' });

    // Mock cache hit
    fetchMock.mockClear();
    const res2 = await fetchWithCache(url);
    expect(res2.meta.body).toEqual({ data: 'response' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should handle errors correctly', async () => {
    fetchMock = vi.fn(async () => {
      throw new Error('Fetch error');
    });

    fetchWithCache = await pcsOutOfBandCache({ fetch: fetchMock });

    const url = 'https://domain.com/some_url3';
    await expect(fetchWithCache(url)).rejects.toThrow('Fetch error');
  });

  it('should handle 304 Not Modified correctly', async () => {
    headers = { etag: generateRandomEtag() };

    const url = 'https://domain.com/some_url4';

    // First call to cache the response
    const first = await fetchWithCache(url, { etag: headers.etag });
    expect(first.meta.cached).toBe(false);

    // Second call should return 304 and not update the cache
    const second = await fetchWithCache(url, { etag: headers.etag });

    // Check that the cache was not updated
    expect(second.meta.cached).toBe(true);
    expect(first.meta.body).toEqual(second.meta.body);
  });

  it('should handle 304 Not Modified and no etag set correctly', async () => {
    headers = { etag: generateRandomEtag() };
    response = { data: 'response' };
    status = 304;
    ok = true;

    const url = 'https://domain.com/some_url4';
    await expect(fetchWithCache(url)).rejects.toThrow('HTTP Error, statusCode: 304, url: https://domain.com/some_url4');

  });

  it('should handle 500 Internal Server Error correctly', async () => {
    headers = { etag: generateRandomEtag() };
    response = { error: 'Internal Server Error' };
    status = 500;
    ok = false;

    const url = 'https://domain.com/some_url5';
    await expect(fetchWithCache(url)).rejects.toThrow('HTTP Error, statusCode: 500, url: https://domain.com/some_url5');
  });
});
