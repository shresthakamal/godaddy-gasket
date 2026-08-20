import { describe, it, expect } from 'vitest';
import index from '../lib/index.js';

describe('Plugin', () => {

  it('has a name', () => {
    expect(index).toHaveProperty('name', '@godaddy/gasket-plugin-proxy');
  });

  it('has expected dependencies', () => {
    const expected = [
      '@gasket/plugin-logger'
    ];

    expect(index).toHaveProperty('dependencies', expected);
  });

  it('exposes actions', () => {
    expect(index).toHaveProperty('actions');
  });

  it('exposes express hook', () => {
    expect(index.hooks).toHaveProperty('express');
  });

  it('exposes express hook timing', () => {
    // @ts-expect-error - hook property access
    expect(index.hooks.express).toHaveProperty('timing');
    // @ts-expect-error - hook property access
    expect(index.hooks.express.timing).toHaveProperty('after');
    // @ts-expect-error - hook property access
    expect(index.hooks.express.timing.after).toEqual(['@gasket/plugin-middleware']);
  });

  it('exposes defaultRequestAdapter', () => {
    expect(index).toHaveProperty('defaultRequestAdapter');
  });
});
