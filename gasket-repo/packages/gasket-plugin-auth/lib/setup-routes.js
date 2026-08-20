import configureEndpoint from './endpoint.js';

/**
 * Setup routes for the auth plugin
 * @type {import('./internal').setupRoutes}
 */
export default function setupRoutes(gasket, app) {
  const { basePath } = gasket.config?.auth || {};
  // Some proxies strip the base path to endpoints.
  // This provides a safeguard for both setups.
  app.get('/api/auth/validate', configureEndpoint(gasket));
  if (basePath) {
    app.get(basePath + '/api/auth/validate', configureEndpoint(gasket));
  }
}
