import { describe, it, expect } from 'vitest';
import { safeRegExpStr, pickDefined, deepLookup } from '../src/utils';

describe('utils', function () {
  describe('safeRegExpStr', function () {
    it('escapes regex metacharacters', function () {
      expect(safeRegExpStr('|\\{}()[]^$+*?.')).toBe(
        '\\|\\\\\\{\\}\\(\\)\\[\\]\\^\\$\\+\\*\\?\\.'
      );
      expect(safeRegExpStr('hello')).toBe('hello');
      expect(safeRegExpStr('')).toBe('');
    });
  });

  describe('pickDefined', function () {
    it('filters out undefined while preserving falsy values', function () {
      expect(pickDefined({ a: 1, b: void 0, c: null, d: false, e: 0 })).toEqual(
        { a: 1, c: null, d: false, e: 0 }
      );
      expect(pickDefined({})).toEqual({});
    });
  });

  describe('deepLookup', function () {
    const testObj = {
      simple: 'value',
      nested: { level2: 'deep', level2obj: { level3: 'deeper' } },
      array: [1, 2, 3]
    };

    it('looks up properties at various depths', function () {
      expect(deepLookup('simple', testObj)).toBe('value');
      expect(deepLookup('nested.level2', testObj)).toBe('deep');
      expect(deepLookup('nested.level2obj.level3', testObj)).toBe('deeper');
      expect(deepLookup('array', testObj)).toEqual([1, 2, 3]);
    });

    it('returns undefined for missing or invalid paths', function () {
      expect(deepLookup('missing', testObj)).toBe(void 0);
      expect(deepLookup('simple.nested', testObj)).toBe(void 0);
    });

    it('returns object itself for empty path', function () {
      expect(deepLookup('', testObj)).toBe(testObj);
    });
  });
});
