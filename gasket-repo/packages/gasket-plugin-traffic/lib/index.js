/// <reference types="@gasket/plugin-metadata" />

import * as actions from './actions.js';
import configure from './configure.js';
import create from './create.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    create,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            method: 'exec',
            name: 'trafficDataLayer',
            description: 'Customize the data layer for Traffic',
            link: 'README.md#trafficDataLayer',
            parent: 'middleware',
            deprecated: true
          },
          {
            method: 'execWaterfall',
            name: 'tccData',
            description: 'Customize the data layer for Traffic',
            link: 'README.md#tccData',
            parent: 'middleware'
          },
          {
            method: 'exec',
            name: 'signalsConfig',
            description: 'Customize the Signals configuration',
            link: 'README.md#signalsConfig',
            parent: 'middleware'
          }
        ],
        actions: [
          {
            name: 'getTrafficData',
            description: 'Get the traffic data for the request',
            link: 'README.md'
          },
          {
            name: 'getSignalsConfig',
            description: 'Get the config for the signals client',
            link: 'README.md'
          }
        ]
      };
    }
  }
};

export default plugin;
