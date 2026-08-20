import { describe, it, expect } from 'vitest';
import plugin from '../lib/index.js';

describe('plugin', () => {

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has an expected properties', () => {
    const expected = [
      'name',
      'version',
      'description',
      'actions',
      'hooks'
    ];
    const props = Object.keys(plugin);
    expect(props).toEqual(expected);
    expect(props).toHaveLength(expected.length);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'configure',
      'headerContent',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');
    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});
