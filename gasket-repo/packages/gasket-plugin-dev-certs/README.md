# @godaddy/gasket-plugin-dev-certs

Download and load certs for your local development environment.
This plugin is not intended for use in production or other deployed environments.

## Installation

### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-dev-certs
```

### Existing apps

```
npm i @godaddy/gasket-plugin-dev-certs
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';

export default makeGasket({
  plugins: [
+   pluginDevCerts
  ]
});
```

## Configuration

To be set under the `environments.local.devCerts` section of your `gasket.js` file.

- `path` - (string): Directory where the certs will be saved. Default is `.certs`.
- `commonNames` - (string[]): Array of certificates that you want downloaded.
- `sniNames` - (string[]): Array of common names to configure for SNI support.

```javascript
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    pluginDevCerts,
    // ...
  ],
  environments: {
    local: {
      // ...
      devCerts: {
        path: '.certs', // default
        commonNames: [
          '*.freemium.api.dev-godaddy.com',
          'freemium.accounts.client.int.dev-godaddy.com'
        ],
        // Customize which certs should be configured for SNI support
        sniNames: [
          '*.gasket.dev-godaddy.com',
          '*.gasket.dev-secureserver.net',
          '*.gasket.dev-gdcorp.tools'
        ]
      }
    }
  }
});
```

With the `local` environment configured as above, certs will be checked when the
[installDevCerts](#installDevCerts) action is run and the Gasket environment
is `local`.

### SNI Support

By default, the plugin comes pre-packaged with certs available for local development
of Gasket apps. Some are also pre-configured for SNI support for local servers.

| Cert Common Name                | Local SNI Default |
|---------------------------------|-------------------|
| `*.gasket.dev-godaddy.com`      | ✅                 |
| `*.gasket.dev-secureserver.net` | ✅                 |
| `*.gasket.dev-gdcorp.tools`     | ✅                 |
| `*.gasket.int.dev-gdcorp.tools` | ✅                 |
| `*.gasket.int.dev-godaddy.com`  | ✅                 |
| `*.gasket.dev-afternic.com`     | ❌                 |
| `*.gasket.dev-123-reg.co.uk`    | ❌                 |

You can add or remove cert names from the `sniNames` array in your `gasket.js` file.
For example, if you would like to use the `*.gasket.dev-afternic.com` cert for SNI,
you can set it in the `sniNames` config array:

```javascript
import { makeGasket } from '@gasket/core';
export default makeGasket({
  plugins: [
    // ...
  ],
  environments: {
    local: {
      // ...
      devCerts: {
        sniNames: [
          '*.gasket.dev-godaddy.com',
          '*.gasket.dev-afternic.com'
        ]
      }
    }
  }
});
```

Now, your local app will be accessible for both `local.gasket.dev-godaddy.com`
and `local.gasket.dev-afternic.com`.


## Actions

When running these Gasket Actions, the plugin will check if the certs are
missing or out of date, and download them.
It will first prompt you for your Jomax login credentials.

### getDevCert

Use this to retrieve a cert and key for a given common name.
Be sure to only use this in code paths that are only executed in your local
development environments.

**Signature**

- `gasket.actions.getDevCert(commonName: string): Promise<{ cert: string, key: string }>`

When reading the cert files, the intermediate chain will be concatenated in
the cert.

```js
const { cert, key } = await gasket.actions.getDevCert('example.client.gdcorp.tools');
```

### installDevCerts

This will download all the certs configured in the `environments.local.devCerts`
commonNames array.
Be sure to only configure Gasket environments that you use for local
development.

Typically, you can just use the `getDevCert` action, but this is useful if you
want to download all the certs at once and have a different way of reading them.
