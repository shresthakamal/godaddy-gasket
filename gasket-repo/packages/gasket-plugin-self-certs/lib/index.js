import * as actions from './actions.js';
import create from './create.js';
import configure from './configure.js';
import httpsProxy from './https-proxy.js';
import serverConfig from './server-config.js';
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
    httpsProxy,
    serverConfig
  }
};

export default plugin;
