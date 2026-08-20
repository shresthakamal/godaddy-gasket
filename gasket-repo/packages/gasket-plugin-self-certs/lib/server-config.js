/// <reference types="@gasket/plugin-https" />

const { isArray } = Array;

export default {
  timing: {
    after: ['@godaddy/gasket-plugin-dev-certs']
  },
  /** @type {import('@gasket/core').HookHandler<'serverConfig'>} */
  handler: async function serverConfig(gasket, config) {
    const { logger, actions } = gasket;

    const { https } = gasket.config.selfCerts ?? {};

    if (!https || isArray(config.https)) {
      return config;
    }

    const commonName = typeof https === 'string' ? https : 'localhost';

    try {
      const certKeys = await actions.getSelfCert(commonName);

      if (config.https?.sni) {
        const hostname = commonName === 'localhost' ? '*' : commonName;

        config.https.sni = {
          ...config.https.sni,
          [hostname]: certKeys
        };
      } else {
        config.https = {
          ...config.https,
          ...certKeys
        };
      }
    } catch (err) {
      logger.error(
        `Failed to load override certs (${err}), using default gasket behavior`
      );
    }

    return config;
  }
};
