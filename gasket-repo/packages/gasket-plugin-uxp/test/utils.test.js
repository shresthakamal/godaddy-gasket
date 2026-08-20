/* eslint-disable max-statements, max-len */
import { describe, it, expect } from 'vitest';
import {
  getEnvFromRuntime,
  fixupPrivateLabelId,
  getShopperInfoFromCookie,
  parseBitSegment,
  modifyPcParamsPerSegOpts,
  normalizeEnv
} from '../lib/utils.js';

describe('utils', function () {

  describe('getEnvFromRuntime', function () {

    function testEnv(env, expectedEnv) {
      it(`returns ${expectedEnv} for ${env}`, function () {
        expect(getEnvFromRuntime({ env })).toEqual(expectedEnv);
      });
    }

    testEnv('dev', 'dev');
    testEnv('development', 'dev');
    testEnv('development.p3', 'dev');
    testEnv('local', 'dev');
    testEnv('localhost', 'dev');

    testEnv('test', 'test');
    testEnv('testing', 'test');
    testEnv('testing.p3', 'test');

    testEnv('prod', 'prod');
    testEnv('production', 'prod');
    testEnv('production.p3', 'prod');

    testEnv('stg', 'prod');
    testEnv('stage', 'prod');
    testEnv('staging', 'prod');
    testEnv('stage.p3', 'prod');

    testEnv('ote', 'prod');
    testEnv('ote.p3', 'prod');

    testEnv('bogus', 'prod');
    testEnv('*', 'prod');
  });

  describe('fixupPrivateLabelId', () => {
    it('returns OTE internal reseller plid', async () => {
      expect(fixupPrivateLabelId('ote-secureserver.net', 1001776)).toEqual(495469);
    });

    it('returns OTE non-internal reseller plid', async () => {
      expect(fixupPrivateLabelId('ote-secureserver.net', 123)).toEqual(123);
    });

    it('returns OTE internal reseller plid for 123Reg', async () => {
      expect(fixupPrivateLabelId('ote-123-reg.co.uk', 1002762)).toEqual(587240);
    });

    it('returns reseller plid for non OTE env', async () => {
      expect(fixupPrivateLabelId('123-reg.co.uk', 1002762)).toEqual(1002762);
    });

    it('returns unbranded plid when missing for secureserver.net', async () => {
      expect(fixupPrivateLabelId('secureserver.net')).toEqual(3153);
    });

    it('returns godaddy plid when missing for non secureserver.net', async () => {
      expect(fixupPrivateLabelId('gdcorp.tools')).toEqual(1);
      expect(fixupPrivateLabelId('godaddy.com')).toEqual(1);
    });
  });

  describe('getShopperInfoFromCookie', function () {

    const bakeCookie = (auth, idpInfo = {}) => {
      let token;
      if (auth !== 'basic') {
        token = { auth, [auth]: idpInfo };
      } else {
        token = { auth, ...idpInfo };
      }
      return {
        cookies: {
          info_idp: JSON.stringify(token)
        }
      };
    };

    it('returns empty object if no cookie', () => {
      expect(getShopperInfoFromCookie({ })).toEqual({});
    });

    it('returns shopper info for basic auth', () => {
      expect(getShopperInfoFromCookie(bakeCookie('basic', { pcx: true, segopts: 1234 }))).toEqual({ auth: 'basic', pcx: true, segopts: 1234 });
    });

    it('returns shopper info for e2s auth', () => {
      expect(getShopperInfoFromCookie(bakeCookie('e2s', { pcx: true, segopts: 1234 }))).toEqual({ pcx: true, segopts: 1234 });
    });

    it('returns shopper info for s2s auth', () => {
      expect(getShopperInfoFromCookie(bakeCookie('s2s', { pcx: true, segopts: 1234 }))).toEqual({ pcx: true, segopts: 1234 });
    });

    it('returns shopper info for e2s2s auth', () => {
      expect(getShopperInfoFromCookie(bakeCookie('e2s2s', { pcx: true, segopts: 1234 }))).toEqual({ pcx: true, segopts: 1234 });
    });

    it('malformed cookie just returns empty object', async () => {
      const req = {
        cookies: {
          info_idp: 'malformed JSON'
        }
      };

      expect(getShopperInfoFromCookie(req)).toEqual({ });
    });
  });

  describe('parseBitSegment', () => {

    const testParseBitSegment = (valueBinary, offset, bitWidth, expectedValueBinary) =>
      it(`parseBitSegment(${valueBinary}b, ${offset}, ${bitWidth}) should equal ${expectedValueBinary}b`, () => {
        const value = Number.parseInt(valueBinary, 2);
        const expectedValue = Number.parseInt(expectedValueBinary, 2);
        expect(parseBitSegment(value, offset, bitWidth)).toEqual(expectedValue);
      });

    testParseBitSegment('000000001', 0, 3, '01');
    testParseBitSegment('000100011', 0, 3, '011');
    testParseBitSegment('000110011', 3, 5, '00110');
    testParseBitSegment('110011111', 5, 2, '0');

  });

  describe('modifyPcParamsPerSegOpts', () => {

    it('modifies godaddy-pxpro theme to godaddy-pxpro-dark if lowest 3 bits of segopts equals 1', () => {
      const data = { theme: 'godaddy-pxpro' };
      modifyPcParamsPerSegOpts(data, 17);
      expect(data).toEqual({ theme: 'godaddy-pxpro-dark' });
    });

    it('does not modify godaddy-pxpro theme if lowest 3 bits is not equal 1', () => {
      const data = { theme: 'godaddy-pxpro' };
      modifyPcParamsPerSegOpts(data, 19);
      expect(data).toEqual({ theme: 'godaddy-pxpro' });
    });

    it('does not modify unsupported theme', () => {
      const data = { theme: 'some-other-theme' };
      modifyPcParamsPerSegOpts(data, 1);
      expect(data).toEqual({ theme: 'some-other-theme' });
    });

    it('does not modify godaddy-pxpro theme if aegopts is not a number', () => {
      const data = { theme: 'godaddy-pxpro' };
      modifyPcParamsPerSegOpts(data, void 0);
      expect(data).toEqual({ theme: 'godaddy-pxpro' });
    });

  });

  describe('normalizeEnv', () => {
    it('normalizes all environment strings', () => {
      expect(normalizeEnv('dev')).toEqual('dev');
      expect(normalizeEnv('test')).toEqual('test');
      expect(normalizeEnv('prod')).toEqual('prod');
      expect(normalizeEnv('asdf')).toEqual('prod'); // default
      expect(normalizeEnv('development')).toEqual('dev');
      expect(normalizeEnv('testeroo')).toEqual('test');
      expect(normalizeEnv('production')).toEqual('prod');
    });
  });

});
