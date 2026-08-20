import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const {
  getPcSharedHeaderConfig,
  getSharedHeaderClient,
  getParams,
  request,
  getHeaders,
  prefetchHeaders
} = await import('../lib/shared-header.js');

const getByVentureReturnVal = { value: 'getByVenture' };

vi.mock('@wsb/shared-header-client', () => {
  return {
    default: function () {
      return {
        getByVenture: vi.fn().mockResolvedValue(getByVentureReturnVal)
      };
    }
  };
});

describe('shared-header', function () {
  let mockGasket, visitorValue;

  beforeEach(() => {
    visitorValue = { plid: 321, market: 'en-US' };
    mockGasket = {
      env: 'test',
      config: {
        pcSharedHeader: {
          params: {
            app: 'someapp',
            foo: 'bar'
          },
          client: {
            options: {}
          }
        }
      },
      logger: {
        debug: vi.fn(),
        warn: vi.fn()
      },
      actions: {
        getVisitor: vi.fn().mockResolvedValue(visitorValue)
      },
      exec: vi.fn().mockImplementation((_name, _req, data) => Promise.resolve(data))
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('getPcSharedHeaderConfig', () => {
    it('returns an object', () => {
      expect(typeof getPcSharedHeaderConfig(mockGasket)).toBe('object');
    });

    it('returns the sharedHeader config', () => {
      // @ts-expect-error - custom config property for testing
      expect(getPcSharedHeaderConfig(mockGasket).params.foo).toBe('bar');
    });
  });

  describe('request', () => {
    it('fetches shared headers', async () => {
      // @ts-expect-error - minimal params for testing
      const result = await request(mockGasket);
      expect(result).toBe(getByVentureReturnVal);
    });
  });

  describe('getParams', function () {
    it('executes the `sharedHeader` lifecycle event', async function () {
      const mockReq = { headers: {}, fake: true, query: {} };
      const result = await getParams(mockGasket, mockReq);

      const callArgs = mockGasket.exec.mock.calls[0];
      expect(callArgs[0]).toBe('sharedHeader');
      expect(callArgs[1]).toEqual({ req: mockReq });
      expect(callArgs[2]).toBeInstanceOf(Object);
      expect(result.options).toEqual({});
    });

    describe('uxcore URL param', () => {
      it('sets the uxcore version', async () => {
        const uxcoreVersion = '2101';
        const mockReq = {
          headers: {},
          fake: true,
          query: { 'shared-header.uxcore': uxcoreVersion }
        };
        const result = await getParams(mockGasket, mockReq);

        expect(result.options.params['header_options[uxcore]']).toEqual(uxcoreVersion);
      });

      it('overrides an existing uxcore version', async () => {
        const uxcoreVersion = '2101';
        const mockReq = {
          headers: {},
          fake: true,
          query: { 'shared-header.uxcore': uxcoreVersion }
        };
        mockGasket.config.pcSharedHeader.params.options = {
          params: {
            'header_options[uxcore]': '2100'
          }
        };
        const result = await getParams(mockGasket, mockReq);

        expect(result.options.params['header_options[uxcore]']).toEqual(uxcoreVersion);
      });
    });

    describe('plid, locale params', () => {
      it('sets the plid and locale from the getVisitor action', async () => {
        const mockReq = { headers: {}, fake: true, query: {} };
        const result = await getParams(mockGasket, mockReq);
        expect(result.plid).toEqual(321);
        expect(result.locale).toEqual('en-US');
      });
    });
  });

  describe('getSharedHeaderClient', () => {
    it('returns a shared header client', () => {
      const client = getSharedHeaderClient(mockGasket);
      expect(typeof client.getByVenture).toBe('function');
    });
  });

  describe('prefetchHeaders', () => {
    let mockReq;

    beforeEach(() => {
      mockReq = { headers: {}, fake: true, query: {} };
    });

    it('does nothing', async () => {
      mockGasket.config.pcSharedHeader.prefetch = false;
      const response = await prefetchHeaders(mockGasket, mockReq);
      expect(response).toBe(null);
    });

    it('fetches the shared headers and stores in req', async () => {
      mockGasket.config.pcSharedHeader.prefetch = true;
      const response = await prefetchHeaders(mockGasket, mockReq);

      expect(response).toBe(getByVentureReturnVal);
    });

    it('catches errors and do not store headers in case of any', async () => {
      mockGasket.config.pcSharedHeader.prefetch = true;
      const errorMsg = 'Some error';
      mockGasket.actions.getVisitor = vi.fn().mockRejectedValue(new Error(errorMsg));
      const response = await prefetchHeaders(mockGasket, mockReq);

      expect(response).toBe(null);
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(`Failed to prefetch headers: ${errorMsg}`);
    });
  });

  describe('getHeaders', () => {
    let mockReq;

    beforeEach(() => {
      mockReq = { headers: {}, fake: true, query: {} };
    });

    it('fetches shared headers', async () => {
      mockGasket.config.pcSharedHeader.prefetch = false;
      const response = await getHeaders(mockGasket, mockReq);

      expect(response).toBe(getByVentureReturnVal);
    });
  });

  describe('overrides the manifest if its commerce', () => {

    it('overrides manifest option', async () => {
      const mockGasketV2 = {
        ...mockGasket,
        config: {
          pcSharedHeader: {
            params: {
              businessId: 'some-bid',
              storeId: 'some-sid'
            },
            client: {
              options: {}
            }
          }
        },
        exec: vi.fn().mockImplementation(() => Promise.resolve([{
          businessId: 'some-bid',
          storeId: 'some-sid'
        }]))
      };

      const mockReq = { headers: {}, fake: true, query: {} };
      const result = await getParams(mockGasketV2, mockReq);
      expect(result.options.params).toEqual({ 'header_options[manifest]': 'independents-header' });
      expect(result.businessId).toBe('some-bid');
      expect(result.storeId).toBe('some-sid');
    });

    it('overrides manifest option with only storeId', async () => {
      const mockGasketV2 = {
        ...mockGasket,
        config: {
          pcSharedHeader: {
            params: {
              storeId: 'some-sid'
            },
            client: {
              options: {}
            }
          }
        },
        exec: vi.fn().mockImplementation(() => Promise.resolve([{
          storeId: 'some-sid'
        }]))
      };

      const mockReq = { headers: {}, fake: true, query: {} };
      const result = await getParams(mockGasketV2, mockReq);
      expect(result.options.params).toEqual({ 'header_options[manifest]': 'independents-header' });
      expect(result.storeId).toEqual('some-sid');
    });

    it('overrides manifest option with only businessId', async () => {
      const mockGasketV2 = {
        ...mockGasket,
        config: {
          pcSharedHeader: {
            params: {
              businessId: 'some-bid'
            },
            client: {
              options: {}
            }
          }
        },
        exec: vi.fn().mockImplementation(() => Promise.resolve([{
          businessId: 'some-bid'
        }]))
      };

      const mockReq = { headers: {}, fake: true, query: {} };
      const result = await getParams(mockGasketV2, mockReq);
      expect(result.options.params).toEqual({ 'header_options[manifest]': 'independents-header' });
      expect(result.businessId).toEqual('some-bid');
    });

    it('does not override manifest option if no commerceIds passed', async () => {
      const mockGasketV2 = {
        ...mockGasket,
        config: {
          pcSharedHeader: {
            params: {
              ventureId: 'some-vid'
            },
            client: {
              options: {}
            }
          }
        },
        exec: vi.fn().mockImplementation(() => Promise.resolve([{
          ventureId: 'some-vid'
        }]))
      };

      const mockReq = { headers: {}, fake: true, query: {} };
      const result = await getParams(mockGasketV2, mockReq);
      expect(result.options.params).toBeUndefined();
    });

    it('overrides manifest option with only domainName', async () => {
      const mockGasketV2 = {
        ...mockGasket,
        config: {
          pcSharedHeader: {
            params: {
              domainName: 'test'
            },
            client: {
              options: {}
            }
          }
        },
        exec: vi.fn().mockImplementation(() => Promise.resolve([{
          domainName: 'test'
        }]))
      };

      const mockReq = { headers: {}, fake: true, query: {} };
      const result = await getParams(mockGasketV2, mockReq);
      expect(result.domainName).toEqual('test');
      expect(result.options.params).toBeUndefined();
    });

    it('overrides manifest option with only accountId', async () => {
      const mockGasketV2 = {
        ...mockGasket,
        config: {
          pcSharedHeader: {
            params: {
              accountId: '123'
            },
            client: {
              options: {}
            }
          }
        },
        exec: vi.fn().mockImplementation(() => Promise.resolve([{
          accountId: '123'
        }]))
      };

      const mockReq = { headers: {}, fake: true, query: {} };
      const result = await getParams(mockGasketV2, mockReq);
      expect(result.accountId).toEqual('123');
      expect(result.options.params).toBeUndefined();
    });
  });
});
