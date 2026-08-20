/// <reference types="@gasket/plugin-metadata" />

import * as actions from './actions.js';
import express from './express.js';
import { defaultRequestAdapter } from './request-adapter.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').ExtendedPlugin} */
const plugin = {
  name,
  version,
  description,
  dependencies: [
    '@gasket/plugin-logger'
  ],
  actions,
  hooks: {
    express,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'proxy',
            link: 'README.md#configuration',
            description: 'Configure the proxy plugin',
            type: 'object'
          },
          {
            name: 'proxy.proxies',
            link: 'README.md#configuration',
            description: 'Configure desired proxies',
            type: 'object'
          }
        ]
      };
    }
  },
  defaultRequestAdapter
};

export default plugin;
