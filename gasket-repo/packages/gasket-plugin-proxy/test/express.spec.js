import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from '../lib/express.js';
import { jsonParser } from '../lib/utils.js';

const anyFn = expect.any(Function);
const anyMiddleware = expect.any(Array);

const middleware1 = f => f;
const middleware2 = f => f;
const middleware3 = f => f;
const middleware4 = f => f;


describe('express', () => {
  let mockGasket, mockProxyConfig, mockDescription, mockApp, mockProxies;

  beforeEach(() => {
    mockDescription = {};
    mockProxies = {};

    mockProxyConfig = {
      proxies: mockDescription
    };
    mockGasket = {
      actions: {
        getProxies: vi.fn().mockReturnValue(mockProxies)
      },
      config: {
        proxy: mockProxyConfig
      }
    };

    mockApp = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn()
    };
  });

  const mockProxyHelper = (mockKey, mockValue) => {
    mockDescription[mockKey] = mockValue;
    mockProxies[mockKey] = vi.fn().mockResolvedValue({
      status: 200,
      headers: {
        bogus: 'BOGUS'
      },
      body: 'content'
    });
  }

  const initApp = () => {
    express.handler(mockGasket, mockApp);
  };

  it('adds endpoints with urls', async () => {
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items'
    });
    mockDescription.getBogusNoUrl = {};
    initApp();
    expect(mockApp.get).toHaveBeenCalledWith('/proxy/some/api/items', anyMiddleware, anyFn);
    expect(mockApp.get).toHaveBeenCalledTimes(1);
  });

  it('adds endpoints with methods', async () => {
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items'
    });
    mockProxyHelper('postBogus', {
      url: '/proxy/some/api/items',
      method: 'POST'
    });
    initApp();
    expect(mockApp.get).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalled();
    expect(mockApp.put).not.toHaveBeenCalled();
  });

  it('defaults to GET if no method set', async () => {
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items'
    });
    initApp();
    expect(mockApp.get).toHaveBeenCalled();
  });

  it('does not add endpoints if no url set', async () => {
    mockProxyHelper('getBogus', {
      targetUrl: 'https://some.api.com'
    });
    initApp();
    expect(mockApp.get).not.toHaveBeenCalled();
  });

  it('does not add json body parser for certain http methods', async () => {
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items'
    });
    initApp();
    expect(mockApp.get).toHaveBeenCalledWith(expect.any(String), [], anyFn);
  });

  it('adds json body parser for methods expecting payloads', async () => {
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items',
      method: 'POST'
    });
    initApp();
    expect(mockApp.post).toHaveBeenCalledWith(expect.any(String), [jsonParser], anyFn);
  });

  it('adds custom middleware from proxy config', async () => {
    const mockParser = f => f;
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items',
      method: 'POST'
    });
    mockProxyConfig.middleware = mockParser;
    initApp();
    expect(mockApp.post).toHaveBeenCalledWith(expect.any(String), [mockParser, jsonParser], anyFn);
  });

  it('adds custom middleware from endpoint in order', async () => {
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items',
      method: 'POST',
      middleware: middleware1
    });
    mockProxyConfig.middleware = middleware2;
    initApp();
    expect(mockApp.post).toHaveBeenCalledWith(expect.any(String), [middleware1, middleware2, jsonParser], anyFn);
  });

  it('custom middleware can be arrays of functions', async () => {
    mockProxyHelper('getBogus', {
      url: '/proxy/some/api/items',
      method: 'POST',
      middleware: [middleware1, middleware2]
    });
    mockProxyConfig.middleware = [middleware3, middleware4];
    initApp();
    expect(mockApp.post).toHaveBeenCalledWith(
      expect.any(String),
      [middleware1, middleware2, middleware3, middleware4, jsonParser],
      anyFn);
  });

  it('does not add endpoints if no proxy descriptions', () => {
    mockGasket.config = {};
    initApp();
    expect(mockApp.get).not.toHaveBeenCalled();
    expect(mockApp.post).not.toHaveBeenCalled();
    expect(mockApp.put).not.toHaveBeenCalled();
  });

  describe('functions', () => {
    let mockReq, mockResponse, mockRes, mockEndpointFn;

    beforeEach(async () => {
      mockResponse = {
        status: 200,
        headers: {
          bogus: 'BOGUS'
        },
        body: 'content'
      };

      mockReq = {};

      mockRes = {
        status: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        send: vi.fn()
      };

      mockProxyHelper('getBogus', {
        url: '/proxy/some/api/items'
      });

      // @ts-expect-error - test passes argument but function doesn't use it
      initApp(mockGasket);
      mockEndpointFn = mockApp.get.mock.calls[0][2];
    });

    it('executes proxy function when called', async () => {
      await mockEndpointFn(mockReq, mockRes);
      expect(mockProxies.getBogus).toHaveBeenCalled();
    });

    it('sets status from proxy response', async () => {
      await mockEndpointFn(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('sets headers from proxy response', async () => {
      await mockEndpointFn(mockReq, mockRes);
      expect(mockRes.set).toHaveBeenCalledWith('bogus', 'BOGUS');
    });

    it('sets body from proxy response', async () => {
      await mockEndpointFn(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalledWith(mockResponse.body);
    });
  });
});
