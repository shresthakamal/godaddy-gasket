# @godaddy/gasket-plugin-security-auth-logging Examples

## Plugin Installation and Configuration

### Basic Plugin Setup

```js
// gasket.js
import pluginSecurityAuthLogging from '@godaddy/gasket-plugin-security-auth-logging';

export default makeGasket({
  plugins: [
    pluginSecurityAuthLogging
  ]
});
```

### Complete Setup with Dependencies

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginLogger from '@gasket/plugin-logger';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginSecurityLogger from '@godaddy/gasket-plugin-security-logger';
import pluginSecurityAuthLogging from '@godaddy/gasket-plugin-security-auth-logging';

export default makeGasket({
  plugins: [
    pluginLogger,
    pluginSecurityLogger,
    pluginAuth,
    pluginSecurityAuthLogging
  ],
  securityLogger: {
    aws: {
      accountId: '123456789',
      accountName: 'gd-aws-usa-gpd-myteam-prod'
    },
    serviceFullName: 'my-authentication-service'
  }
});
```

## Automatic Logging Integration

### Authentication Success Logging

When authentication succeeds, the plugin automatically logs:

```js
// This happens automatically when using @godaddy/gasket-plugin-auth
import { withAuthRequired } from '@godaddy/gasket-auth';
import gasket from '../gasket.js';

function SecurePage() {
  return <div>Protected content</div>;
}

// When auth succeeds, security log entry is automatically created:
// {
//   gasketAuth: { /* auth details */ },
//   client: { ip: '192.168.1.1' },
//   event: {
//     kind: 'event',
//     category: 'authentication',
//     outcome: 'success'
//   },
//   host: { hostname: 'myapp.godaddy.com' },
//   http: { request: { method: 'GET' } },
//   url: { path: '/secure-page' },
//   transaction: { id: 'request-123' }
// }

export default withAuthRequired({ realm: 'jomax', gasket })(SecurePage);
```

### Authentication Failure Logging

```js
// Server-side auth check that fails
export async function getServerSideProps({ req }) {
  const authResult = await gasket.actions.checkAuth(req, {
    realm: 'jomax',
    groups: ['admin']
  });

  // If auth fails, security log entry is automatically created:
  // {
  //   gasketAuth: { /* auth failure details */ },
  //   client: { ip: '192.168.1.1' },
  //   event: {
  //     kind: 'event',
  //     category: 'authentication',
  //     outcome: 'failure'
  //   },
  //   host: { hostname: 'myapp.godaddy.com' },
  //   http: { request: { method: 'GET' } },
  //   url: { path: '/admin' },
  //   transaction: { id: 'request-456' }
  // }

  if (!authResult.valid) {
    return { notFound: true };
  }

  return { props: {} };
}
```

### API Route Authentication Logging

```js
// pages/api/secure-endpoint.js
export default async function handler(req, res) {
  const authResult = await gasket.actions.checkAuth(req, {
    realm: 'idp',
    risk: 'high'
  });

  // Authentication attempt is automatically logged with:
  // - Request IP, method, URL path
  // - Host information
  // - Transaction ID (if available)
  // - Success/failure outcome
  // - All auth-specific data

  if (!authResult.valid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({ data: 'secure data' });
}
```

### Custom Middleware with Auth Logging

```js
// Custom middleware that triggers auth logging
export default {
  name: 'custom-auth-middleware',
  hooks: {
    middleware(gasket) {
      return async function authMiddleware(req, res, next) {
        try {
          const authCheck = gasket.actions.getCheckAuth(req);

          const result = await authCheck({
            realm: 'jomax',
            groups: ['employee']
          });

          // Security logging happens automatically via authChecked lifecycle
          // Log entry includes:
          // - All request context (IP, headers, method, URL)
          // - Authentication outcome and details
          // - Structured security logging format

          if (result.valid) {
            // do stuff
            next();
          } else {
            res.status(403).json({ error: 'Access denied' });
          }
        } catch (error) {
          // Auth errors are also automatically logged
          res.status(500).json({ error: 'Authentication error' });
        }
      };
    }
  }
};
```

## Log Output Format

The plugin automatically structures authentication logs in security logging format:

```json
// Example log output for successful authentication
{
  gasketAuth: {
    realm: 'jomax',
    groups: ['admin'],
    accountName: 'john.doe',
    // ... other auth details
  },
  client: {
    ip: '192.168.1.100'
  },
  event: {
    kind: 'event',
    category: 'authentication',
    outcome: 'success'
  },
  host: {
    hostname: 'myapp.godaddy.com'
  },
  http: {
    request: {
      method: 'POST'
    }
  },
  url: {
    path: '/api/admin/users'
  },
  transaction: {
    id: 'req-abc123'
  }
}
```

```js
// Example log output for failed authentication
{
  gasketAuth: {
    realm: 'idp',
    reason: 'Invalid credentials',
    // ... other failure details
  },
  client: {
    ip: '192.168.1.100'
  },
  event: {
    kind: 'event',
    category: 'authentication',
    outcome: 'failure'
  },
  host: {
    hostname: 'myapp.godaddy.com'
  },
  http: {
    request: {
      method: 'POST'
    }
  },
  url: {
    path: '/api/login'
  },
  transaction: {
    id: 'req-def456'
  }
}
```
