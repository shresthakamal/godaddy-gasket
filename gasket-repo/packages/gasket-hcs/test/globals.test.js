import { describe, it, expect } from 'vitest';
import { mergeProps } from '../src/globals.js';

describe('globals', () => {
  describe('mergeProps', () => {
    it('is a function', () => {
      expect(typeof mergeProps).toBe('function');
    });

    it('is exposed as a global', () => {
      expect(window.ux.hcs.mergeProps).toBe(mergeProps);
    });
  });
});
