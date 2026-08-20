/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-webpack" />
/// <reference types="@godaddy/gasket-plugin-switchboard" />

import * as actions from './actions.js';
import prompt from './prompt.js';
import create from './create.js';
import { webpackConfig } from './webpack-config.js';
import { nextConfig } from './next-config.js';
import { workbox } from './workbox.js';
import serviceWorkerCacheKey from './sw-cache-key.js';
import manifest from './manifest.js';
import configure from './configure.js';
import metadata from './metadata.js';
import switchboardPerRequestParams from './switchboard-params.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  dependencies: ['@gasket/plugin-logger', '@godaddy/gasket-plugin-visitor'],
  actions,
  hooks: {
    prompt,
    configure,
    create,
    webpackConfig,
    nextConfig,
    workbox,
    serviceWorkerCacheKey,
    manifest,
    metadata,
    switchboardPerRequestParams
  }
};

export default plugin;
