/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />

import type { Gasket } from '@gasket/core';
import type { Request, Response, NextFunction } from 'express';
import { makeGasketRequest, type RequestLike } from '@gasket/request';
import type { Express } from 'express';
import { sendAppEvaluationEvent } from './actions.js';

/**
 * Configure Express lifecycle hook
 * @type {import('@gasket/core').HookHandler<'express'>}
 */
function setupExpress(gasket: Gasket, app: Express) {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendAppEvaluationEvent(gasket, await makeGasketRequest(req as RequestLike));
      next();
      return;
    } catch (error) {
      next(error);
      return;
    }
  });
}

const hook = {
  timing: {
    first: true
  },
  handler: setupExpress
};

export default hook;
