import { withGasketRequestCache } from '@gasket/request';
import * as opentelemetry from '@opentelemetry/api';

const cookieMaxAge = 1000 * 60 * 2; // 2 minutes

/** @type {import('@gasket/core').ActionHandler<'getTraceId'>} */
const getTraceId = withGasketRequestCache(
  async function getTraceId() {
    const activeContext = opentelemetry.context.active();
    let traceId = null;
    if (activeContext) {
      const currentSpan = opentelemetry.trace.getSpanContext(activeContext);
      traceId = currentSpan?.traceId ?? null;
    }
    return traceId;
  }
);

/** @type {import('@gasket/core').ActionHandler<'setTraceIdCookie'>} */
const setTraceIdCookie = withGasketRequestCache(
  async function setTraceIdCookie(gasket, req, res) {
    const traceId = await gasket.actions.getTraceId(req);

    if (!traceId) {
      gasket.logger?.warn('No trace ID available to set in cookie.');
      return;
    }

    if (res && ('cookie' in res) && typeof res.cookie === 'function') {
      try {
        res.cookie(
          'traceid',
          traceId, {
            maxAge: cookieMaxAge,
            httpOnly: false,
            signed: false
          }
        );
      } catch (e) {
        gasket.logger?.error('Failed to set trace ID cookie:', e);
      }
    } else {
      gasket.logger?.error('Response object does not have cookie method. Cannot set trace ID cookie.');
      return;
    }

    return traceId;
  }
);

/**
 * Get an OpenTelemetry Meter for recording custom metrics. The global
 * MeterProvider is configured by @godaddy/gasket-otel (metrics are exported
 * automatically), so instruments created from this meter are live.
 * @type {import('@gasket/core').ActionHandler<'getOtelMeter'>}
 */
const getOtelMeter = (gasket, name, options) =>
  opentelemetry.metrics.getMeter(name, options?.version, options?.options);

export { getTraceId, setTraceIdCookie, getOtelMeter };
