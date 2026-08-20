import type { Gasket } from '@gasket/core';
import type { PluginData } from '@gasket/plugin-metadata';

/**
 * Metadata for the switchboard plugin.
 */
export default function metadata(gasket: Gasket, data: PluginData) {
  return {
    ...data,
    lifecycles: [
      {
        name: 'switchboardPerRequestParams',
        method: 'execWaterfall',
        description: 'Add additional params for the switchboard config rules',
        link: 'README.md#switchboardPerRequestParams',
        parent: 'appRequestConfig'
      },
      {
        name: 'switchboardBrowserState',
        method: 'execWaterfall',
        description: 'Modify the switchboard config exposed publicly',
        link: 'README.md#switchboardBrowserState',
        parent: 'appRequestConfig'
      }
    ],
    configurations: [{
      name: 'switchboard',
      link: 'README.md#configuration',
      description: 'Configure the switchboard plugin',
      type: 'object'
    }]
  };
}
