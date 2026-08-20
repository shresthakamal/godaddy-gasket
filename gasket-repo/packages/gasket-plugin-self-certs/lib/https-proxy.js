/// <reference types="@gasket/plugin-https-proxy" />

export default {
  timing: {
    after: ['@godaddy/gasket-plugin-dev-certs']
  },
  /** @type {import('@gasket/core').HookHandler<'httpsProxy'>} */
  handler: async function httpsProxyHook(gasket, httpsProxyConfig) {
    const { logger, actions } = gasket;
    const { hostname = 'localhost' } = httpsProxyConfig;

    const commonName = gasket.config.selfCerts?.https;

    if (commonName && hostname === commonName && !httpsProxyConfig.ssl) {
      try {
        const certKeys = await actions.getSelfCert(commonName);

        return {
          ...httpsProxyConfig,
          hostname,
          ssl: {
            ...certKeys,
            port: httpsProxyConfig.port
          }
        };
      } catch (err) {
        logger.error(
          `Failed to load override certs (${err}), using default gasket behavior`
        );
      }
    }

    return httpsProxyConfig;
  }
};
