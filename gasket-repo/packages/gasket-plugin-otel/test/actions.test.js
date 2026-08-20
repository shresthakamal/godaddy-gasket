import { vi } from 'vitest';

const { mockActiveContext, mockGetSpanContext, mockGetMeter } = vi.hoisted(() => ({
  mockActiveContext: vi.fn(),
  mockGetSpanContext: vi.fn(),
  mockGetMeter: vi.fn()
}));

vi.mock('@opentelemetry/api', () => ({
  context: {
    active: mockActiveContext.mockReturnValue(true)
  },
  trace: {
    getSpanContext: mockGetSpanContext
  },
  metrics: {
    getMeter: mockGetMeter
  }
}));

import * as actions from '../lib/actions.js';


describe('actions', () => {
  let mockGasket, mockReq;

  beforeEach(() => {
    mockGasket = {};
    mockReq = { headers: { 'x-example': 'example' } };
  });

  it('should return an object', () => {
    expect(actions).toEqual(expect.any(Object));
  });

  it('should have a getTraceId property', () => {
    expect(actions.getTraceId).toEqual(expect.any(Function));
  });

  describe('getTraceId', () => {

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return a string', async () => {
      mockGetSpanContext.mockReturnValueOnce({ traceId: '1234' });
      const results = await actions.getTraceId(mockGasket, mockReq);
      expect(results).toEqual(expect.any(String));
    });

    it('should return a traceId', async () => {
      mockGetSpanContext.mockReturnValueOnce({ traceId: '1234' });
      const results = await actions.getTraceId(mockGasket, mockReq);
      expect(results).toEqual('1234');
    });

    it('should return null if no traceId', async () => {
      mockGetSpanContext.mockReturnValueOnce(null);
      const results = await actions.getTraceId(mockGasket, mockReq);
      expect(results).toEqual(null);
    });

    it('should return null if no active context', async () => {
      mockActiveContext.mockReturnValueOnce(null);
      const results = await actions.getTraceId(mockGasket, mockReq);
      expect(results).toEqual(null);
    });

    it('should return cached traceId', async () => {
      mockGetSpanContext.mockReturnValueOnce({ traceId: '1234' });
      const results = await actions.getTraceId(mockGasket, mockReq);
      const results2 = await actions.getTraceId(mockGasket, mockReq);
      expect(results).toEqual('1234');
      expect(results).toBe(results2);
      expect(mockGetSpanContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('setTraceIdCookie', () => {
    let mockRes;

    beforeEach(() => {
      mockGasket = {
        actions: {
          getTraceId: vi.fn().mockResolvedValue('1234')
        },
        logger: {
          warn: vi.fn(),
          error: vi.fn()
        }
      };
      mockRes = {
        cookie: vi.fn()
      };
      vi.clearAllMocks();
    });

    it('should return a string', async () => {
      mockGasket.actions.getTraceId.mockResolvedValueOnce('1234');
      const results = await actions.setTraceIdCookie(mockGasket, mockReq, mockRes);
      expect(results).toEqual(expect.any(String));
    });

    it('should set a cookie with traceId', async () => {
      mockGasket.actions.getTraceId.mockResolvedValueOnce('1234');
      await actions.setTraceIdCookie(mockGasket, mockReq, mockRes);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'traceid',
        '1234',
        expect.objectContaining({
          maxAge: 1000 * 60 * 2,
          httpOnly: false,
          signed: false
        })
      );
    });

    it('gracefully handle errors when setting cookie', async () => {
      const error = new Error('Cookie error');
      mockRes.cookie.mockImplementationOnce(() => { throw error; });
      await actions.setTraceIdCookie(mockGasket, mockReq, mockRes);
      expect(mockGasket.logger.error)
        .toHaveBeenCalledWith('Failed to set trace ID cookie:', error);
    });

    it('gracefully handle missing res.cookie method', async () => {
      delete mockRes.cookie;
      await actions.setTraceIdCookie(mockGasket, mockReq, mockRes);
      expect(mockGasket.logger.error)
        .toHaveBeenCalledWith(expect.stringContaining('Response object does not have cookie method.'));
    });

    it('gracefully handle nullish trace id', async () => {
      mockGasket.actions.getTraceId.mockResolvedValueOnce(null);
      await actions.setTraceIdCookie(mockGasket, mockReq, mockRes);
      expect(mockGasket.logger.warn)
        .toHaveBeenCalledWith(expect.stringContaining('No trace ID available to set in cookie.'));
    });

  });

  describe('getOtelMeter', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should be a function', () => {
      expect(actions.getOtelMeter).toEqual(expect.any(Function));
    });

    it('should return the meter from the OTel metrics API', () => {
      const meter = { createObservableGauge: vi.fn() };
      mockGetMeter.mockReturnValueOnce(meter);
      const result = actions.getOtelMeter(mockGasket, 'my-service');
      expect(result).toBe(meter);
    });

    it('should forward the required name (no version/options) through to getMeter', () => {
      actions.getOtelMeter(mockGasket, 'my-service');
      expect(mockGetMeter).toHaveBeenCalledWith('my-service', void 0, void 0);
    });

    it('should forward version and MeterOptions from the options object', () => {
      const meterOptions = { schemaUrl: 'https://schema.example/v1' };
      actions.getOtelMeter(mockGasket, 'my-service', { version: '2.0.0', options: meterOptions });
      expect(mockGetMeter).toHaveBeenCalledWith('my-service', '2.0.0', meterOptions);
    });

    it('should not throw when options is null', () => {
      expect(() => actions.getOtelMeter(mockGasket, 'my-service', null)).not.toThrow();
      expect(mockGetMeter).toHaveBeenCalledWith('my-service', void 0, void 0);
    });
  });
});
