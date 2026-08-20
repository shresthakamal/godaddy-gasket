/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@gasket/plugin-logger" />
/// <reference types="@gasket/plugin-metadata" />
import { withGasketRequestCache } from '@gasket/request';
import { createCdeMiddleware } from '@cde/node-sdk';
import { Gasket } from '@gasket/core';
import { CdeAppEvaluationEvent } from './types.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version } = packageJson;

type CdeMiddleware = ReturnType<typeof createCdeMiddleware>;
let cdeMiddlewareInstance: CdeMiddleware;

/**
 *
 * @param gasket
 */
function getCdeMiddleware(gasket: Gasket) {
  const cdeConfig = gasket.config.cde;
  if (!cdeConfig?.enable) return null;

  if (!cdeMiddlewareInstance) {
    cdeMiddlewareInstance = createCdeMiddleware(
      {
        ...cdeConfig.options,
        logger: gasket.logger
      },
      name,
      version
    );
  }

  return cdeMiddlewareInstance;
}

const sendAppEvaluationEvent = withGasketRequestCache(async (gasket, req: any) => {
  try {
    const middlewareInstance = getCdeMiddleware(gasket);
    if (!middlewareInstance) return null;

    const [visitor, shopperAuth, traceIdResult] = await Promise.all([
      gasket.actions.getVisitor?.(req),
      gasket.actions.checkShopperAuth?.(req),
      gasket.actions.getTraceId?.(req)
    ]);

    const { customerId, shopperId, ucid: careUcidJomaxId } = shopperAuth?.valid ? shopperAuth.details : {};
    const { visitorId, sessionId } = visitor || {};

    const eventDetails = {
      visitorId,
      sessionId,
      customerId,
      shopperId,
      careUcidJomaxId,
      requestPath: req.path
    };

    if (traceIdResult) {
      (eventDetails as CdeAppEvaluationEvent).traceId = traceIdResult;
    }

    const cdeOptions = gasket.config.cde?.options || {};
    const evaluationContext = await gasket.execWaterfall('appEvaluationEvent', { ...cdeOptions, ...eventDetails }, { req });

    await middlewareInstance(evaluationContext);
  } catch (error) {
    gasket.logger?.warn('CDE: Error in middleware', { error });
  }
});

export { sendAppEvaluationEvent };
