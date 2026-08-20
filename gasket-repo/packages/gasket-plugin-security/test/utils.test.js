import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as utils from '../lib/utils.js';
import LRUCache from 'lru-cache';

const getSpy = vi.spyOn(LRUCache.prototype, 'get');
const setSpy = vi.spyOn(LRUCache.prototype, 'set');

describe('utils', function () {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEnvUrls', function () {

    it('returns expected env urls for dev', function () {
      const results = utils.getEnvUrls('www.dev-godaddy.com');
      expect(results).toContain('*.dev-godaddy.com');
      expect(results).toContain('*.test-godaddy.com');
      expect(results).not.toContain('*.stg-godaddy.com');
      expect(results).not.toContain('*.ote-godaddy.com');
      expect(results).toContain('*.godaddy.com');
    });

    it('returns expected env urls for test', function () {
      const results = utils.getEnvUrls('www.test-godaddy.com');
      expect(results).not.toContain('*.dev-godaddy.com');
      expect(results).toContain('*.test-godaddy.com');
      expect(results).not.toContain('*.stg-godaddy.com');
      expect(results).not.toContain('*.ote-godaddy.com');
      expect(results).toContain('*.godaddy.com');
    });

    it('returns expected env urls for stg', function () {
      const results = utils.getEnvUrls('www.stg-godaddy.com');
      expect(results).not.toContain('*.dev-godaddy.com');
      expect(results).not.toContain('*.test-godaddy.com');
      expect(results).toContain('*.stg-godaddy.com');
      expect(results).not.toContain('*.ote-godaddy.com');
      expect(results).toContain('*.godaddy.com');
    });

    it('returns expected env urls for ote', function () {
      const results = utils.getEnvUrls('www.ote-godaddy.com');
      expect(results).not.toContain('*.dev-godaddy.com');
      expect(results).not.toContain('*.test-godaddy.com');
      expect(results).not.toContain('*.stg-godaddy.com');
      expect(results).toContain('*.ote-godaddy.com');
      expect(results).toContain('*.godaddy.com');
    });

    it('returns expected env urls for prod', function () {
      const results = utils.getEnvUrls('www.godaddy.com');
      expect(results).not.toContain('*.dev-godaddy.com');
      expect(results).not.toContain('*.test-godaddy.com');
      expect(results).not.toContain('*.stg-godaddy.com');
      expect(results).not.toContain('*.ote-godaddy.com');
      expect(results).toContain('*.godaddy.com');
    });
  });

  describe('trimDomainSet', function () {
    const envUrls = ['*.godaddy.com', '*.secureserver.net', '*.gdcorp.tools'];

    it('strips expected domains for godaddy.com', function () {
      const results = utils.trimDomainSet('www.godaddy.com', envUrls);
      expect(results).toContain('*.godaddy.com');
      expect(results).toContain('*.secureserver.net');
      expect(results).not.toContain('*.gdcorp.tools');
    });

    it('strips expected domains for gdcorp.tools', function () {
      const results = utils.trimDomainSet('www.gdcorp.tools', envUrls);
      expect(results).toContain('*.godaddy.com');
      expect(results).toContain('*.secureserver.net');
      expect(results).toContain('*.gdcorp.tools');
    });

    it('strips expected domains for secureserver.net', function () {
      const results = utils.trimDomainSet('www.secureserver.net', envUrls);
      expect(results).not.toContain('*.godaddy.com');
      expect(results).toContain('*.secureserver.net');
      expect(results).not.toContain('*.gdcorp.tools');
    });
  });

  describe('getDefaultDirectives', function () {

    it('returns expected directives', function () {
      const results = utils.getDefaultDirectives('www.godaddy.com');
      expect(Object.keys(results)).toEqual([
        'default-src',
        'script-src',
        'img-src',
        'style-src',
        'connect-src',
        'frame-src'
      ]);
    });

    it('returns same directives for hostname', function () {
      const results = utils.getDefaultDirectives('www.afternic.com');
      const results2 = utils.getDefaultDirectives('www.afternic.com');
      const results3 = utils.getDefaultDirectives('www.afternic.com');

      // -- cloned so we must compare equals, not exact
      expect(results).toEqual(results2);
      expect(results).toEqual(results3);

      expect(getSpy).toHaveBeenCalledTimes(3);
      expect(setSpy).toHaveBeenCalledTimes(1);
    });

    it('returns directive values based on env hostname', function () {
      let results = utils.getDefaultDirectives('www.dev-godaddy.com');
      expect(results['script-src']).toContain('*.dev-godaddy.com');
      expect(results['script-src']).toContain('*.godaddy.com');

      results = utils.getDefaultDirectives('www.godaddy.com');
      expect(results['script-src']).not.toContain('*.dev-godaddy.com');
      expect(results['script-src']).toContain('*.godaddy.com');
    });

    it('returns cloned object', function () {
      const first = utils.getDefaultDirectives('www.dev-godaddy.com');
      const second = utils.getDefaultDirectives('www.dev-godaddy.com');

      expect(first).not.toBe(second);
      expect(first).toStrictEqual(second);
    });

    it("directives include 'self'", function () {
      const results = utils.getDefaultDirectives('www.godaddy.com');
      Object.keys(results).forEach(key => {
        expect(results[key]).toContain("'self'");
      });
    });
  });

  describe('createHash', function () {
    it('returns object with value and directive properties', function () {
      const results = utils.createHash('object-check');
      expect(results).toHaveProperty('value');
      expect(results).toHaveProperty('directive');
    });

    it('creates directive formatted base64 encoded sha256 hash', function () {
      const results = utils.createHash('directive-check');
      expect(results.directive).toMatch('\'sha256-');
      expect(results.directive).toMatch('\'');
      expect(results.directive).toMatch('\'');
      expect(results.directive).toContain(results.value);
    });

    it('returns same hash for repeated content', function () {
      const str = 'exact-check';
      const results = utils.createHash(str);
      const results2 = utils.createHash(str);
      const results3 = utils.createHash(str);

      expect(results).toBe(results2);
      expect(results).toBe(results3);

      expect(getSpy).toHaveBeenCalledTimes(3);
      expect(setSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createNonce', function () {
    it('returns object with value and directive properties', function () {
      const results = utils.createNonce();
      expect(results).toHaveProperty('value');
      expect(results).toHaveProperty('directive');
    });

    it('creates directive formatted nonce', function () {
      const results = utils.createNonce();
      expect(results.directive).toMatch('\'nonce-');
      expect(results.directive).toMatch('\'');
      expect(results.directive).toMatch('\'');
    });

    it('returns difference value for repeat runs', function () {
      const results = utils.createNonce();
      const results2 = utils.createNonce();
      expect(results.value).not.toEqual(results2.value);
    });
  });

  describe('parseDirectives', function () {
    const cspStr = "default-src 'self' *.dev-godaddy.com *.dev-secureserver.net; " +
      " script-src 'self' *.dev-godaddy.com *.dev-secureserver.net 'sha256-HASH1234='; ";

    it('parses the content-source-policy header to an object', function () {
      const results = utils.parseDirectives(cspStr);
      expect(typeof results).toBe('object');
    });

    it('has keys for each policy type', function () {
      const results = utils.parseDirectives(cspStr);
      expect(Object.keys(results)).toEqual([
        'default-src',
        'script-src'
      ]);
    });
  });

  describe('stringifyDirectives', function () {
    const cspObj = {
      'default-src': ["'self'", '*.dev-godaddy.com', '*.dev-secureserver.net'],
      'script-src': ["'self'", '*.dev-godaddy.com', '*.dev-secureserver.net', "'sha256-HASH1234='"]
    };

    it('return object as content-source-policy formatted string', function () {
      const results = utils.stringifyDirectives(cspObj);
      expect(typeof results).toBe('string');
    });

    it('string is formated as expected', function () {
      const results = utils.stringifyDirectives(cspObj);
      expect(results).toEqual("default-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
        "script-src 'self' *.dev-godaddy.com *.dev-secureserver.net 'sha256-HASH1234=';");
    });
  });
});
