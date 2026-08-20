import { describe, it, expect, afterAll } from 'vitest';
import getSSRInstance from '../lib/ssr.js';
import SSR from '@ux/ssr';

afterAll(() => {
  return getSSRInstance().destroy();
});

describe('SSR instance singleton', () => {
  it('Expects the module to expose singleton getter', () => {
    expect(typeof getSSRInstance).toEqual('function');
    expect(getSSRInstance()).toBeInstanceOf(SSR);
  });
});
