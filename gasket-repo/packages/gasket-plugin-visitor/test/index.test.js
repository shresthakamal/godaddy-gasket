import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import plugin from '../lib/index.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

describe('plugin', function () {

  it('is an object', function () {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', function () {
    expect(plugin).toHaveProperty('name', pkg.name);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', function () {
    const expected = [
      'configure',
      'create',
      'intlLocale',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
  });
});
