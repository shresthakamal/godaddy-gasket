import { describe, it, expect, vi, beforeEach } from 'vitest';
import fastifyHook from '../src/fastify';
import { sendAppEvaluationEvent } from '../src/actions';
// import cookie from '@fastify/cookie';
import type { Gasket } from '@gasket/core';
import type { FastifyInstance, FastifyRequest } from 'fastify';

vi.mock('../src/actions', () => ({
  sendAppEvaluationEvent: vi.fn()
}));

describe('fastify hook', () => {
  let gasket: Partial<Gasket>;
  let app: Partial<FastifyInstance>;
  let req: Partial<FastifyRequest>;

  beforeEach(() => {
    gasket = {};
    req = { headers: {} };
    app = {
      register: vi.fn(),
      addHook: vi.fn()
    };
  });

  it('adds preHandler hook', () => {
    fastifyHook.handler(gasket as Gasket, app as FastifyInstance);
    expect(app.addHook).toHaveBeenCalledWith('preHandler', expect.any(Function));
  });

  it('calls sendAppEvaluationEvent in preHandler', async () => {
    fastifyHook.handler(gasket as Gasket, app as FastifyInstance);
    const preHandler = (app.addHook as any).mock.calls[0][1];
    await preHandler(req as FastifyRequest);
    expect(sendAppEvaluationEvent).toHaveBeenCalledWith(gasket, expect.any(Object));
  });
});
