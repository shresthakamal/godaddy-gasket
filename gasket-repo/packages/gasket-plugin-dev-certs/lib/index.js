import * as actions from './actions.js';
import create from './create.js';
import httpsProxy from './https-proxy.js';
import configure from './configure.js';
import metadata from './metadata.js';
import serverConfig from './server-config.js';
import { webpackConfig } from './webpack-config.js';
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
    create,
    configure,
    // @ts-expect-error - httpsProxy and devProxy are custom hooks provided by @gasket/plugin-https
    httpsProxy,
    /** @deprecated - aliased to new hook */
    devProxy: httpsProxy,
    serverConfig,
    metadata,
    webpackConfig,
    prepare
  }
};

export default plugin;
