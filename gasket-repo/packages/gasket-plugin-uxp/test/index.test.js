import { describe, it, expect } from 'vitest';
import plugin from '../lib/index.js';

describe('plugin', () => {

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'prompt',
      'configure',
      'create',
      'webpackConfig',
      'nextConfig',
      'workbox',
      'serviceWorkerCacheKey',
      'manifest',
      'metadata',
      'switchboardPerRequestParams'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});
