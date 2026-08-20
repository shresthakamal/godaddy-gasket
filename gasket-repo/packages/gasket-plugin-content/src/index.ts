import type { Gasket, Plugin } from '@gasket/core';
import { PluginData } from '@gasket/plugin-metadata';
import { getTransformedContent } from './actions.js';
import pkg from '../package.json' with { type: 'json' };
const { name, description } = pkg;

const plugin: Plugin = {
  name,
  description,
  dependencies: ['@gasket/plugin-logger'],
  hooks: {
    metadata(gasket: Gasket, data: PluginData) {
      return {
        ...data,
        guides: [
          {
            name: 'Content Sources Guide',
            description: 'Authoring plugins to fetch CMS content',
            link: 'docs/content-sources.md'
          },
          {
            name: 'Content Services Guide',
            description: 'Authoring plugins to resolve auxiliary service content',
            link: 'docs/content-services.md'
          },
          {
            name: 'Component Modeling Guide',
            description: 'Defining CMS Models and designing React Components',
            link: 'docs/component-modeling.md'
          },
          {
            name: 'Content Transforms Guide',
            description: 'When and how to transform CMS content before renders',
            link: 'docs/content-transforms.md'
          }
        ]
      };
    }
  },
  actions: {
    getTransformedContent
  }
};

export * from './types.js';

export default plugin;
