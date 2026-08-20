import * as actions from './actions.js';
import configure from './configure.js';
import metadata from './metadata.js';
import prepare from './prepare.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    prepare,
    metadata
  }
};

export default plugin;
