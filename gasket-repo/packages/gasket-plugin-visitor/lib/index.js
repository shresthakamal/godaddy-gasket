/// <reference types="@gasket/plugin-metadata" />

import * as actions from './actions.js';
import configure from './configure.js';
import create from './create.js';
import intlLocale from './intl-locale.js';
import metadata from './metadata.js';
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
    intlLocale,
    metadata
  }
};

export default plugin;
