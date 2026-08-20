import { makeGasketRequest } from '@gasket/request';

/**
 * Configure endpoint
 * @type {import('./internal').configureEndpoint}
 */
export default function configureEndpoint(gasket) {
  /**
   * Endpoint by which to check auth against criteria provided as query params
   * @type {import('./internal').endpoint}
   */
  async function endpoint(req, res) {
    try {
      const gasketReq = await makeGasketRequest(req);
      const checkAuth = await gasket.actions.getCheckAuth(gasketReq);
      const result = await checkAuth(gasketReq.query);
      if (!result.valid) {
        res.status(401);
      }
      return res.send(result);
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  return endpoint;
}
