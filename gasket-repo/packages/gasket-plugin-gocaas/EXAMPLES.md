# @godaddy/gasket-plugin-gocaas Examples

## getGoCaasClient Action

### Basic Usage with JWT Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginGoCaas from '@godaddy/gasket-plugin-gocaas';
import pluginJwt from '@godaddy/gasket-plugin-jwt';

export default makeGasket({
  plugins: [
    pluginJwt,
    pluginGoCaas
  ],
  jwt: {
    goCaas: {
      ssoHost: 'sso.dev-godaddy.com',
      cert: '/path/to/cert.crt',
      key: '/path/to/key.key',
      ttl: 10000
    }
  }
});
```

```js
// Using the client in middleware
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.get('/api/content', async (req, res) => {
        try {
          const client = await gasket.actions.getGoCaasClient();
          const config = await client.config.getConfig();
          res.json(config);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    }
  }
};
```

### Usage with JOMAX JWT (Non-Production)

```js
// gasket.js - No JWT configuration needed for this approach
import { makeGasket } from '@gasket/core';
import pluginGoCaas from '@godaddy/gasket-plugin-gocaas';

export default makeGasket({
  plugins: [
    pluginGoCaas
  ]
});
```

```js
// Using with JOMAX JWT from cookies
export default {
  name: 'example-plugin',
  hooks: {
    express(gasket, app) {
      app.get('/api/content', async (req, res) => {
        try {
          const jomaxJwt = await gasket.actions.getJwt('jomax');
          const client = await gasket.actions.getGoCaasClient(jomaxJwt);
          const config = await client.config.getConfig();
          res.json(config);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    }
  }
};
```

### Usage with Custom Headers

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginGoCaas from '@godaddy/gasket-plugin-gocaas';

export default makeGasket({
  plugins: [
    pluginGoCaas
  ],
  goCaas: {
    headers: {
      'X-Custom-Header': 'custom-value',
      'X-App-Version': '1.0.0'
    }
  },
  jwt: {
    goCaas: {
      ssoHost: 'sso.dev-godaddy.com',
      cert: '/path/to/cert.crt',
      key: '/path/to/key.key'
    }
  }
});
```

```js
// Client will automatically include custom headers
const client = await gasket.actions.getGoCaasClient();
const config = await client.config.getConfig();
```
