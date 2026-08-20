import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setCookie, getBaseDomain, parseString, stringify } from '../lib/utils.js';

describe('traffic utils', () => {
  describe('utils.setCookie', () => {
    let req, res, cookiesSet;

    beforeEach(() => {
      cookiesSet = {};
      res = {
        cookie: (name, value, options) => {
          cookiesSet[name] = { value, options };
        }
      };
      req = { cookies: {} };
    });

    it('should set cookie on response', () => {
      Date.now = vi.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf());

      setCookie(req, res, 'fake_cookie', 'fake_value', { minutes: 60, baseDomain: 'dev-godaddy.com' });

      expect(cookiesSet).toEqual({
        fake_cookie: {
          options: {
            domain: 'dev-godaddy.com',
            expires: new Date('2017-02-14T01:00:00.000Z'),
            encode: expect.any(Function)
          },
          value: 'fake_value'
        }
      });

      expect(req.cookies).toEqual({
        fake_cookie: 'fake_value'
      });
    });

    it('should not encode cookie value', () => {
      Date.now = vi.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf());

      setCookie(req, res, 'fake_cookie', 'vid=1234567', { minutes: 60, baseDomain: 'dev-godaddy.com' });

      const encodeResults = cookiesSet.fake_cookie.options.encode('vid=1234567');
      expect(encodeResults).toEqual('vid=1234567');
    });
  });

  describe('utils.getBaseDomain', () => {
    it('should return base domain', () => {
      // @ts-expect-error - minimal mock for testing
      expect(getBaseDomain({ headers: { host: 'sso.dev-godaddy.com' } })).toEqual('dev-godaddy.com');
      // @ts-expect-error - minimal mock for testing
      expect(getBaseDomain({ headers: { host: 'many.of.sub.domains.dev-godaddy.com' } })).toEqual('dev-godaddy.com');
    });

    it('should have x-dsa-host override host header', () => {
      // @ts-expect-error - minimal mock for testing
      expect(getBaseDomain({ headers: { 'x-dsa-host': 'www.godaddy.com', 'host': 'whatever.com' } })).toEqual('godaddy.com');
    });

    it('should strip port from host', () => {
      // @ts-expect-error - minimal mock for testing
      expect(getBaseDomain({ headers: { host: 'sso.dev-godaddy.com:1234' } })).toEqual('dev-godaddy.com');
    });
  });

  describe('utils.stringify', () => {
    const testObject = {
      testObjKey1: 'testObjValue1',
      testObjKey2: null,
      testObjKey3: {
        foo: 'bar'
      }
    };

    it('param style output', () => {
      const output = stringify(testObject, '&', '=');
      expect(output).toEqual('testObjKey1=testObjValue1&testObjKey2=null&testObjKey3=[object Object]');
    });
    it('tdata style output', () => {
      const output = stringify(testObject, '^', ',');
      expect(output).toEqual('testObjKey1,testObjValue1^testObjKey2,null^testObjKey3,[object Object]');
    });
    it('returns empty string for empty object', () => {
      const output = stringify({}, '^', ',');
      expect(output).toEqual('');
    });
  });

  describe('utils.parseString', () => {
    it('should return a key/pair representation of the string', () => {
      const string = 'key1,value1^key2,value2';
      const obj = parseString(string, '^', ',');

      expect(obj).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });

    it('should return keys that do not have values', () => {
      const string = 'key1,^key2,value2';
      const obj = parseString(string, '^', ',');

      expect(obj).toEqual({
        key1: '',
        key2: 'value2'
      });
    });

    it('should return an empty object', () => {
      // @ts-expect-error - testing with no arguments
      const obj = parseString();

      expect(obj).toEqual({});
    });
  });
});
