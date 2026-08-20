import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import plugin from '../lib/index.js';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version, description } = pkg;

describe('Gasket JWT Plugin', () => {
  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = ['metadata'];
    expect(Object.keys(plugin.hooks)).toEqual(expect.arrayContaining(expected));
  });
});
