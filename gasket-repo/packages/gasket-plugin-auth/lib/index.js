/// <reference types="@gasket/plugin-express" />

import actions from './actions.js';
import create from './create.js';
import configure from './configure.js';
import metadata from './metadata.js';
import { webpackConfig } from './webpack-config.js';
import gasketData from './gasket-data.js';
import express from './express.js';
import fastify from './fastify.js';
import { AuthRealm, AuthRisk, AuthIdp } from './utils.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').ExtendedPlugin} */
const plugin = {
  name,
  dependencies: ['@godaddy/gasket-plugin-visitor'],
  version,
  description,
  actions,
  hooks: {
    create,
    webpackConfig,
    configure,
    gasketData,
    express,
    fastify,
    metadata
  },
  AuthRealm,
  AuthRisk,
  AuthIdp
};

export { AuthRealm, AuthRisk, AuthIdp };
export default plugin;
