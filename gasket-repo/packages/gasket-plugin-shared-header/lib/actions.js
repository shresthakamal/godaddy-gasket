import { getHeaders } from './shared-header.js';

const reqMap = new WeakMap();

/** @type {import('@gasket/core').ActionHandler<'getSharedHeader'>} */
export async function getSharedHeader(gasket, req) {
  if (!reqMap.has(req)) {
    const headers = await getHeaders(gasket, req);
    reqMap.set(req, headers);
  }

  return reqMap.get(req);
}
