import { describe, it, expect, beforeEach, vi } from 'vitest';
import configureProxy from '../lib/configure-proxy.js';
import { defaultRequestAdapter } from '../lib/request-adapter.js';

describe('configureProxy', () => {
  let result, gasket, req, proxyDesc, mockContext;

  beforeEach(() => {
    proxyDesc = {
      targetUrl: 'https://some.api.test-secureserver.net'
    };
    gasket = {
      config: {
        proxy: {
          proxies: {
            getTestData: proxyDesc
          }
        }
      }
    };
    req = {};
    mockContext = {
      gasket,
      req
    };
  });

  describe('.method', () => {

    it('defaults method to GET', () => {
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('method', 'GET');
    });

    it('uses method from endpoint desc', () => {
      proxyDesc.method = 'POST';
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('method', 'POST');
    });

    it('prefers method from endpoint options', () => {
      proxyDesc.method = 'POST';
      proxyDesc.options = {
        method: 'PUT'
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('method', 'PUT');
    });

    it('prefers method from endpoint options function', () => {
      proxyDesc.method = 'POST';
      proxyDesc.options = () => ({
        method: 'PUT'
      });
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('method', 'PUT');
    });
  });

  describe('.url', () => {

    it('returns fixed up url', () => {
      req.params = { itemId: '1234' };
      req.query = { itemName: 'really-great-thing' };
      proxyDesc.targetUrl = 'http://some.api.com/item/:itemId';
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('url', 'http://some.api.com/item/1234?itemName=really-great-thing');
    });
  });

  describe('.options', () => {

    it('defaults to empty object', () => {
      delete req.headers;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('options', {});
    });

    it('uses root proxy options', () => {
      gasket.config.proxy.options = {
        credentials: 'include'
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('options', { credentials: 'include' });
    });

    it('passes through headers from original request', () => {
      req.headers = { 'X-BOGUS': 'bogus' };
      result = configureProxy(mockContext, proxyDesc);
      expect(result.options).toHaveProperty('headers', { 'X-BOGUS': 'bogus' });
    });

    it('passes through body from original request', () => {
      proxyDesc.method = 'POST';
      req.body = { bogus: 'BOGUS' };
      result = configureProxy(mockContext, proxyDesc);
      expect(result.options).toHaveProperty('body', { bogus: 'BOGUS' });
    });

    it('sanitizes headers from original request', () => {
      req.headers = { 'X-BOGUS': 'bogus', 'host': 'some-host' };
      result = configureProxy(mockContext, proxyDesc);
      expect(result.options).toHaveProperty('headers', { 'X-BOGUS': 'bogus' });
    });

    it('uses proxyDesc options', () => {
      proxyDesc.options = {
        credentials: 'same-origin'
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('options', { credentials: 'same-origin' });
    });

    it('merges proxy root and endpoint options', () => {
      gasket.config.proxy.options = {
        credentials: 'include',
        bogus: 'BOGUS'
      };
      proxyDesc.options = {
        credentials: 'same-origin'
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('options', { credentials: 'same-origin', bogus: 'BOGUS' });
    });

    it('merges original req, proxy root, and endpoint options', () => {
      req.headers = {
        'X-A': 'A'
      };
      gasket.config.proxy.options = {
        headers: {
          'X-B': 'B'
        }
      };
      proxyDesc.options = {
        headers: {
          'X-C': 'C'
        }
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('options', {
        headers: {
          'X-A': 'A',
          'X-B': 'B',
          'X-C': 'C'
        }
      });
    });

    it('does not forward HTTP2 pseudo headers to the request Options', () => {
      req.headers = {
        [':method']: 'GET',
        [':authority']: 'hostname.com',
        [':path']: '/',
        [':scheme']: 'https'
      };

      result = configureProxy(mockContext, proxyDesc);

      // @ts-expect-error - headers property access
      expect(result.options.headers).not.toHaveProperty(':method');
      // @ts-expect-error - headers property access
      expect(result.options.headers).not.toHaveProperty(':authority');
      // @ts-expect-error - headers property access
      expect(result.options.headers).not.toHaveProperty(':path');
      // @ts-expect-error - headers property access
      expect(result.options.headers).not.toHaveProperty(':scheme');
    });
  });

  describe('.cache', () => {

    it('defaults to false', () => {
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('cache', false);
    });

    it('enabled by proxyDesc with boolean', () => {
      proxyDesc.cache = true;
      result = configureProxy(mockContext, proxyDesc);
      expect(result.cache).toBeTruthy();
    });

    it('enabled by proxyDesc with object', () => {
      proxyDesc.cache = {};
      result = configureProxy(mockContext, proxyDesc);
      expect(result.cache).toBeTruthy();
    });

    it('enabled by proxyDesc with function', () => {
      proxyDesc.cache = () => ({});
      result = configureProxy(mockContext, proxyDesc);
      expect(result.cache).toBeTruthy();
    });

    it('only supported with GET HTTP method', () => {
      proxyDesc.cache = () => ({});

      proxyDesc.method = 'GET';
      result = configureProxy(mockContext, proxyDesc);
      expect(result.cache).toBeTruthy();

      proxyDesc.method = 'POST';
      result = configureProxy(mockContext, proxyDesc);
      expect(result.cache).not.toBeTruthy();
    });

    it('uses default cache settings', () => {
      proxyDesc.cache = true;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('cache', { max: 50, maxAge: 360000 });
    });

    it('uses root proxy cache settings', () => {
      gasket.config.proxy.cache = {
        max: 12,
        maxAge: 120000
      };
      proxyDesc.cache = true;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('cache', { max: 12, maxAge: 120000 });
    });

    it('merges proxy root and endpoint cache settings', () => {
      gasket.config.proxy.cache = {
        maxAge: 360000
      };
      proxyDesc.cache = {
        maxAge: 1234,
        max: 32
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('cache', { maxAge: 1234, max: 32 });
    });
  });

  describe('.requestAdapter', () => {

    it('defaults to default requestAdapter', () => {
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('requestAdapter', defaultRequestAdapter);
    });

    it('uses root proxy requestAdapter', () => {
      const mockAdapter = vi.fn();
      gasket.config.proxy.requestAdapter = mockAdapter;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('requestAdapter', mockAdapter);
    });

    it('prefers requestAdapter from proxy description', () => {
      const mockAdapter = vi.fn();
      gasket.config.proxy.requestAdapter = vi.fn();
      const mockAdapter2 = vi.fn();
      proxyDesc.requestAdapter = mockAdapter2;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('requestAdapter', mockAdapter2);
      expect(result.requestAdapter).not.toBe(mockAdapter);
    });
  });

  describe('.logLevels', () => {

    it('has defaults', () => {
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('logLevels', {
        200: 'none',
        400: 'warn',
        500: 'error'
      });
    });

    it('uses root proxy logLevels', () => {
      gasket.config.proxy.logLevels = {
        200: 'debug'
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('logLevels', {
        200: 'debug',
        400: 'warn',
        500: 'error'
      });
    });

    it('prefers logLevels from proxy description', () => {
      gasket.config.proxy.logLevels = {
        200: 'debug'
      };
      proxyDesc.logLevels = {
        200: 'info',
        300: 'notice'
      };
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('logLevels', {
        200: 'info',
        300: 'notice',
        400: 'warn',
        500: 'error'
      });
    });
  });

  describe('.logResponse', () => {
    it('is not set by default', () => {
      result = configureProxy(mockContext, proxyDesc);
      expect(result.logResponse).not.toBeTruthy();
    });

    it('can be passed through the proxy description', () => {
      const logResponse = vi.fn();
      proxyDesc.logResponse = logResponse;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('logResponse', logResponse);
    });
  });

  describe('.responseTransform', () => {

    it('not set by default', () => {
      result = configureProxy(mockContext, proxyDesc);
      expect(result.responseTransform).not.toBeTruthy();
    });

    it('uses function from proxy description', () => {
      proxyDesc.responseTransform = f => f;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('responseTransform', expect.any(Function));
    });

    it('can be a thunk', () => {
      proxyDesc.responseTransform = () => f => f;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('responseTransform', expect.any(Function));

      expect(result.responseTransform({ bogus: 'BOGUS' })).toEqual({ bogus: 'BOGUS' });
    });
  });

  describe('.requestTransform', () => {

    it('not set by default', () => {
      result = configureProxy(mockContext, proxyDesc);
      expect(result.requestTransform).not.toBeTruthy();
    });

    it('uses function from proxy description', () => {
      proxyDesc.requestTransform = f => f;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('requestTransform', expect.any(Function));
    });

    it('can be a thunk', () => {
      proxyDesc.requestTransform = () => f => f;
      result = configureProxy(mockContext, proxyDesc);
      expect(result).toHaveProperty('requestTransform', expect.any(Function));

      expect(result.requestTransform({ bogus: 'BOGUS' })).toEqual({ bogus: 'BOGUS' });
    });
  });
});
