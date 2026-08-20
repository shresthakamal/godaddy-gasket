import { getLoggerOptions } from '@godaddy/security-logger';

/** @type {import('@gasket/core').HookHandler<'init'>} */
function loggingSetup({ config }) {
  const { securityLogger, winston = {} } = config;
  if (!securityLogger) {
    throw new Error('No `securityLogger` configuration provided in gasket.js');
  }

  config.winston = getLoggerOptions(securityLogger, winston);
}

export default {
  timing: {
    before: ['@gasket/plugin-logger']
  },
  handler: loggingSetup
};
