/** @type {import('@gasket/core').HookHandler<'configure'>} */
export default function configure(gasket, config) {
  const isLocal = gasket.config.env.startsWith('local');
  const { https = isLocal ? false : 'localhost' } = config.selfCerts ?? {};

  return {
    ...config,
    selfCerts: {
      ...config.selfCerts,
      https
    }
  };
}
