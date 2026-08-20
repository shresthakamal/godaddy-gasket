import plugin from '../lib/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

describe('@godaddy/gasket-plugin-otel', () => {

  it('should be object', () => {
    expect(plugin).toEqual(expect.any(Object));
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', pkg.name);
    expect(plugin).toHaveProperty('version', pkg.version);
    expect(plugin).toHaveProperty('description', pkg.description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('should have expected hooks', () => {
    expect(Object.keys(plugin.hooks)).toEqual([
      'create',
      'metadata',
      'middleware'
    ]);
  });
});
