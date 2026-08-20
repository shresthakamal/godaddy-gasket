import type { Plugin } from '@gasket/core';
import configure from './configure.js';
import { getContentfulEntries } from './actions/get-contentful-entries.js';
import { getContentfulCacheStats } from './actions/get-contentful-cache-stats.js';
import pkg from '../package.json' with { type: 'json' };
const { name, description } = pkg;

const plugin: Plugin = {
  name,
  description,
  hooks: {
    configure
  },
  actions: {
    getContentfulEntries,
    getContentfulCacheStats
  }
};

export * from './types.js';

export default plugin;
