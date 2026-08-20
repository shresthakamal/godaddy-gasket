import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import plugin from '../src/index.js';

const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version, description } = pkg;

describe('@godaddy/gasket-plugin-goat', () => {
  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = ['configure', 'metadata'];
    expect(plugin.hooks).toBeDefined();
    expect(Object.keys(plugin.hooks ?? {})).toEqual(expect.arrayContaining(expected));
  });

  it('does not have ready hook', () => {
    expect(plugin.hooks).not.toHaveProperty('ready');
  });
});
