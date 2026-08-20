/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

import init from './init.js';
import packageJson from '../package.json' with { type: 'json' };
const { dependencies, name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  dependencies: ['@gasket/plugin-logger'],
  hooks: {
    async create(_, { pkg }) {
      pkg.add('dependencies', {
        '@godaddy/security-logger': dependencies['@godaddy/security-logger'],
        '@gasket/plugin-winston': dependencies['@gasket/plugin-winston']
      });
    },
    init,
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [
          {
            name: 'securityLogger',
            link: 'README.md#configuration',
            description: 'Configure the security logger plugin',
            type: 'object'
          },
          {
            name: 'securityLogger.aws',
            link: 'README.md#configuration',
            description: 'AWS account information',
            type: 'object'
          },
          {
            name: 'securityLogger.serviceFullName',
            link: 'README.md#configuration',
            description: 'Name of the service',
            type: 'string'
          },
          {
            name: 'securityLogger.disabled',
            link: 'README.md#configuration',
            description: 'Disable the security log',
            type: 'boolean'
          }
        ]
      };
    }
  }
};

export default plugin;
