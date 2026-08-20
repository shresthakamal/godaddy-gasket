/// <reference types="@gasket/plugin-service-worker" />

/**
 * Register a cache key function to get the market id from req
 * @type {import('@gasket/core').HookHandler<'serviceWorkerCacheKey'>}
 */
export default async function serviceWorkerCacheKey(gasket) {
  const { disabled } = gasket.config.presentationCentral || {};
  if (!disabled) {
    return async (req) => {
      const pc = await gasket.actions.getPresentationCentral(req);
      return `_uxp=${pc.meta.headers.etag}`;
    };
  }
}
