/* eslint-disable no-sync */
import fs from 'fs';
import path from 'path';
import { makeGasket } from '@gasket/core';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

import pluginLogger from '@gasket/plugin-logger';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginCommand from '@gasket/plugin-command';

// necessary dependencies for some plugins
import pluginMiddleware from '@gasket/plugin-middleware';

import pluginConfig from './plugins/config-plugin.js';
import pluginSiteDocs from './plugins/site-docs-plugin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const projectRoot = path.resolve(__dirname, '..', '..');
const packagesDir = path.join(projectRoot, 'packages');
const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true });

const pluginDirs = await Promise.all(packageDirs
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket-plugin-'))
  .map(async dirent => {
    const { name } = require(path.join(packagesDir, dirent.name, 'package.json'));
    const mod = await import(name);
    return mod.default || mod;
  }));

const presetDirs = await Promise.all(packageDirs
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket-preset-'))
  .map(async dirent => {
    const { name } = require(path.join(packagesDir, dirent.name, 'package.json'));
    const mod = await import(name);
    return mod.default || mod;
  }));

const plugins = presetDirs.concat([
  pluginLogger,
  pluginDocs,
  pluginDocusaurus,
  pluginMetadata,
  pluginCommand,
  pluginMiddleware,
  pluginConfig,
  pluginSiteDocs
], pluginDirs).filter(Boolean);

export default makeGasket({
  appRoot: projectRoot,
  plugins,
  securityLogger: {
    disabled: true
  },
  contentful: {
    spaces: {
      primary: {
        space: '1234567890',
        mainEnvironment: 'master',
        deliveryToken: '1234567890',
        previewToken: '1234567890'
      }
    }
  }
});

