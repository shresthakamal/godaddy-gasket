const isProd = /prod/i;
const isDev = /dev/i;
const isTest = /test/i;
const isOte = /ote/i;

/**
 * Derives an acceptable PC env from the gasket runtime env.
 * Valid Shared Header Client env values are `dev`, `test`, or `prod`.
 * Unless otherwise overridden by `gasket.config.pcSharedHeader.env`
 * @type {import('.').getEnvFromRuntime}
 */
export function getEnvFromRuntime(gasketConfig) {
  const { env } = gasketConfig;

  //
  // prod, production, stage, stg, staging, ote, *
  //
  if (isProd.test(env)) return 'production';

  //
  // dev, development
  //
  if (isDev.test(env)) return 'development';

  //
  // test, testing
  //
  if (isTest.test(env)) return 'test';

  //
  // ote, external testing environment
  //
  if (isOte.test(env)) return 'ote';

  //
  // prod, production, stage, stg, staging, ote, *
  // local, localhost
  return 'local';
}
