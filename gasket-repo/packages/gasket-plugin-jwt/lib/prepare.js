/// <reference types="@gasket/plugin-logger" />

const isLoadedCert = (maybeCert) => {
  return maybeCert.startsWith('-----BEGIN');
};

const hasBothOrNone = (config, keyName, certName) => {
  if (config[keyName] || config[certName]) {
    return config[keyName] && config[certName];
  }
  return true;
};

// eslint-disable-next-line max-statements
const validateCertConfig = (name, config, logger) => {
  if (!hasBothOrNone(config, 'keyFile', 'certFile')) {
    logger.error(`Missing keyFile or certFile for jwt.${name}`);
    return;
  }

  if (!hasBothOrNone(config, 'key', 'cert')) {
    logger.error(`Missing key or cert for jwt.${name}`);
    return;
  }

  if (!config.ssoHost) {
    logger.error(`Missing ssoHost for jwt.${name}`);
    return;
  }

  if (config.key) {
    if (!isLoadedCert(config.key)) {
      logger.warn(`jwt.${name}.key is a path. Configure jwt.${name}.keyFile instead.`);
      config.keyFile = config.key;
      delete config.key;
    }
    if (!isLoadedCert(config.cert)) {
      logger.warn(`jwt.${name}.cert is a path. Configure jwt.${name}.certFile instead.`);
      config.certFile = config.cert;
      delete config.cert;
    }
  }
};

/**
 * Validate jwt config in the prepare lifecycle to allow for async fetching of certs
 * @type {import('@gasket/core').HookHandler<'prepare'>}
 */
export default function prepare(gasket, config) {
  const jwtConfig = config.jwt || {};
  Object.entries(jwtConfig).forEach(([key, value]) => {
    validateCertConfig(key, value, gasket.logger);
  });

  return {
    ...config,
    jwt: jwtConfig
  };
}
