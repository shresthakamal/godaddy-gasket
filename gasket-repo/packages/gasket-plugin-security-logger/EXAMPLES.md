# Security Logger Plugin Examples

## Plugin Configuration

### Basic Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginSecurityLogger from '@godaddy/gasket-plugin-security-logger';

export default makeGasket({
  plugins: [
    pluginSecurityLogger
  ],
  securityLogger: {
    aws: {
      accountId: '123456789',
      accountName: 'gd-aws-usa-gpd-myteam-prod'
    },
    serviceFullName: 'my-application-service'
  }
});
```

### Configuration with Optional Parameters

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginSecurityLogger
  ],
  securityLogger: {
    aws: {
      accountId: '123456789',
      accountName: 'gd-aws-usa-gpd-myteam-prod'
    },
    serviceFullName: 'my-application-service',
    disabled: false // Optional: disable security logging
  },
  winston: {
    // Optional: additional winston configuration
    level: 'info',
    prefix: 'MyApp'
  }
});
```

## Using the Security Logger

### Basic Security Logging

```js
// middleware/security-audit.js
export default function securityAuditMiddleware(gasket) {
  return (req, res, next) => {
    // Log successful authentication
    gasket.logger.security('User authentication', {
      transaction: { id: req.id },
      user: { id: req.user?.id },
      event: {
        kind: 'event',
        category: 'authentication',
        type: ['start'],
        outcome: 'success',
        action: 'user_login'
      }
    });

    next();
  };
}
```
