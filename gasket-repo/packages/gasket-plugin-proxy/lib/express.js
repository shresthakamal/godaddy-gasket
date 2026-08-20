/// <reference types="@gasket/plugin-express" />

import { jsonParser } from './utils.js';
const ignoreParser = /GET|HEAD|OPTIONS/i;

/**
 * Configure Express lifecycle hook
 * @type {import('@gasket/core').HookHandler<'express'>}
 */
function express(gasket, app) {
  const configuredProxies = gasket.actions.getProxies();
  const { proxy } = gasket.config;
  const { proxies } = proxy || {};
  const { middleware: baseMiddleware = [] } = proxy || {};
  if (!proxies) return;

  Object.keys(proxies).forEach(key => {
    const proxyDesc = proxies[key];
    const { url, method = 'GET' } = proxyDesc;
    const { middleware: endpointMiddleware = [] } = proxyDesc;

    const middleware = [baseMiddleware, endpointMiddleware].reduce((acc, cur) => {
      return [...(Array.isArray(cur) ? cur : [cur]), ...(Array.isArray(acc) ? acc : [acc])];
    }, ignoreParser.test(method) ? [] : [jsonParser]);

    if (url) {
      app[method.toLowerCase()](url, middleware, async function (req, res) {
        const response = await configuredProxies[key](req);

        for (const [k, v] of Object.entries(response.headers)) {
          res.set(k, v);
        }

        res
          .status(response.status)
          .send(response.body);
      });
    }
  });
}

export default {
  timing: {
    after: ['@gasket/plugin-middleware']
  },
  handler: express
};
