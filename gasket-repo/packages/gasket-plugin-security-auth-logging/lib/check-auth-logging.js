/// <reference types="@godaddy/gasket-plugin-auth" />
/// <reference types="@godaddy/gasket-plugin-security-logger" />
/// <reference types="@gasket/plugin-logger" />

import { enums } from '@godaddy/security-logger';

const { kind, category, outcome } = enums;

/** @type {import('@gasket/core').HookHandler<'authChecked'>} */
async function authLoggingSetup({ config, logger }, authData) {
  const { securityLogger: { disabled } } = config;

  if (!logger.security) {
    throw new Error('@godaddy/gasket-plugin-security-logger was not configured');
  }

  if (disabled) {
    // We're disabled, no reason to do anything
    return;
  }

  const {
    success,
    req = {},
    message,
    ...rest
  } = authData;

  // @ts-ignore - not found in GasketRequest which is typically passed in
  const { headers, ip, method, url = req.path } = req;

  // Make it conform to security logging standards
  const logData = {
    gasketAuth: rest,
    client: {
      ip
    },
    event: {
      kind: kind.event,
      category: category.authentication,
      outcome: success ? outcome.success : outcome.failure
    },
    host: {
      hostname: headers?.host
    },
    http: {
      request: {
        method
      }
    },
    url: {
      path: url
    }
  };

  // @ts-ignore - Add in request id if it exists
  const id = req?.id || (req?.headers && req?.headers['x-request-id']);
  if (id) {
    logData.transaction = { id };
  }
  logger.security(`Authentication: ${message}`, logData);
}

export default authLoggingSetup;
