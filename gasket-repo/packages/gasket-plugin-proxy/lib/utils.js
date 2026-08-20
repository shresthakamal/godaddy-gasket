import deep from 'deepmerge';
import transformUrl from 'transform-url';
import express from 'express';

const jsonParser = express.json();

const isFunction = maybeFn => (typeof maybeFn === 'function');

const methodsWithoutBodies = new Set(['get', 'head', 'connect', 'trace']);

/**
 * Many of the props in proxy description can either be json objects or a function. If they are configured as function,
 * this function executes it and returns the output of that back.
 * @param {import('.').ConfigContext} context - Context to be passed to config
 * @param {Function | string} maybeFn - function to be executed
 * @returns {object | string | Function} output of the function
 * @private
 */
const exec = (context, maybeFn) =>
  typeof maybeFn === 'function' ? maybeFn(context) : maybeFn;

/**
 * Checks if function is returned, indicating thunk setup. Allows context to be passed to setup.
 * @param {import('.').ConfigContext} context - Context to be passed to config
 * @param {Function} maybeThunk - The possible thunk function.
 * @returns {Function} The original function or the configured function.
 * @private
 */
const prepThunk = (context, maybeThunk) => {
  try {
    return isFunction(maybeThunk(context)) ? exec(context, maybeThunk) : maybeThunk;
  } catch {
    return maybeThunk;
  }
};

/**
 * Many of the props in proxy description are defined at the root level as well as at the endpoint level (for more
 * granular control). This function merges both props and returns the final data.
 * @param {import('.').ConfigContext} context - Context to be passed to config functions
 * @param {...object | Function} configs - one or many config objects or functions
 * @returns {object} merged data from configs
 * @private
 */
function assignConfigs(context, ...configs) {
  return deep.all(configs.map(config => exec(context, config)));
}

/**
 * This function transforms the targetUrl by using the parameters passed in path params and query params
 * @type {import('.').fixTargetUrl}
 * @private
 */
function fixTargetUrl(context, targetUrl) {
  const { req } = context;
  targetUrl = exec(context, targetUrl);
  const { params, query } = req;
  return transformUrl(targetUrl, { ...params, ...query });
}

/**
 * This function normalizes the headers object to a plain object.
 * @type {import('.').normalizeHeaders}
 * @private
 */
const normalizeHeaders = (rawHeaders, filter) => {
  if (!rawHeaders) return {};
  /** @type {Record<string, string>} */
  const headers = {};

  // @ts-ignore - entries is not in the types
  const entries = 'entries' in rawHeaders ? Array.from(rawHeaders.entries()) : Object.entries(rawHeaders);

  entries.forEach(([key, value]) => {
    // Handle when header values are arrays
    // https://nodejs.org/api/http.html#messageheadersdistinct
    const v = Array.isArray(value) ? value.join(', ') : value;

    // If filter is provided, only include headers that pass
    if (!filter || filter([key, v])) {
      headers[key] = v;
    }
  });

  return headers;
};

/**
 * The headers from gasket seems to contain the `host` property, which is causing issues with making some calls.
 * This function is currently removing that header entry for now. If we find more such headers causing problems, we can
 * handle those here as well.
 * @type {import('.').sanitizeOptions}
 * @private
 */
function sanitizeOptions(options) {
  const { method = 'GET' } = options;
  const newOptions = { ...options };

  if (options.headers) {
    // Remove http2 pseudo headers and host header
    const filter = ([key]) => !key.startsWith(':') && key !== 'host';
    newOptions.headers = normalizeHeaders(options.headers ?? {}, filter);
  }

  if (methodsWithoutBodies.has(method.toLowerCase())) {
    delete newOptions.body;
  }

  return newOptions;
}

export {
  jsonParser,
  exec,
  prepThunk,
  assignConfigs,
  sanitizeOptions,
  fixTargetUrl,
  normalizeHeaders
};
