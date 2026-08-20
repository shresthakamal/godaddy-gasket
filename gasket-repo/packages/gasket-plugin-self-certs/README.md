# @godaddy/gasket-plugin-self-certs

Gasket plugin for generating self-signed certificates and autoconfiguring HTTPS
for containerized applications.

## Installation

### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-self-certs
```

### Existing apps

```
npm i @godaddy/gasket-plugin-self-certs
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';

export default makeGasket({
  plugins: [
+   pluginSelfCerts
  ]
});
```

## Configuration

As of this writing, HTTPS on containers is a security requirement.
When this plugin is configured for an app, it will generate a self-signed
certificate for `localhost`.

This is only autoconfigured when the `GASKET_ENV` is _not_ `local` since most
use the certs from [@godaddy/gasket-plugin-dev-certs] for local development.
If you want to generate a self-signed certificate for local development,
or use a different common name, you can configure the `selfCerts`.

- `https` - (string|boolean) The common name for the self-signed certificate.
  Defaults to `'localhost'` for non-local Gasket environments.
  Set to `false` to disable.

```javascript
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // ...
  ],
  selfCerts: {
    https: 'custom.hostname.com'
  },
  environments: {
    local: {
      selfCerts: {
        https: false
      }
    }
  }
});
```

## Actions

### getSelfCert

Use this to generate and/or retrieve a cert and key for a given common name.

**Signature**

- `gasket.actions.getSelfCert(commonName: string): Promise<{ cert: string, key: string }>`

```js
const { cert, key } = await gasket.actions.getSelfCert('custom.hostname.com');
```

[@godaddy/gasket-plugin-dev-certs]: /packages/gasket-plugin-dev-certs/README.md
