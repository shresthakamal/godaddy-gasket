import { getAtlas } from './actions.js';
import create from './create.js';
import preboot from './preboot.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions: {
    getAtlas
  },
  hooks: {
    create,
    preboot
  }
};

export default plugin;
