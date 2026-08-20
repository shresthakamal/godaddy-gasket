/// <reference types="@gasket/plugin-metadata" />

import configure from './configure.js';
import create from './create.js';
import middleware from './middleware.js';
import * as actions from './actions.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/**
 * Adds helmet configuration to the express server
 * @type {import('@gasket/core').Plugin}
 */
const plugin = {
  name,
  version,
  description,
  dependencies: ['@gasket/plugin-logger'],
  actions,
  hooks: {
    configure,
    create,
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'helmet',
            link: 'README.md#configuration',
            description:
              'Configure the helmet middleware. Can be configured using any options supported by helmet.',
            type: 'object'
          }
        ],
        actions: [
          {
            name: 'insertCspHash',
            description: 'Adds a hash directive to the CSP header.',
            link: 'README.md#insertCspHash',
            deprecated: true
          },
          {
            name: 'addCspNonce',
            description: 'Adds a nonce directive to the CSP header.',
            link: 'README.md#addCspNonce',
            deprecated: true
          },
          {
            name: 'addCspHash',
            description: 'Adds hash directives for the provided content.',
            link: 'README.md#addCspHash',
            deprecated: true
          }
        ]
      };
    }
  }
};

export default plugin;
