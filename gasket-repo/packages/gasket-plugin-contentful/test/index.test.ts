import { describe, it, expect } from 'vitest';
import plugin from '../src/index.js';

describe('Plugin', function () {

  it('is an object', function () {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', function () {
    expect(plugin.name).toEqual(plugin.name);
  });

  it('has expected hooks', function () {
    const expected = [
      'configure'
    ];

    expect(plugin.hooks).toBeDefined();
    const lifecycles = Object.keys(plugin.hooks);
    expect(lifecycles).toEqual(expected);
    expect(lifecycles.length).toEqual(expected.length);
  });

  it('has expected actions', () => {
    const expected = ['getContentfulEntries', 'getContentfulCacheStats'];
    expect(plugin.actions).toBeDefined();
    const actions = Object.keys(plugin.actions!);
    expect(actions).toEqual(expected);
    expect(actions.length).toEqual(expected.length);
  });
});
