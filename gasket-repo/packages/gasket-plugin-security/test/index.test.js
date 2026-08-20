import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import plugin from '../lib/index.js';
import * as actions from '../lib/actions.js';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

describe('plugin', () => {

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', pkg.name);
  });

  it('has expected actions', () => {
    expect(plugin).toHaveProperty('actions', actions);
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'create',
      'middleware',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('depends on logger plugin', function () {
    // @ts-expect-error - accessing plugin property for testing
    expect(plugin.dependencies).toEqual(['@gasket/plugin-logger']);
  });
});
