# @godaddy/gasket-plugin-jwt Examples

This document provides working examples for all exported methods and functions from the JWT plugin.

## Plugin Installation and Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginJwt from '@godaddy/gasket-plugin-jwt';

export default makeGasket({
  plugins: [
    pluginJwt
  ],
  auth: {
    appName: 'my-app'
  },
  jwt: {
    swp: {
      ssoHost: 'sso.godaddy.com',
      certFile: 'certs/client.crt',
      keyFile: 'certs/client.key',
      ttl: 3600
    },
    devJwt: {
      ssoHost: 'sso.dev-godaddy.com',
      devCert: '*.gasket.dev-godaddy.com',
      ttl: 3600
    },
    iamJwt: {
      ssoHost: 'sso.godaddy.com',
      options: {
        primaryRegion: 'us-west-2',
        secondaryRegion: 'us-east-1'
      },
      ttl: 3600
    }
  }
});
```

## Actions

### getJwt

Get a JWT for a configured key. This is the primary way to obtain JWTs in your application.

```js
// Using in a plugin or middleware
export default {
  name: 'example-plugin',
  hooks: {
    async express(gasket, app) {
      app.get('/api/protected', async (req, res) => {
        try {
          const jwt = await gasket.actions.getJwt('swp');

          // Use the JWT for authenticated requests
          const response = await fetch('https://api.example.com/data', {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });

          const data = await response.json();
          res.json(data);
        } catch (error) {
          res.status(500).json({ error: 'Failed to get JWT' });
        }
      });
    }
  }
};
```

```js
// Using in server-side code
import gasket from '../gasket.js';

async function makeAuthenticatedRequest() {
  const jwt = await gasket.actions.getJwt('iamJwt');

  return fetch('https://internal-api.godaddy.com/data', {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    }
  });
}
```

## Configuration Examples

### Certificate-based JWT Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginJwt],
  auth: { appName: 'my-app' },
  jwt: {
    certJwt: {
      ssoHost: 'sso.godaddy.com',
      certFile: 'certs/client.crt',
      keyFile: 'certs/client.key',
      ttl: 3600,
      options: {
        realm: 'cert',
        subordinateUser: 'user123'
      }
    }
  }
});
```

### Development Certificate Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginDevCerts,
    pluginJwt
  ],
  auth: { appName: 'my-app' },
  environments: {
    local: {
      jwt: {
        devJwt: {
          ssoHost: 'sso.dev-godaddy.com',
          devCert: '*.gasket.dev-godaddy.com',
          ttl: 1800
        }
      }
    }
  }
});
```

### AWS IAM Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginJwt],
  auth: { appName: 'my-app' },
  jwt: {
    awsJwt: {
      ssoHost: 'sso.godaddy.com',
      options: {
        primaryRegion: 'us-west-2',
        secondaryRegion: 'us-east-1'
      },
      ttl: 14400
    }
  }
});
```

### Mixed Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginJwt],
  auth: { appName: 'my-app' },
  jwt: {
    // Production certificate
    prodJwt: {
      ssoHost: 'sso.godaddy.com',
      cert: process.env.PROD_CERT,
      key: process.env.PROD_KEY,
      ttl: 3600
    },
    // Internal service JWT via IAM
    internalJwt: {
      ssoHost: 'sso.godaddy.com',
      options: { primaryRegion: 'us-west-2' },
      ttl: 7200
    },
    // Customer impersonation JWT
    customerJwt: {
      ssoHost: 'sso.godaddy.com',
      certFile: 'certs/customer.crt',
      keyFile: 'certs/customer.key',
      options: {
        realm: 'idp',
        subordinateUser: '67890'
      },
      ttl: 1800
    }
  }
});
```
