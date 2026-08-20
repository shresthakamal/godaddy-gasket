import { describe, it, expect } from 'vitest';
import { isArray, isObject, isString, isBrowser } from '../src/type-utils';

describe('type-utils', function () {
  describe('isArray', function () {
    it('validates arrays correctly', function () {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe('isObject', function () {
    it('validates objects correctly', function () {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(void 0)).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });
  });

  describe('isString', function () {
    it('validates strings correctly', function () {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  it('isBrowser returns true in jsdom', function () {
    expect(isBrowser()).toBe(true);
  });
});
