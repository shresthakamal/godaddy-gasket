import checkAuthLogging from './check-auth-logging.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  dependencies: [
    '@gasket/plugin-logger',
    '@godaddy/gasket-plugin-auth',
    '@godaddy/gasket-plugin-security-logger'
  ],
  hooks: {
    authChecked: checkAuthLogging
  }
};

export default plugin;
