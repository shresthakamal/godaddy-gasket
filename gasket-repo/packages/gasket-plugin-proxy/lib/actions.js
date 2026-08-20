import configureProxy from './configure-proxy.js';
import { makeRequest } from './request-adapter.js';
import { logResponse } from './log.js';

const cacheMap = new WeakMap();
const proxyMap = new Map();

/**
 * Make proxy functions
 * @type {import('.').makeProxies}
 */
function makeProxies(gasket) {
  const { proxy } = gasket.config;
  const { proxies } = proxy || {};
  if (!proxies) return {};

  return Object.fromEntries(
    Object.entries(proxies).map(([key, proxyDesc]) => [
      key,
      /** @type {import('.').ProxyFn} */
      async function (req) {
        const proxyConfig = configureProxy({ gasket, req }, proxyDesc);
        const { cache, url, logLevels, logResponse: customLogger } = proxyConfig;

        if (cache) {
          if (!cacheMap.has(req)) {
            cacheMap.set(req, cache);
          }
          const cachedResponse = cacheMap.get(req).get(url);
          if (cachedResponse) {
            return cachedResponse;
          }
        }

        const response = await makeRequest(proxyConfig, { originalReq: req, gasket });
        logResponse({ gasket, customLogger, logLevels, response });

        if (cache && response.status < 400) {
          cacheMap.get(req).set(url, response);
        }
        return response;
      }
    ])
  );
}

/** @type {import('@gasket/core').ActionHandler<'getProxies'>} */
function getProxies(gasket) {
  const key = gasket.symbol;
  if (!proxyMap.has(key)) {
    proxyMap.set(key, makeProxies(gasket));
  }

  return proxyMap.get(key);
}

export {
  getProxies
};
