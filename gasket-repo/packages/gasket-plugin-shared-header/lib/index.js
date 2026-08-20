import * as actions from './actions.js';
import create from './create.js';
import configure from './configure.js';
import headerContent from './header-content.js';
import metadata from './metadata.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    create,
    configure,
    headerContent,
    metadata
  }
};

export default plugin;
