import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import plugin from '../lib/index.js';
const { name, version, description } = require('../package.json');

describe('@godaddy/gasket-plugin-self-certs', function () {
  it('has correct metadata from package.json', function () {
    expect(plugin.name).toBe(name);
    expect(plugin.version).toBe(version);
    expect(plugin.description).toBe(description);
  });

  it('has expected structure', function () {
    expect(plugin).toHaveProperty('actions');
    expect(plugin.actions).toHaveProperty('getSelfCert');
    expect(plugin).toHaveProperty('hooks');
    expect(Object.keys(plugin.hooks)).toEqual([
      'create',
      'configure',
      'httpsProxy',
      'serverConfig'
    ]);
  });
});
