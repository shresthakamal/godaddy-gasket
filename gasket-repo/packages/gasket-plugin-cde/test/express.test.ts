import { describe, it, expect, vi, beforeEach } from 'vitest';
import expressHook from '../src/express';
import { sendAppEvaluationEvent } from '../src/actions';
import type { Gasket } from '@gasket/core';
import type { Express, Request, Response, NextFunction } from 'express';

vi.mock('../src/actions', () => ({
  sendAppEvaluationEvent: vi.fn()
}));

describe('express hook', () => {
  let gasket: Partial<Gasket>;
  let app: Partial<Express>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    gasket = {};
    req = { headers: {} };
    res = {};
    next = vi.fn();
    app = { use: vi.fn() as any };
  });

  it('registers middleware with app.use', () => {
    expressHook.handler(gasket as Gasket, app as Express);
    expect(app.use).toHaveBeenCalledWith(expect.any(Function));
  });

  it('calls sendAppEvaluationEvent and next', async () => {
    expressHook.handler(gasket as Gasket, app as Express);
    const middleware = (app.use as any).mock.calls[0][0];
    await middleware(req as Request, res as Response, next);
    expect(sendAppEvaluationEvent).toHaveBeenCalledWith(gasket, expect.any(Object));
    expect(next).toHaveBeenCalled();
  });

  it('calls next with error if sendAppEvaluationEvent throws', async () => {
    (sendAppEvaluationEvent as any).mockImplementationOnce(() => { throw new Error('fail'); });
    expressHook.handler(gasket as Gasket, app as Express);
    const middleware = (app.use as any).mock.calls[0][0];
    await middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
