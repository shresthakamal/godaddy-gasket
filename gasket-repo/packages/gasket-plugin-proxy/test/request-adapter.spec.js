// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { makeRequest, defaultRequestAdapter, ProxyResponse } from '../lib/request-adapter.js';

describe('request-adapter', function () {
  let results;

  describe('#defaultRequestAdapter', function () {

    it('calls request with proper arguments', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => Promise.resolve('')
      });
      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(fetch).toHaveBeenCalledWith('http://some.api.com', expect.objectContaining({
        method: 'GET'
      }));
    });

    it('calls request with default adapter specific arguments', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => Promise.resolve('')
      });
      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(fetch).toHaveBeenCalledWith('http://some.api.com', expect.objectContaining({
        method: 'GET'
      }));
    });

    it('stringifies body when present', async function () {
      const mockBody = { foo: 'bar' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ success: true })
      });

      await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'POST',
        body: mockBody
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://some.api.com',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockBody)
        })
      );
    });

    it('handles headers when instance of Headers', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'X-BOGUS-RESPONSE': 'bogus' }),
        json: async () => Promise.resolve('')
      });

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET',
        headers: new Headers({ 'X-BOGUS-IN': 'bogus' })
      });

      expect(fetch).toHaveBeenCalledWith('http://some.api.com', expect.objectContaining({
        method: 'GET',
        // normalized to a plain object with lowercase keys
        headers: { 'x-bogus-in': 'bogus' }
      }));

      // normalized to a plain object with lowercase keys
      expect(results).toHaveProperty('headers', { 'x-bogus-response': 'bogus' });
    });

    it('handles headers when HeadersInit', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['x-bogus-out-1', ['value1', 'valueA']], ['x-bogus-out-2', 'value2']]),
        json: async () => Promise.resolve('')
      });

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET',
        headers: new Map([['x-bogus-in-1', ['value1', 'valueA']], ['x-bogus-in-2', 'value2']])
      });

      expect(fetch).toHaveBeenCalledWith('http://some.api.com', expect.objectContaining({
        method: 'GET',
        // normalized to a plain object with lowercase keys
        headers: { 'x-bogus-in-1': 'value1, valueA', 'x-bogus-in-2': 'value2' }
      }));

      // normalized to a plain object with lowercase keys
      expect(results).toHaveProperty('headers',
        { 'x-bogus-out-1': 'value1, valueA', 'x-bogus-out-2': 'value2' }
      );
    });

    it('handles headers when plain object', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'X-BOGUS-RESPONSE': 'bogus' }),
        json: async () => Promise.resolve('')
      });

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET',
        headers: { 'X-BOGUS-IN': 'bogus' }
      });

      expect(fetch).toHaveBeenCalledWith('http://some.api.com', expect.objectContaining({
        method: 'GET',
        // normalized to a plain object
        headers: { 'X-BOGUS-IN': 'bogus' }
      }));

      // normalized to a plain object (Headers normalizes to lowercase)
      expect(results).toHaveProperty('headers', { 'x-bogus-response': 'bogus' });
    });

    it('removes the content-encoding header from headers', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-encoding': 'gzip' }),
        json: async () => Promise.resolve('')
      });
      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(fetch).toHaveBeenCalledWith('http://some.api.com', expect.objectContaining({
        headers: expect.not.objectContaining({ 'content-encoding': 'gzip' })
      }));
    });

    it('returns a ProxyResponse', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'X-BOGUS': 'bogus'
        }),
        json: async () => Promise.resolve('')
      });
      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
    });

    it('returns a ProxyResponse for responses missing a body (HTTP 204)', async function () {
      // incorrect content-type is purposely specified, should be ignored
      const headers = { 'content-type': 'application/json' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(headers),
        text: async () => Promise.resolve(''),
        json: async () => Promise.reject(new SyntaxError('Unexpected end of JSON input'))
      });
      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results).toHaveProperty('status', 204);
      expect(results).toHaveProperty('headers', headers);
      expect(results).toHaveProperty('body', '');
    });

    it('returns a ProxyResponse for responses missing a body (Content-Length = 0)', async function () {
      // incorrect content-type is purposely specified, should be ignored
      const headers = { 'content-type': 'application/json', 'content-length': '0' };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(headers),
        text: async () => Promise.resolve(''),
        json: async () => Promise.reject(new SyntaxError('Unexpected end of JSON input'))
      });
      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results).toHaveProperty('status', 200);
      expect(results).toHaveProperty('headers', headers);
      expect(results).toHaveProperty('body', '');
    });

    it('returns a ProxyResponse for error statuses', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400,
        headers: new Headers({ 'X-BOGUS': 'bogus' }),
        text: async () => Promise.resolve('<html>BAD THINGS MAN</html>')
      });

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results).toHaveProperty('status', 400);
      expect(results).toHaveProperty('headers', { 'x-bogus': 'bogus' });
      expect(results).toHaveProperty('body', '<html>BAD THINGS MAN</html>');
    });

    it('returns a ProxyResponse for erroneous requests', async function () {
      global.fetch = vi.fn().mockRejectedValueOnce({
        message: 'BAD CONNECTION',
        headers: new Headers()
      });
      results = await defaultRequestAdapter('http://some.api.com', {
        method: 'GET'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results).toHaveProperty('status', 500);
      expect(results).toHaveProperty('headers', {});
      expect(results).toHaveProperty('body', 'BAD CONNECTION');
    });

    it('returns error text in body for 500 response', async function () {
      const errorText = 'Internal Server Error';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/plain', 'x-error': 'BOOM' }),
        text: async () => errorText
      });

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'POST'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results.status).toBe(500);
      expect(results.headers).toHaveProperty('x-error', 'BOOM');
      expect(results.body).toBe(errorText);
    });

    it('returns JSON body for 500 response with JSON content-type', async function () {
      const errorJson = { message: 'Database crashed' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => errorJson
      });

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'POST'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results.status).toBe(500);
      expect(results.body).toEqual(errorJson);
    });

    it('returns error message and stack from thrown Error', async function () {
      const err = new Error('Network down');
      global.fetch = vi.fn().mockRejectedValueOnce(err);

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results.status).toBe(500);
      expect(results.body).toContain('Network down');
    });

    it('returns fallback string if JSON parse fails', async function () {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => { throw new Error('bad JSON') }
      });

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(results).toBeInstanceOf(ProxyResponse);
      expect(results.status).toBe(500);
      expect(results.body).toMatch(/Failed to parse error body/);
    });

    it('uses "Unknown error" if both message and stack are missing', async () => {
      const error = {};
      global.fetch = vi.fn().mockRejectedValueOnce(error);

      results = await defaultRequestAdapter({
        url: 'http://some.api.com',
        method: 'GET'
      });

      expect(results.status).toBe(500);
      expect(results.body).toBe('Unknown error');
    });
  });

  describe('ProxyResponse', () => {

    it('requires status response property', () => {
      expect(() => new ProxyResponse()).toThrow(/status/);
    });

    it('requires headers response property', () => {
      expect(() => new ProxyResponse(200)).toThrow(/headers/);
    });

    it('contains response properties', () => {
      results = new ProxyResponse(200, { 'X-BOGUS': 'bogus' }, 'Some body content');
      expect(results).toEqual({
        status: 200,
        headers: { 'X-BOGUS': 'bogus' },
        body: 'Some body content'
      });
    });
  });

  describe('makeRequest', () => {
    let mockProxyConfig, mockRequestAdapter, mockConfig, mockLogger, originalReq, mockGasket;
    let mockRequestContext;
    beforeEach(() => {
      mockRequestAdapter = vi.fn().mockResolvedValue({ status: 200, headers: {}, body: 'some content' });

      mockProxyConfig = {
        method: 'GET',
        url: 'http://some.api.com',
        requestAdapter: mockRequestAdapter
      };

      mockConfig = {
        api: 'https://some.api.url'
      };
      mockLogger = {
        debug: () => { }
      };
      mockGasket = { config: mockConfig, logger: mockLogger };
      originalReq = { headers: {}, params: {}, query: {} };
      mockRequestContext = { originalReq, gasket: mockGasket };
    });

    it('executes the requestAdapter', async () => {
      results = await makeRequest(mockProxyConfig, mockRequestContext);
      expect(mockRequestAdapter).toHaveBeenCalled();
    });

    it('normalizes request options from proxyConfig', async () => {
      mockProxyConfig.options = {
        headers: new Headers({ 'X-BOGUS': 'bogus' }),
        agent: {}
      };
      results = await makeRequest(mockProxyConfig, mockRequestContext);
      expect(mockRequestAdapter).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://some.api.com',
        headers: expect.any(Headers),
        agent: {}
      }, { originalReq, gasket: mockGasket });
    });

    it('executes the requestTransform', async () => {
      const mockRequestTransform = vi.fn();
      mockProxyConfig.requestTransform = mockRequestTransform;
      results = await makeRequest(mockProxyConfig, mockRequestContext);
      expect(mockRequestTransform).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET' }),
        expect.objectContaining({ originalReq })
      );
    });

    it('executes the requestTransform as an async function', async () => {
      const mockRequestTransform = vi.fn(req => new Promise(resolve => {
        req.transformed = true;
        resolve(req);
      }));
      mockProxyConfig.requestTransform = mockRequestTransform;
      results = await makeRequest(mockProxyConfig, mockRequestContext);
      expect(mockRequestAdapter).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://some.api.com',
        transformed: true
      }, { originalReq, gasket: mockGasket });
    });

    it('executes the responseTransform with response and req in context', async () => {
      const mockResponseTransform = vi.fn();
      mockProxyConfig.responseTransform = mockResponseTransform;
      results = await makeRequest(mockProxyConfig, mockRequestContext);
      expect(mockResponseTransform).toHaveBeenCalledWith(
        expect.objectContaining(
          { status: 200, headers: {}, body: 'some content' }
        ),
        expect.objectContaining({ req: { method: 'GET', url: 'http://some.api.com' }, originalReq })
      );
    });

    it('executes the responseTransform as an async function', async () => {
      const mockResponseTransform = vi.fn(res => new Promise(resolve => {
        res.transformed = true;
        resolve(res);
      }));
      mockProxyConfig.responseTransform = mockResponseTransform;
      results = await makeRequest(mockProxyConfig, mockRequestContext);
      expect(results.transformed).toEqual(true);
    });
  });
});
