import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

import * as actions from './actions.js';
import create from './create.js';
import metadata from './metadata.js';
import middleware from './middleware.js';

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    create,
    metadata,
    middleware
  }
};

export default plugin;
