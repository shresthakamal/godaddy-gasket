/// <reference types="@gasket/plugin-logger" />
/// <reference types="@godaddy/gasket-plugin-visitor" />

import sharedHeader from '@wsb/shared-header-client';
import { getEnvFromRuntime } from './utils.js';

/**
 * Get the shared header configuration from the gasket config.
 * @type {import('.').getPcSharedHeaderConfig}
 */
function getPcSharedHeaderConfig(gasket) {
  return gasket.config.pcSharedHeader;
}

/**
 * Wrapper around Shared Header to provide it with some sane defaults
 * and potential wrapping of methods.
 * @type {import('.').getSharedHeaderClient}
 */
function getSharedHeaderClient(gasket) {
  const config = getPcSharedHeaderConfig(gasket);
  const env = getEnvFromRuntime(gasket.config);
  const client = config.client;
  let sharedHeaderOptions = {};
  if (client && client.options) {
    let { cache } = client.options;
    cache = typeof cache === 'function' ? cache(env) : cache;
    sharedHeaderOptions = { ...client.options, cache };
  }

  return sharedHeader(env, sharedHeaderOptions);
}

/**
 * Extracts all required information we need from the request, and returns
 * an object that can be used as base for shared-header params.
 * @type {import('.').getParams}
 */
// eslint-disable-next-line max-statements
async function getParams(gasket, req) {
  const config = getPcSharedHeaderConfig(gasket);
  const visitor = await gasket.actions.getVisitor(req);
  const { plid, market: locale = 'en-US' } = visitor;
  const { cookies = {} } = req;
  const { app, options = {} } = config.params;
  const jwt = cookies.auth_idp;
  const data = { jwt, app, locale, plid, options };

  // Here we will await the response of the lifecycle event for passed-in identifiers
  // and options
  try {
    const {
      accountId,
      appId,
      businessId,
      domainName,
      options: opts,
      storeId,
      ventureId,
      websiteId
    } = (await gasket.exec('sharedHeader', { req }, data))[0] || {};

    data.accountId = accountId;
    data.appId = appId;
    data.businessId = businessId;
    data.domainName = domainName;
    data.storeId = storeId;
    data.type = 'header'; // we will always want to get the header from this call
    data.ventureId = ventureId;
    data.websiteId = websiteId;

    if (opts) data.options = opts;
  } catch (e) {
    gasket.logger.error(`sharedHeader failed with: ${e}`); //eslint-disable-line
  }

  const uxcoreParam = req.query['shared-header.uxcore'];
  // business endpoint defaults to independents-header
  const isCommerce = !!data.businessId || !!data.storeId;
  const manifest = (data.options.params || {})['header_options[manifest]'];

  data.options = {
    ...data.options,
    params: {
      ...data.options.params,
      ...(uxcoreParam ? { 'header_options[uxcore]': uxcoreParam } : {}),
      ...(isCommerce ? { 'header_options[manifest]': manifest || 'independents-header' } : {})
    }
  };

  // delete params if it exists as an empty object
  if (Object.keys(data.options.params).length === 0) delete data.options.params;

  return data;
}

/**
 * Request a new header.
 * @type {import('.').request}
 */
async function request(gasket, params = {}) {
  const {
    jwt,
    plid,
    app,
    accountId,
    websiteId,
    ventureId,
    businessId,
    appId,
    storeId,
    locale,
    hostname,
    type,
    domainName,
    options = {}
  } = params;

  const sharedHeaderClient = getSharedHeaderClient(gasket);

  if (websiteId) {
    return await sharedHeaderClient.getHeader({ jwt, plid, app, websiteId, locale, hostname }, options);
  } else if (accountId) {
    return await sharedHeaderClient.getByAccountId({ jwt, plid, app, accountId, locale, hostname, type }, options);
  } else if (businessId && storeId) {
    return await sharedHeaderClient.getByBusinessAndStore(
      { jwt, plid, app, businessId, storeId, locale, hostname, type },
      options
    );
  } else if (businessId) {
    return await sharedHeaderClient.getByBusiness(
      { jwt, plid, app, businessId, locale, hostname, type },
      options
    );
  } else if (storeId) {
    return await sharedHeaderClient.getByStore(
      { jwt, plid, app, storeId, locale, hostname, type },
      options
    );
  } else if (appId) {
    return await sharedHeaderClient.getByAppId(
      { jwt, plid, app, appId, locale, type },
      options
    );
  } else if (domainName) {
    return await sharedHeaderClient.getByDomain(
      { jwt, plid, app, domainName, locale, type },
      options
    );
  }

  return await sharedHeaderClient.getByVenture({ jwt, plid, app, ventureId, locale, hostname, type }, options);
}


/**
 * Get the headers, either by requesting them or
 * from the prefetched cache.
 * @type {import('.').getHeaders}
 */
async function getHeaders(gasket, req) {
  // fallback to standard sh request
  const params = await getParams(gasket, req);
  return await request(gasket, params);
}

/**
 * Prefetch and store headers on the req object
 * for later use.
 * This methost must be explicit called by the consumer.
 * @type {import('.').prefetchHeaders}
 */
async function prefetchHeaders(gasket, req) {
  const config = getPcSharedHeaderConfig(gasket);
  if (config.prefetch !== true) {
    gasket.logger.warn('SharedHeader#prefetchHeaders called, but config.prefetch is turned off. Doing nothing.');
    return null;
  }

  try {
    gasket.logger.debug('Prefetching shared headers for later use.');
    const params = await getParams(gasket, req);
    const response = await request(gasket, params);

    return response;
  } catch (e) {
    gasket.logger.warn(`Failed to prefetch headers: ${e.message}`);

    return null;
  }
}

export {
  getPcSharedHeaderConfig,
  getSharedHeaderClient,
  getParams,
  request,
  getHeaders,
  prefetchHeaders
};
