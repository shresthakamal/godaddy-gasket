/// <reference types="@gasket/plugin-express" />

import { checkRouteAuth } from './sso-route-protection.js';
import setupRoutes from './setup-routes.js';

/** @type {import('./internal').SetupRouteProtectionExpress} */
function setupRouteProtection(gasket) {
  const authRoutes = gasket.config.auth?.authRoutes;

  if (!authRoutes || Object.keys(authRoutes).length === 0) {
    return null;
  }

  return async function authRouteMiddleware(req, res, next) {
    const result = await checkRouteAuth(gasket, req);

    if (result && typeof result === 'object' && result.unauthorized) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    if (typeof result === 'string') {
      res.writeHead(302, { Location: result });
      res.end();
      return;
    }

    next();
  };
}

/**
 * Express lifecycle handler - sets up route protection then routes
 * @type {import('@gasket/core').HookHandler<'express'>}
 */
function expressHandler(gasket, app) {
  // Setup route protection middleware first
  const routeMiddleware = setupRouteProtection(gasket);
  if (routeMiddleware) {
    app.use(routeMiddleware);
  }

  // Setup validation routes after route middleware
  setupRoutes(gasket, app);
}

export default expressHandler;
