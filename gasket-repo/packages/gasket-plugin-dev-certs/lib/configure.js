const defaultHostname = 'local.gasket.dev-godaddy.com';
const serverTypes = ['http', 'https', 'http2'];
const defaultPort = 8443;

/** @type {import('@gasket/core').HookHandler<'configure'>} */
export default function configure(gasket, config) {
  // this fixup only pertains to local development
  if (!gasket.config.env.startsWith('local')) {
    return config;
  }

  const { hostname = defaultHostname } = config || {};
  const hasListenerConfigured = serverTypes.some(o => o in config);

  // @ts-ignore - https certs will be set in serverConfig hook
  return {
    ...config,
    hostname,
    // If no protocol has been configured, default to https
    ...(!hasListenerConfigured && { https: { port: defaultPort } })
  };
}
