/* eslint-disable max-statements */

import {
  prepThunk,
  assignConfigs,
  sanitizeOptions,
  fixTargetUrl
} from './utils.js';
import { defaultRequestAdapter } from './request-adapter.js';
import { defaultCache, defaultLogLevels } from './constants.js';

/**
 * This function reads the plugin config and proxy description data and builds a set of props that apply for a given
 * endpoint.
 * @type {import('.').configureProxy}
 */
function configureProxy(context, proxyDesc) {
  const { gasket, req } = context;
  const { proxy } = gasket.config;
  const {
    options: baseOptions = {},
    cache: baseCache = {},
    logLevels: baseLogLevels = {},
    requestAdapter: baseRequestAdapter
  } = proxy;
  const {
    requestTransform,
    responseTransform,
    method: endpointMethod = 'GET',
    requestAdapter: endpointRequestAdapter,
    targetUrl: endpointTargetUrl,
    options: endpointOptions = {},
    cache: endpointCache,
    logLevels: endpointLogLevels = {},
    logResponse
  } = proxyDesc;

  const { headers, body } = req;
  const reqOptions = { method: endpointMethod };
  if (headers) reqOptions.headers = headers;
  if (body) reqOptions.body = body;

  const { method = endpointMethod, ...options } = sanitizeOptions(
    assignConfigs(context, reqOptions, baseOptions, endpointOptions)
  );
  const isCacheEnabled = method === 'GET' && endpointCache;
  const cache = isCacheEnabled ? assignConfigs(context, defaultCache, baseCache, endpointCache) : false;
  const url = fixTargetUrl(context, endpointTargetUrl);
  const logLevels = assignConfigs(context, defaultLogLevels, baseLogLevels, endpointLogLevels);
  const requestAdapter = endpointRequestAdapter || baseRequestAdapter || defaultRequestAdapter;

  const config = {
    options,
    method,
    cache,
    url,
    logLevels,
    requestAdapter,
    logResponse
  };

  if (requestTransform) {
    config.requestTransform = prepThunk(context, requestTransform);
  }

  if (responseTransform) {
    config.responseTransform = prepThunk(context, responseTransform);
  }

  return config;
}

export default configureProxy;
