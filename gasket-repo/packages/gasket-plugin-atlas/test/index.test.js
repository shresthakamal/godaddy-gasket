import { createRequire } from 'module';
import plugin from '../lib/index.js';
import { getAtlas } from '../lib/actions.js';
import create from '../lib/create.js';
import preboot from '../lib/preboot.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

describe('@godaddy/gasket-plugin-atlas', () => {

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

  it('should have expected actions', () => {
    expect(plugin.actions).toEqual({ getAtlas });
    expect(Object.keys(plugin.actions)).toEqual(['getAtlas']);
  });

  it('should have expected hooks', () => {
    expect(plugin.hooks).toEqual({ create, preboot });
    expect(Object.keys(plugin.hooks)).toEqual(['create', 'preboot']);
  });

  it('should have correct name', () => {
    expect(plugin.name).toBe(pkg.name);
  });

  it('should have version', () => {
    expect(plugin.version).toBe(pkg.version);
  });

  it('should have description', () => {
    expect(plugin.description).toBe(pkg.description);
  });
});
