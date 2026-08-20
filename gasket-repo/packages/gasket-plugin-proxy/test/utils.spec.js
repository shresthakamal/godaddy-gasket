import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as utils from '../lib/utils.js';

describe('Utils', () => {
  let result;

  describe('assignConfigs', () => {

    it('returns same config object', () => {
      const config = { bogus: 'BOGUS' };
      result = utils.assignConfigs(null, config);
      expect(result).toEqual(config);
    });

    it('returns object from config as function', () => {
      const config = () => ({ bogus: 'BOGUS' });
      result = utils.assignConfigs(null, config);
      expect(result).toEqual({ bogus: 'BOGUS' });
    });

    it('passes context to config as function', () => {
      const config = ({ value }) => ({ bogus: value });
      // @ts-expect-error - minimal mock context
      result = utils.assignConfigs({ value: 'BOGUS' }, config);
      expect(result).toEqual({ bogus: 'BOGUS' });
    });

    it('merges multiple config objects', () => {
      const configA = { bogus: 'BOGUS' };
      const configB = { foo: 'BAR' };
      result = utils.assignConfigs(null, configA, configB);
      expect(result).toEqual({
        bogus: 'BOGUS',
        foo: 'BAR'
      });
    });

    it('merges config objects and functions', () => {
      const configA = { a: 'B' };
      const configB = ({ value }) => ({ bogus: value });
      // @ts-expect-error - minimal mock context
      result = utils.assignConfigs({ value: 'BOGUS' }, configA, configB);
      expect(result).toEqual({
        a: 'B',
        bogus: 'BOGUS'
      });
    });

    it('last config takes priority in merges', () => {
      const configA = { a: 'B' };
      const configB = ({ value }) => ({ bogus: value });
      const configC = { a: '1' };
      // @ts-expect-error - minimal mock context
      result = utils.assignConfigs({ value: 'BOGUS' }, configA, configB, configC);
      expect(result).toEqual({
        a: '1',
        bogus: 'BOGUS'
      });
    });
  });

  describe('fixTargetUrl', () => {
    let gasket, req, mockContext;

    beforeEach(() => {
      gasket = {};
      req = {
        host: 'test-secureserver.net'
      };
      mockContext = {
        gasket,
        req
      };
    });

    it('returns same string url', () => {
      const config = 'http://some.api.com';
      result = utils.fixTargetUrl(mockContext, config);
      expect(result).toEqual('http://some.api.com');
    });

    it('returns string from url as function', () => {
      const config = () => ('http://some.api.com');
      result = utils.fixTargetUrl(mockContext, config);
      expect(result).toEqual('http://some.api.com');
    });

    it('passes context to url as function', () => {
      const config = ({ req: inReq }) => (`https://${inReq.host}/some/api`);
      result = utils.fixTargetUrl(mockContext, config);
      expect(result).toEqual('https://test-secureserver.net/some/api');
    });

    it('transforms url with path params', () => {
      req.params = { itemId: '1234' };
      const config = 'http://some.api.com/item/:itemId';
      result = utils.fixTargetUrl(mockContext, config);
      expect(result).toEqual('http://some.api.com/item/1234');
    });

    it('transforms url with query params', () => {
      req.query = { itemName: 'really-great-thing' };
      const config = 'http://some.api.com/item';
      result = utils.fixTargetUrl(mockContext, config);
      expect(result).toEqual('http://some.api.com/item?itemName=really-great-thing');
    });
  });

  describe('normalizeHeaders', () => {

    it('returns empty object if no headers', () => {
      result = utils.normalizeHeaders(null);
      expect(result).toEqual({});
    });

    it('returns normalized headers from plain object', () => {
      const headers = {
        'content-type': 'application/json',
        'x-fake': 'some value'
      };
      result = utils.normalizeHeaders(headers);
      expect(result).toEqual({
        'content-type': 'application/json',
        'x-fake': 'some value'
      });
    });

    it('returns normalized headers from Headers', () => {
      const headers = new Headers({
        'content-type': 'application/json',
        'x-fake': 'some value'
      });
      result = utils.normalizeHeaders(headers);
      expect(result).toEqual({
        'content-type': 'application/json',
        'x-fake': 'some value'
      });
    });

    it('returns normalized headers from HeadersInit', () => {
      // @ts-expect-error - testing with array values
      const headers = new Map([
        ['content-type', ['application/json', 'text/plain']],
        ['x-fake', 'some value']
      ]);
      // @ts-expect-error - testing Map input
      result = utils.normalizeHeaders(headers);
      expect(result).toEqual({
        'content-type': 'application/json, text/plain',
        'x-fake': 'some value'
      });
    });

    it('returns filtered headers', () => {
      const headers = {
        'content-type': 'application/json',
        'x-fake': 'some value'
      };
      const filter = ([key]) => key !== 'content-type';
      result = utils.normalizeHeaders(headers, filter);
      expect(result).toEqual({
        'x-fake': 'some value'
      });
    });
  });

  describe('sanitizeOptions', () => {

    it('returns unmodified options', () => {
      const options = { bogus: 'BOGUS' };
      result = utils.sanitizeOptions(options);
      expect(options).toEqual({
        bogus: 'BOGUS'
      });
    });

    it('removes host header', () => {
      const options = { bogus: 'BOGUS', headers: { 'host': 'some-host.com', 'x-fake': 'some value' } };
      result = utils.sanitizeOptions(options);
      expect(result).toEqual({
        bogus: 'BOGUS',
        headers: {
          'x-fake': 'some value'
        }
      });
    });

    it('removes HTTP2 pseudo headers', () => {
      const options = {
        headers: {
          [':method']: 'GET',
          [':authority']: 'hostname.com',
          [':path']: '/',
          [':scheme']: 'https',
          'x-fake': 'some value'
        }
      };

      result = utils.sanitizeOptions(options);
      expect(result).toEqual({ headers: { 'x-fake': 'some value' } });
    });

    ['GET', 'HEAD'].forEach(method => {
      it(`removes bodies from ${method} requests`, () => {
        result = utils.sanitizeOptions({ method, body: {} });
        expect(result).not.toHaveProperty('body');
      });
    });
  });

  describe('exec', () => {

    it('returns original object', () => {
      // @ts-expect-error - minimal mock context
      result = utils.exec({}, { bogus: 'BOGUS' });
      expect(result).toEqual({ bogus: 'BOGUS' });
    });

    it('returns object if a function', () => {
      // @ts-expect-error - minimal mock context
      result = utils.exec({}, () => ({ bogus: 'BOGUS' }));
      expect(result).toEqual({ bogus: 'BOGUS' });
    });
  });

  describe('prepThunk', () => {

    it('returns original function if not a thunk', () => {
      const fn = vi.fn();
      // @ts-expect-error - minimal mock context
      result = utils.prepThunk({}, fn);
      expect(result).toBe(fn);
    });

    it('returns configured function', () => {
      const fn = vi.fn();
      // @ts-expect-error - minimal mock context
      result = utils.prepThunk({}, () => fn);
      expect(result).toBe(fn);
    });

    it('returns original function if failure to prep', () => {
      const fn = vi.fn(() => { throw new Error(); });
      // @ts-expect-error - minimal mock context
      result = utils.prepThunk({}, fn);
      expect(result).toBe(fn);
    });
  });
});
