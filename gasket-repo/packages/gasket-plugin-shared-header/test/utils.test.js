import { describe, it, expect } from 'vitest';
import { getEnvFromRuntime } from '../lib/utils.js';

describe('Utils', function () {

  describe('getEnvFromRuntime', function () {

    function testEnv(env, expectedEnv) {
      it(`returns ${expectedEnv} for ${env}`, function () {
        // @ts-expect-error - minimal config for testing
        expect(getEnvFromRuntime({ env })).toBe(expectedEnv);
      });
    }

    testEnv('dev', 'development');
    testEnv('development', 'development');
    testEnv('development.p3', 'development');
    testEnv('local', 'local');
    testEnv('localhost', 'local');

    testEnv('test', 'test');
    testEnv('testing', 'test');
    testEnv('testing.p3', 'test');

    testEnv('ote', 'ote');
    testEnv('ote.p3', 'ote');

    testEnv('prod', 'production');
    testEnv('production', 'production');
    testEnv('production.p3', 'production');
  });

});
