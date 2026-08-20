import { describe, it, expect } from 'vitest';
import { pickDefined } from '../src/utils.js';

describe('Utils', function () {
  describe('pickDefined', function () {
    it('removes keys with undefined values', function () {
      let six;
      const results = pickDefined({
        one: '1',
        two: 0,
        three: '',
        four: null,
        // eslint-disable-next-line no-undefined
        five: undefined,
        six
      });

      expect(results).toEqual({
        one: '1',
        two: 0,
        three: '',
        four: null
      });
    });
  });
});
