/**
 * Add default HTTP ignore rules; preserve user ignoreIncomingRequestHook if any.
 * @param {import(".").OtelRegisterOptions} [options] - getNodeAutoInstrumentations map
 * @returns {Record<string, unknown>} merged map including HTTP defaults
 */
export function withHttpDefaults(options = {}) {
  const rawHttpOptions = options['@opentelemetry/instrumentation-http'];
  const userHttpOptions = rawHttpOptions && typeof rawHttpOptions === 'object'
    ? /** @type {Record<string, unknown>} */ (rawHttpOptions)
    : {};
  const userIgnoreRequestHook = userHttpOptions.ignoreIncomingRequestHook;

  return {
    ...options,
    '@opentelemetry/instrumentation-http': {
      ...userHttpOptions,
      ignoreIncomingRequestHook: (req) => {
        if (skipHealthChecks(req)) return true;
        if (typeof userIgnoreRequestHook === 'function') return userIgnoreRequestHook(req);
        return false;
      }
    }
  };
}

/**
 * Ignore health checks (like the Katana ones and the Site24x7 ones)
 * @param {import('http').IncomingMessage} req - incoming HTTP request
 * @returns {boolean} true to skip tracing for this request
 */
function skipHealthChecks(req) {
  return req.url === '/healthcheck' || req.headers['user-agent'] === 'Site24x7';
}
