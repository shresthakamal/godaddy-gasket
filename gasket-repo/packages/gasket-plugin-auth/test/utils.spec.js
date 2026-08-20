import * as utils from '../lib/utils.js';
import { AuthRealm, typeDefaults } from '../lib/utils.js';

describe('Utils', () => {
  let result;

  describe('ensureArray', () => {

    it('returns null or undefined if passed', () => {
      result = utils.ensureArray(null);
      expect(result).toBeNull();
      result = utils.ensureArray();
      expect(result).toBeUndefined();
    });

    it('returns array if array passed', () => {
      const val = ['hello'];
      result = utils.ensureArray(val);
      expect(result).toBe(val);
    });

    it('returns array if string passed', () => {
      const val = 'hello';
      result = utils.ensureArray(val);
      expect(result).toBeInstanceOf(Array);
    });

    it('passed string is in returned array', () => {
      const val = 'hello';
      result = utils.ensureArray(val);
      expect(result).toContain(val);
    });
  });

  describe('objToKey', () => {

    it('returns a string representing the object', () => {
      const obj = { val: 'hello' };
      result = utils.objToKey(obj);
      expect(result).toEqual(expect.stringContaining('hello'));
    });
  });

  describe('oauth realm', () => {
    it('exposes an oauth realm', () => {
      expect(AuthRealm.oauth).toBe('oauth');
    });
    it('has a typeDefaults entry for oauth', () => {
      expect(typeDefaults.oauth).toEqual(['basic']);
    });
  });
});
