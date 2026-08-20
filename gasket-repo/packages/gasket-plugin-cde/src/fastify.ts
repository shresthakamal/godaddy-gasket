import type { Gasket } from '@gasket/core';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { RequestLike } from '@gasket/request';
import { sendAppEvaluationEvent } from './actions.js';
import { makeGasketRequest } from '@gasket/request';

/**
 * Configure Fastify lifecycle hook
 * @type {import('@gasket/core').HookHandler<'fastify'>}
 */
function setupFastify(gasket: Gasket, app: FastifyInstance) {
  app.addHook('preHandler', async (req: FastifyRequest) => {
    sendAppEvaluationEvent(gasket, await makeGasketRequest(req as RequestLike));
  });
}

const hook = {
  timing: {
    first: true
  },
  handler: setupFastify
};

export default hook;
