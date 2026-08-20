/// <reference types="@gasket/plugin-middleware" />
/// <reference types="@gasket/plugin-logger" />

/**
 * Creates a middleware function that attaches a trace ID to the request.
 * @type {import('./index.d.ts').makeTracedIdMiddleware}
 */
function makeTracedIdMiddleware(gasket) {
  return async function tracedIdMiddleware(req, res, next) {
    try {
      // @ts-ignore - type incompatibility between IncomingMessage and RequestLike
      const traceId = await gasket.actions.getTraceId(req);
      if (!traceId) {
        gasket.logger?.debug('Trace ID is missing. Proceeding without it.');
      }

      res.locals.trace = { traceId };
      res.locals.gasketData = Object.assign({}, res.locals.gasketData, { trace: res.locals.trace });

      res.setTraceIdCookie = function setTraceIdCookie() {
        try {
          res.cookie('traceid', res.locals.trace.traceId, {
            maxAge: 1000 * 60 * 2, // 2 minutes
            httpOnly: false,
            signed: false
          });
        } catch (e) {
          gasket.logger?.error('Failed to set trace ID cookie:', e);
        }
      };

      return void next();
    } catch (err) {
      gasket.logger?.error('Error in tracedIdMiddleware:', err);
      return void next(err);
    }
  };
}

/**
 * Gasket middleware hook handler.
 * @type {import('@gasket/core').HookHandler<'middleware'>}
 */
function handler(gasket) {
  return [makeTracedIdMiddleware(gasket)];
}


const hook = {
  timing: {
    before: ['@gasket/plugin-redux']
  },
  handler
};

export default hook;
export { makeTracedIdMiddleware, handler };
