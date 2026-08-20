import type { Plugin } from '@gasket/core';
import * as actions from './actions.js';
import { configure } from './configure.js';
import { metadata } from './metadata.js';
import packageJson from '../package.json' with { type: 'json' };

const { name, version, description } = packageJson;

const plugin: Plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    configure,
    metadata
  }
};

export default plugin;
export type * from './types.js';
