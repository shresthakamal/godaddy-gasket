# @godaddy/gasket-plugin-self-certs Examples

This document provides working examples for using the gasket-plugin-self-certs package.

## Configuration

### Basic Configuration

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // include '@godaddy/gasket-plugin-self-certs' plugin
    // other plugins
  ],
  selfCerts: {
    https: 'localhost' // Generate cert for localhost
  }
});
```

### Custom Hostname Configuration

```javascript
// gasket.js
export default makeGasket({
  plugins: [
    // other plugins
  ],
  selfCerts: {
    https: 'custom.hostname.com'
  }
});
```

### Disable Self-Certs

```javascript
// gasket.js
export default makeGasket({
  plugins: [
    // other plugins
  ],
  selfCerts: {
    https: false // Disable self-signed certificates
  }
});
```

### Environment-Specific Configuration

```javascript
// gasket.js
export default makeGasket({
  plugins: [
    // other plugins
  ],
  selfCerts: {
    https: 'custom.hostname.com'
  },
  environments: {
    local: {
      selfCerts: {
        https: false // Disable in local development
      }
    }
  }
});
```

## Actions

### getSelfCert

Get self-signed certificate and key for a specific common name.

```javascript
// In a middleware or plugin
export default {
  name: 'custom-plugin',
  hooks: {
    async middleware(gasket) {
      return async function customMiddleware(req, res, next) {
        try {
          const { cert, key } = await gasket.actions.getSelfCert(
            'custom.hostname.com'
          );

          // Use the certificate and key for custom HTTPS configuration
          console.log('Certificate generated:', cert.substring(0, 50) + '...');
          console.log('Private key generated:', key.substring(0, 50) + '...');

          next();
        } catch (error) {
          console.error('Failed to generate certificate:', error);
          next(error);
        }
      };
    }
  }
};
```

### Multiple Certificates

```javascript
// Generate certificates for multiple hostnames
export default {
  name: 'multi-cert-plugin',
  hooks: {
    async prepare(gasket, config) {
      const hostnames = ['api.local.dev', 'admin.local.dev', 'app.local.dev'];

      // Pre-generate certificates for all hostnames
      const certificates = await Promise.all(
        hostnames.map(async (hostname) => {
          const certData = await gasket.actions.getSelfCert(hostname);
          return { hostname, ...certData };
        })
      );

      // Store certificates in config for later use
      config.generatedCerts = certificates;

      return config;
    }
  }
};
```
