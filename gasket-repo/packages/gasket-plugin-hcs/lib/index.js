import create from './create.js';
import express from './express.js';
import build from './build.js';
import { getAppsClient } from './actions.js';
import intlLocale from './intl-locale.js';
import commands from './commands.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
export default {
  name,
  version,
  description,
  actions: {
    getAppsClient
  },
  hooks: {
    create: {
      timing: {
        before: ['@gasket/plugin-intl']
      },
      handler: create
    },
    build,
    intlLocale,
    express,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'wrhsPackageRequests',
            method: 'exec',
            description: 'Specify assets that needs to be fetched from warehouse',
            link: 'README.md#wrhsPackageRequests',
            parent: 'express'
          },
          {
            name: 'hcsHints',
            method: 'exec',
            description: 'Add hint tags to manifest',
            link: 'README.md#hcsHints',
            parent: 'express'
          },
          {
            name: 'hcsScripts',
            method: 'exec',
            description: 'Add script tags to manifest',
            link: 'README.md#hcsScripts',
            parent: 'express'
          },
          {
            name: 'hcsCss',
            method: 'exec',
            description: 'Add style tags to manifest',
            link: 'README.md#hcsCss',
            parent: 'express'
          },
          {
            name: 'hcsProps',
            method: 'exec',
            description: 'Adjust the props derived from the Platform Content Service (PCS)',
            link: 'README.md#hcsProps',
            parent: 'express'
          },
          {
            name: 'hcsParams',
            method: 'execWaterfall',
            description: 'Mutate request parameters before calling Platform Content Service (PCS)',
            link: 'README.md#hcsParams',
            parent: 'express'
          }
        ],
        modules: [
          {
            name: '@godaddy/gasket-hcs',
            link: 'README.md'
          }
        ],
        configurations: [{
          name: 'hcs',
          link: 'README.md#gasket.js',
          description: 'Configure the hcs plugin',
          type: 'object'
        }, {
          name: 'hcs.pcsUrl',
          link: 'README.md#gasket.js',
          description: 'Base url for server side data',
          type: 'string'
        }, {
          name: 'hcs.pcsOverrideQuery',
          link: 'README.md#gasket.js',
          description: 'Override query for server side data',
          type: 'object'
        }, {
          name: 'hcs.cachingModule',
          link: 'README.md#gasket.js',
          description: 'Default to memory caching module',
          type: 'object'
        }, {
          name: 'hcs.defaultCacheMaxAge',
          link: 'README.md#gasket.js',
          description: 'Default cache max age for server side data',
          type: 'number'
        }, {
          name: 'hcs.devMode',
          link: 'README.md#gasket.js',
          description: 'Enable webpack dev server',
          type: 'boolean'
        }, {
          name: 'hcs.enableBundleAnalyzer',
          link: 'README.md#gasket.js',
          description: 'Enable webpack bundle analyzer',
          type: 'boolean'
        }, {
          name: 'hcs.webpackDevServer',
          link: 'README.md#gasket.js',
          description: 'Config options for webpack dev server',
          type: 'object'
        }, {
          name: 'hcs.removeManifest',
          link: 'README.md#gasket.js',
          description: 'Deletes the manifest file',
          type: 'boolean',
          default: true
        }]
      };
    },
    commands
  }
};
