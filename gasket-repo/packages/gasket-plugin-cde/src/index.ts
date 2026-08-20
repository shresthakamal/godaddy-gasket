/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-fastify" />
/// <reference types="@godaddy/gasket-plugin-auth" />
/// <reference types="@godaddy/gasket-plugin-visitor" />
/// <reference types="@godaddy/gasket-plugin-otel" />

import configure from './configure.js';
import metadata from './metadata.js';
import express from './express.js';
import fastify from './fastify.js';
import { sendAppEvaluationEvent } from './actions.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/**
 * Gasket CDE Plugin
 *
 * Plugin to parse customerId, visitorId, and sessionId before calling CDE API
 */

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions: {
    sendAppEvaluationEvent
  },
  hooks: {
    configure,
    express,
    fastify,
    metadata
  }
};

export default plugin;
