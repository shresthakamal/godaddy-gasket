/// <reference types="@gasket/plugin-fastify" />

import { checkRouteAuth } from './sso-route-protection.js';
import setupRoutes from './setup-routes.js';

/** @type {import('./internal').SetupRouteProtectionFastify} */
function setupRouteProtection(gasket) {
  const authRoutes = gasket.config.auth?.authRoutes;

  if (!authRoutes || Object.keys(authRoutes).length === 0) {
    return null;
  }

  return async function authRoutePreHandler(request, reply) {
    const result = await checkRouteAuth(gasket, request);

    if (result && typeof result === 'object' && result.unauthorized) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }

    if (typeof result === 'string') {
      reply.redirect(302, result);
      return;
    }
  };
}

/**
 * Fastify lifecycle handler - sets up route protection then routes
 * @type {import('@gasket/core').HookHandler<'fastify'>}
 */
function fastifyHandler(gasket, app) {
  // Setup route protection as global preHandler first
  const routePreHandler = setupRouteProtection(gasket);
  if (routePreHandler) {
    app.addHook('preHandler', routePreHandler);
  }

  // Setup validation routes after route middleware
  setupRoutes(gasket, app);
}

export default fastifyHandler;
