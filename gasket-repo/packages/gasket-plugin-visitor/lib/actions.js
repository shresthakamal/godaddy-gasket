import { withGasketRequestCache } from '@gasket/request';
import { getAtlas } from './utils/atlas.js';
import { assembleVisitor } from './utils/visitor.js';

/** @type {import('@gasket/core').ActionHandler<'getVisitor'>} */
export const getVisitor = withGasketRequestCache(
  async function getVisitor(gasket, req) {
    const env = gasket.config.env;
    // TODO: Use gasket.actions.getAtlas directly in next major version
    //  with @godaddy/gasket-plugin-atlas as a plugin dependency
    const atlas = await getAtlas(gasket);

    const visitorConfig = gasket.config.visitor ?? {};
    const debug = visitorConfig.debug ?? env.includes('local');

    const visitor = assembleVisitor(req, atlas, debug, visitorConfig.priority);
    return gasket.execWaterfall('visitor', visitor, { req });
  }
);
