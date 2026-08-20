import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import preset from '../lib/index.js';
const { name, version, description, dependencies } = require('../package.json');

describe('gasket-preset-webapp', function () {
  it('has correct metadata from package.json', function () {
    expect(preset.name).toBe(name);
    expect(preset.version).toBe(version);
    expect(preset.description).toBe(description);
  });

  it('has expected hooks that are functions', function () {
    const expected = ['presetPrompt', 'presetConfig', 'create'];

    expect(Object.keys(preset.hooks)).toEqual(expected);
    Object.values(preset.hooks).forEach(function (hook) {
      expect(typeof hook).toBe('function');
    });
  });

  it('has expected dependencies', function () {
    const expected = [
      '@gasket/plugin-analyze',
      '@gasket/plugin-cypress',
      '@gasket/plugin-docs',
      '@gasket/plugin-docusaurus',
      '@gasket/plugin-express',
      '@gasket/plugin-https',
      '@gasket/plugin-jest',
      '@gasket/plugin-lint',
      '@gasket/plugin-mocha',
      '@gasket/plugin-nextjs',
      '@gasket/plugin-typescript',
      '@gasket/plugin-webpack',
      '@gasket/plugin-winston',
      '@godaddy/gasket-plugin-auth',
      '@godaddy/gasket-plugin-security',
      '@godaddy/gasket-plugin-traffic',
      '@godaddy/gasket-plugin-uxp',
      '@godaddy/gasket-plugin-visitor'
    ];

    expect(Object.keys(dependencies)).toEqual(expect.arrayContaining(expected));
  });
});
