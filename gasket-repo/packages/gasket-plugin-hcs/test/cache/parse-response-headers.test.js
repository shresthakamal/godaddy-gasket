import { describe, it, expect } from 'vitest';
import parseResponseHeaders from '../../lib/cache/parse-response-headers.js';

describe('parseResponseHeaders', () => {

  const createMockHeaders = (opts) => {
    return {
      get: (headerName) => opts[headerName]
    };
  };

  it('Parses empty headers', async () => {
    const headers = createMockHeaders({});
    expect(parseResponseHeaders(headers)).toEqual({
      etag: null,
      maxAge: null,
      mustRevalidate: false
    });
  });

  it('Parses etag header', async () => {
    const headers = createMockHeaders({
      etag: 'Some-Etag'
    });
    expect(parseResponseHeaders(headers)).toEqual({
      etag: 'Some-Etag',
      maxAge: null,
      mustRevalidate: false
    });
  });


  it('Parses must-revalidate cache-control value', async () => {
    const headers = createMockHeaders({
      'etag': 'Some-Etag',
      'cache-control': 'no-store,max-age=0,must-revalidate'
    });
    expect(parseResponseHeaders(headers)).toEqual({
      etag: 'Some-Etag',
      maxAge: 0,
      mustRevalidate: true
    });
  });

  it('Parses max-age cache-control value', async () => {
    const headers = createMockHeaders({
      'cache-control': 'max-age=3600'
    });
    expect(parseResponseHeaders(headers)).toEqual({
      etag: null,
      maxAge: 3600,
      mustRevalidate: false
    });
  });

});
