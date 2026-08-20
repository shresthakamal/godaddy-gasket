# @godaddy/gasket-plugin-security Examples

This document provides practical examples for all exported interfaces from the Gasket Security Plugin.

## Basic Plugin Configuration

### Helmet Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginSecurity from '@godaddy/gasket-plugin-security';

export default makeGasket({
  plugins: [
    pluginSecurity
  ],
  helmet: {
    frameguard: { action: 'deny' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true
  }
});
```

### Enable Default CSP Directives

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginSecurity
  ],
  helmet: {
    contentSecurityPolicy: {
      enabled: true
    }
  }
});
```

## Lifecycle Hooks

### helmet Lifecycle

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginSecurity,
    {
      name: 'custom-helmet',
      hooks: {
        helmet(gasket, helmetConfig, { req, res }) {
          // Modify helmet config based on request
          if (req.path.startsWith('/api/')) {
            // Disable frame options for API routes
            helmetConfig.frameguard = false;
          }

          // Add environment-specific settings
          if (gasket.config.env === 'local') {
            helmetConfig.hsts = false;
          }

          return helmetConfig;
        }
      }
    }
  ]
});
```
