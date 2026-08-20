# @godaddy/gasket-plugin-dev-certs Examples

This document provides working examples for the `@godaddy/gasket-plugin-dev-certs` package.

## Plugin Configuration

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';

export default makeGasket({
  plugins: [
    pluginDevCerts
  ],
  environments: {
    local: {
      devCerts: {
        path: '.certs',
        commonNames: [
          '*.freemium.api.dev-godaddy.com',
          'example.client.gdcorp.tools'
        ]
      }
    }
  }
});
```

### Using Pre-packaged Certificates

```js
// Configuration using pre-packaged certificates for common Gasket domains
export default makeGasket({
  plugins: [
    pluginDevCerts
  ],
  environments: {
    local: {
      devCerts: {
        path: '.certs',
        commonNames: [
          // Pre-packaged certificates (no download required)
          '*.gasket.dev-godaddy.com',
          '*.gasket.int.dev-godaddy.com',
          '*.gasket.dev-secureserver.net',
          '*.gasket.dev-gdcorp.tools',
          '*.gasket.int.dev-gdcorp.tools',
          // Custom certificates (will be downloaded)
          '*.api.dev-godaddy.com',
          'my-service.client.gdcorp.tools'
        ]
      }
    }
  }
});
```

### Custom SNI Configuration

```js
// Configuration with custom SNI names using pre-packaged certificates
export default makeGasket({
  plugins: [
    pluginDevCerts
  ],
  environments: {
    local: {
      devCerts: {
        sniNames: [
          '*.gasket.dev-godaddy.com',
          '*.gasket.dev-afternic.com',
          '*.gasket.dev-123-reg.co.uk'
        ]
      }
    }
  }
});
```

## Plugin Actions

### getDevCert

Retrieve certificate and key for a given common name.

```js
// Basic usage
const { cert, key } = await gasket.actions.getDevCert('example.client.gdcorp.tools');

// Use in server configuration
async function setupServer(gasket) {
  const { cert, key } = await gasket.actions.getDevCert('*.gasket.dev-godaddy.com');

  const httpsOptions = {
    cert,
    key
  };

  return httpsOptions;
}
```

### Multiple Certificate Usage

```js
// Setting up SNI (Server Name Indication) with multiple certificates
async function setupSNIServer(gasket) {
  const certificates = {};

  const domains = [
    '*.gasket.dev-godaddy.com',
    '*.api.dev-godaddy.com',
    'service.client.gdcorp.tools'
  ];

  for (const domain of domains) {
    try {
      const { cert, key } = await gasket.actions.getDevCert(domain);
      certificates[domain] = { cert, key };
    } catch (error) {
      console.warn(`Failed to load certificate for ${domain}:`, error.message);
    }
  }

  return certificates;
}
```

### installDevCerts

Download all certificates configured in the devCerts configuration.

```js
// Install all configured certificates
await gasket.actions.installDevCerts();

// Use in a custom command
export default {
  name: 'cert-installer',
  hooks: {
    build: async (gasket) => {
      if (gasket.config.env === 'local') {
        console.log('Installing development certificates...');
        await gasket.actions.installDevCerts();
        console.log('Certificates installed successfully');
      }
    }
  }
};
```
