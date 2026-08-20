import hook from '../lib/middleware.js';
import { vi } from 'vitest';

describe('middlewareHook', () => {
  let mockGasket, mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockGasket = {
      actions: {
        getTraceId: vi.fn().mockResolvedValue('1234')
      },
      logger: {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
      }
    };

    mockReq = { headers: { 'x-example': 'example' } };
    mockRes = {
      locals: {},
      cookie: vi.fn()
    };
    mockNext = vi.fn();
  });

  it('should be an object', () => {
    expect(hook).toEqual(expect.any(Object));
  });

  it('should have a timing property', () => {
    expect(hook).toHaveProperty('timing');
    expect(hook.timing).toEqual(expect.any(Object));
    expect(hook.timing).toHaveProperty('before');
    expect(hook.timing.before).toEqual(expect.any(Array));
  });

  it('should have a handler property', () => {
    expect(hook).toHaveProperty('handler');
    expect(hook.handler).toEqual(expect.any(Function));
  });

  describe('handler', () => {
    it('should return an array containing one function', () => {
      const middlewareArray = hook.handler(mockGasket);
      expect(middlewareArray).toEqual(expect.any(Array));
      expect(middlewareArray.length).toBe(1);
      expect(middlewareArray[0]).toEqual(expect.any(Function));
      expect(middlewareArray[0].name).toBe('tracedIdMiddleware');
    });
  });

  describe('tracedIdMiddleware', () => {
    let tracedIdMiddleware;

    beforeEach(() => {
      tracedIdMiddleware = hook.handler(mockGasket)[0];
    });

    it('should be a function', () => {
      expect(tracedIdMiddleware).toEqual(expect.any(Function));
    });

    it('should call getTraceId with the request object', async () => {
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockGasket.actions.getTraceId).toHaveBeenCalledWith(mockReq);
    });

    it('should set traceId on res.locals', async () => {
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockRes.locals.trace).toEqual({ traceId: '1234' });
    });

    it('should initialize res.locals.gasketData if missing', async () => {
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockRes.locals.gasketData.trace).toEqual({ traceId: '1234' });
    });

    it('should merge traceId into existing res.locals.gasketData', async () => {
      mockRes.locals.gasketData = { existing: true };
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockRes.locals.gasketData).toEqual({
        existing: true,
        trace: { traceId: '1234' }
      });
    });

    it('should define res.setTraceIdCookie as a function', async () => {
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockRes.setTraceIdCookie).toEqual(expect.any(Function));
    });

    it('should correctly set the traceId cookie', async () => {
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      mockRes.setTraceIdCookie();
      expect(mockRes.cookie).toHaveBeenCalledWith('traceid', '1234', {
        maxAge: 120000,
        httpOnly: false,
        signed: false
      });
    });

    it('should log an error if setting the cookie fails', async () => {
      const cookieError = new Error('Cookie error');
      mockRes.cookie.mockImplementationOnce(() => {
        throw cookieError;
      });

      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      mockRes.setTraceIdCookie();

      expect(mockGasket.logger.error).toHaveBeenCalledWith(
        'Failed to set trace ID cookie:',
        cookieError
      );
    });


    it('should call next()', async () => {
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log a debug when traceId is missing', async () => {
      mockGasket.actions.getTraceId.mockResolvedValueOnce(null);
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockGasket.logger.debug).toHaveBeenCalledWith(
        'Trace ID is missing. Proceeding without it.'
      );
    });

    it('should call next with an error if getTraceId rejects', async () => {
      const error = new Error('test error');
      mockGasket.actions.getTraceId.mockRejectedValueOnce(error);
      await tracedIdMiddleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
