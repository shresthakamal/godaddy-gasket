import { getEnvPlids, prodPlids, devPlids, testPlids, otePlids } from '../lib/env-plid.js';

describe('getEnvPlids', function () {

  /** IDE visual test only */
  describe('deprecated', function () {
    // eslint-disable-next-line jest/expect-expect, vitest/expect-expect
    it('IDE should strike keys as deprecated', function () {
      const plids = getEnvPlids('prod');
      plids.bluerazor;
    });
  });

  describe('prod', function () {
    it('returns prod plids', function () {
      const plids = getEnvPlids('prod');
      expect(plids).toBe(prodPlids);
    });

    it('has expected ids', function () {
      const plids = getEnvPlids('prod');
      expect(plids.godaddy).toBe(1);
      expect(plids.oneTwoThreeReg).toBe(587240);
      expect(plids).toHaveProperty('123reg', 587240);
      expect(plids.afternic).toBe(497036);
      expect(plids.reamaze).toBe(579333);
    });
  });

  describe('stg', function () {
    it('matches prod plids', function () {
      const plids = getEnvPlids('stg');
      expect(plids).toBe(prodPlids);
    });
  });

  describe('dev', function () {
    it('returns dev plids', function () {
      const plids = getEnvPlids('dev');
      expect(plids).toBe(devPlids);
    });

    it('has expected ids', function () {
      const plids = getEnvPlids('dev');
      expect(plids).toHaveProperty('godaddy', 1);
      expect(plids.oneTwoThreeReg).toBe(587240);
      expect(plids).toHaveProperty('123reg', 587240);
      expect(plids.afternic).toBe(497036);
      // different from prod
      expect(plids.reamaze).toBe(443755);
    });
  });

  describe('test', function () {
    it('returns test plids', function () {
      const plids = getEnvPlids('test');
      expect(plids).toBe(testPlids);
    });

    it('has expected ids', function () {
      const plids = getEnvPlids('test');
      expect(plids).toHaveProperty('godaddy', 1);
      expect(plids.oneTwoThreeReg).toBe(587240);
      expect(plids).toHaveProperty('123reg', 587240);
      expect(plids.afternic).toBe(497036);
      // different from prod
      expect(plids.reamaze).toBe(276950);
    });
  });

  describe('ote', function () {
    it('returns ote plids', function () {
      const plids = getEnvPlids('ote');
      expect(plids).toBe(otePlids);
    });

    it('has expected ids', function () {
      const plids = getEnvPlids('ote');
      expect(plids).toHaveProperty('godaddy', 1);
      // different from prod
      expect(plids.oneTwoThreeReg).toBe(1002762);
      expect(plids).toHaveProperty('123reg', 1002762);
      expect(plids.afternic).toBe(1001836);
      // same as prod
      expect(plids.reamaze).toBe(579333);
    });
  });
});
