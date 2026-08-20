/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-elastic-apm" />

/** @type {import('@gasket/core').HookHandler<'configure'>} */
export default function configure(gasket, baseConfig) {
  const { elasticAPM = {} } = baseConfig;

  return {
    ...baseConfig,
    elasticAPM: {
      ...elasticAPM,
      sensitiveCookies: [...new Set([
        ...(elasticAPM.sensitiveCookies || []),
        'XSRF-TOKEN'
      ])]
    }
  };
}
