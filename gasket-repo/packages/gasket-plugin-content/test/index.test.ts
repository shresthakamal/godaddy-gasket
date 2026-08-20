import { describe, it, expect } from 'vitest';
import plugin from '../src/index.js';
import pkg from '../package.json' with { type: 'json' };
const { name } = pkg;

describe('Plugin', function () {
  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', name);
  });

  it('has expected hooks', () => {
    const expected = [
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('has expected actions', () => {
    const expected = ['getTransformedContent'];
    expect(plugin.actions).toBeDefined();
    const actions = Object.keys(plugin.actions!);
    expect(actions).toEqual(expected);
    expect(actions).toHaveLength(expected.length);
  });
});
