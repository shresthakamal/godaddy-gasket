/**
 * Migrate a single service config from riskLevel to securityLevel
 * @param {string} serviceName - Service name
 * @param {object} serviceConfig - Service configuration
 * @param {object} logger - Logger instance
 * @returns {{config: object, migrated: boolean}} Updated config and migration flag
 */
function migrateServiceConfig(serviceName, serviceConfig, logger) {
  if ('riskLevel' in serviceConfig && !('securityLevel' in serviceConfig)) {
    const updated = { ...serviceConfig };
    updated.securityLevel = serviceConfig.riskLevel;
    delete updated.riskLevel;

    logger?.warn(
      `[gasket-plugin-jwt] JWT service "${serviceName}": ` +
      `The "riskLevel" configuration key is deprecated. ` +
      `Please use "securityLevel" instead. ` +
      `(Automatically migrated for this session)`
    );

    return { config: updated, migrated: true };
  }

  return { config: serviceConfig, migrated: false };
}

/**
 * Configure lifecycle hook to migrate deprecated riskLevel to securityLevel
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
export default function configure(gasket, baseConfig) {
  const { jwt } = baseConfig;

  if (!jwt) {
    return baseConfig;
  }

  /** @type {Record<string, any>} */
  const updatedJwt = {};
  let hasDeprecation = false;

  for (const [serviceName, serviceConfig] of Object.entries(jwt)) {
    const { config, migrated } = migrateServiceConfig(serviceName, serviceConfig, gasket.logger);
    updatedJwt[serviceName] = config;
    hasDeprecation = hasDeprecation || migrated;
  }

  return hasDeprecation ? { ...baseConfig, jwt: updatedJwt } : baseConfig;
}
