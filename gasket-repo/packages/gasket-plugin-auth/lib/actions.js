import { makeCheckAuth } from './check-auth.js';
import { getToken } from './check-auth-helpers.js';
import { withGasketRequestCache } from '@gasket/request';

export default {
  /** @type {import('@gasket/core').ActionHandler<'getCheckAuth'>} */
  getCheckAuth(gasket, req) {
    return makeCheckAuth(gasket, req);
  },
  /** @type {import('@gasket/core').ActionHandler<'checkAuth'>} */
  async checkAuth(gasket, req, params) {
    const checkAuth = await makeCheckAuth(gasket, req);
    return await checkAuth(params);
  },
  /** @type {import('@gasket/core').ActionHandler<'checkShopperAuth'>} */
  async checkShopperAuth(gasket, req) {
    const checkAuth = await makeCheckAuth(gasket, req);
    return await checkAuth({
      realm: 'idp',
      risk: 'low',
      type: ['basic', 'e2s', 's2s', 'e2s2s', 's2snpr', 'e2s2snpr']
    });
  },
  /** @type {import('@gasket/core').ActionHandler<'getAuthToken'>} */
  getAuthToken: withGasketRequestCache(async (gasket, req, realm) => {
    try {
      return getToken(realm, req);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      gasket.logger.debug(`Error getting auth token for realm ${realm}: ${message}`);
      return null;
    }
  })
};
