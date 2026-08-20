import type { Plugin } from '@gasket/core';

import metadata from './metadata.js';
import onSignal from './on-signal.js';
import publicGasketData from './public-gasket-data.js';
import initReduxState from './init-redux-state.js';
import webpackConfig from './webpack-config.js';
import actions from './actions.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/**
 * Gasket AppConfig Plugin
 *
 * Establishes the app config client singleton instance on the server
 * @type {Plugin}
 */
const plugin: Plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    initReduxState,
    metadata,
    onSignal,
    publicGasketData,
    webpackConfig
  }
};

export default plugin;

// Re-export the plugin's public types. This also ensures the `@gasket/core`
// module augmentation declared in `./types.js` (GasketConfig.switchboard,
// GasketActions, lifecycle hooks) is merged wherever the plugin is imported.
export * from './types.js';
