import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendAppEvaluationEvent } from '../src/actions';
import { RequestLike } from '@gasket/request';

const mockMiddleware = vi.fn();
const mockCreateCdeMiddleware = vi.fn(() => mockMiddleware);
vi.mock('@cde/node-sdk', () => ({
  createCdeMiddleware: (...args: []) => mockCreateCdeMiddleware(...args)
}));

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn()
};

describe('sendAppEvaluationEvent', () => {
  let gasket: any;
  let req: RequestLike;

  beforeEach(() => {
    vi.clearAllMocks();
    gasket = {
      config: {
        cde: {
          enable: true,
          options: { foo: 'bar' }
        }
      },
      logger: mockLogger,
      actions: {
        getVisitor: vi.fn().mockResolvedValue({ visitorId: 'v1', sessionId: 's1' }),
        checkShopperAuth: vi.fn().mockResolvedValue({
          valid: true,
          details: {
            customerId: 'c1',
            shopperId: 'sh1',
            ucid: 'ucid1'
          }
        }),
        getTraceId: vi.fn().mockResolvedValue('trace-123')
      },
      execWaterfall: vi.fn((hook, eventDetails) => Promise.resolve(eventDetails))
    };
    req = { path: '/foo', headers: { host: '' }, baseUrl: '' } as any;
  });

  it('calls middleware with correct evaluationContext', async () => {
    await sendAppEvaluationEvent(gasket, req);
    expect(mockCreateCdeMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({ foo: 'bar', logger: mockLogger }),
      expect.any(String),
      expect.any(String)
    );
    expect(mockMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorId: 'v1',
        sessionId: 's1',
        customerId: 'c1',
        shopperId: 'sh1',
        careUcidJomaxId: 'ucid1',
        requestPath: '/foo',
        traceId: 'trace-123',
        foo: 'bar'
      })
    );
  });

  it('allows execWaterfall to override config options before passing evaluationContext to middleware', async () => {
    const execWaterfallSpy = vi.spyOn(gasket, 'execWaterfall');
    gasket.execWaterfall.mockResolvedValueOnce({
      visitorId: 'v1',
      sessionId: 's1',
      customerId: 'c1',
      shopperId: 'sh1',
      careUcidJomaxId: 'ucid1',
      requestPath: '/foo',
      traceId: 'trace-123',
      foo: 'override-bar',
      extra: 'baz'
    });
    await sendAppEvaluationEvent(gasket, req);
    expect(execWaterfallSpy).toHaveBeenCalledWith(
      'appEvaluationEvent',
      expect.objectContaining({
        visitorId: 'v1',
        sessionId: 's1',
        customerId: 'c1',
        shopperId: 'sh1',
        careUcidJomaxId: 'ucid1',
        requestPath: '/foo',
        traceId: 'trace-123',
        foo: 'bar'
      }),
      expect.any(Object)
    );
    expect(mockMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorId: 'v1',
        sessionId: 's1',
        customerId: 'c1',
        shopperId: 'sh1',
        careUcidJomaxId: 'ucid1',
        requestPath: '/foo',
        traceId: 'trace-123',
        foo: 'override-bar',
        extra: 'baz'
      })
    );
  });

  it('returns null if cde is not enabled', async () => {
    gasket.config.cde.enable = false;
    const result = await sendAppEvaluationEvent(gasket, req);
    expect(result).toBeNull();
    expect(mockCreateCdeMiddleware).not.toHaveBeenCalled();
    expect(mockMiddleware).not.toHaveBeenCalled();
  });

  it('logs warning if middleware throws error', async () => {
    mockMiddleware.mockImplementationOnce(() => { throw new Error('fail'); });
    await sendAppEvaluationEvent(gasket, req);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'CDE: Error in middleware',
      expect.objectContaining({ error: expect.any(Error) })
    );
  });

  it('logs warning if outer try/catch catches error', async () => {
    gasket.actions.getVisitor.mockRejectedValueOnce(new Error('outer fail'));
    await sendAppEvaluationEvent(gasket, req);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'CDE: Error in middleware',
      expect.objectContaining({ error: expect.any(Error) })
    );
  });

  it('uses appEvaluationEvent from lifecycle', async () => {
    gasket.execWaterfall.mockResolvedValue({
      visitorId: 'pv',
      sessionId: 'ps',
      customerId: 'pc',
      shopperId: 'psh',
      careUcidJomaxId: 'pucj',
      requestPath: '/foo',
      traceId: 'trace-123',
      foo: 'bar'
    });
    await sendAppEvaluationEvent(gasket, req);
    expect(mockMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorId: 'pv',
        sessionId: 'ps',
        customerId: 'pc',
        shopperId: 'psh',
        careUcidJomaxId: 'pucj',
        requestPath: '/foo',
        traceId: 'trace-123',
        foo: 'bar'
      })
    );
  });
});
