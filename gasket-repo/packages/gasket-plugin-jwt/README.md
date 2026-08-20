# @godaddy/gasket-plugin-jwt

Generates JWTs from certs or AWS IAM credentials.

## Installation

#### Existing apps

``` sh
npm i @godaddy/gasket-plugin-jwt
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginJwt from '@godaddy/gasket-plugin-jwt';

export default makeGasket({
  plugins: [
+   pluginJwt
  ]
});
```

## Configuration

This plugin allows you to generate JWTs based configured in the `jwt` object in the
`gasket.js`. Under the hood, this plugin uses [gd-auth-client] to generate JWTs.

The `jwt` object can be configured to generate JWTS from 3 different sources:

- Local Certs
- DevCerts
- AWS IAM credentials

JWTs are validated using the `GdAuth` class from the [node-gd-auth] package.

This plugin **requires** an `appName` to be set in the `auth` object in the `gasket` object.
This is the same configuration used for [@godaddy/gasket-plugin-auth].

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  auth: {
    appName: // your app name
  },
  jwt: {
    nameOfKey: {
      // Cert or IAM configuration
    }
  }
});
```

### Cert Configuration

| Param                     | Type                 | Required               | Description                                                     | Default                                            |
|---------------------------|----------------------|------------------------|-----------------------------------------------------------------|----------------------------------------------------|
| ssoHost                   | `string`             | true                   | The SSO host to target (e.g. sso.godaddy.com).                  |                                                    |
| cert                      | `string`             | paired with `key`      | Loaded public key in pem format.                                |                                                    |
| key                       | `string`             | paired with `cert`     | Loaded private key in pem format.                               |                                                    |
| certFile                  | `string`             | paired with `keyFile`  | Path to certificate public key in pem format.                   |                                                    |
| keyFile                   | `string`             | paired with `certFile` | Path to certificate private key in pem format.                  |                                                    |
| devCert                   | `string`             | true if using DevCerts | DevCert common name                                             |                                                    |
| ttl                       | `number`             | false                  | ttl in seconds for jwt to be cached                             | `14400` (4 hours)                                  |
| [options]                 | `object`             | false                  | Options passed to SSO API (realm, subordinateUser)              | `{realm: "cert", subordinateUser: null}` |
| [options.realm]           | `string`             | false                  | The SSO realm to target (e.g. cert, idp, pass, etc)             | `"cert"`                                 |
| [options.subordinateUser] | `number` \| `string` | false                  | The id of the user to delegate to (e.g. shopperId in idp realm) |                                                    |

#### Local Certs

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import path from 'path';
const certsDir =  path.join(__dirname, '/.certs')

export default makeGasket({
  plugins: [
    // plugins
  ],
  jwt: {
    swp: {
      ssoHost: 'sso.godaddy.com',
      cert: `${certsDir}/gasketcerttest.dev.client.int.godaddy.com.crt`,
      key: `${certsDir}/gasketcerttest.dev.client.int.godaddy.com.key`,
      ttl: 10000
    }
  }
});
```

#### DevCerts

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  jwt: {
    devJwt: {
      ssoHost: 'sso.dev-godaddy.com',
      devCert: '*.gasket.dev-godaddy.com'
      ttl: 10000
    }
  }
});
```

### AWS IAM Configuration

| Param | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| ssoHost | `string`|  | true | The SSO host, e.g. sso.godaddy.com |
| ttl       | `number`| `14400` (4 hours) | false  | ttl in seconds for jwt to be cached |
| [options] | `object`| `{primaryRegion: "us-west-2", secondaryRegion: "us-east-1", credentialProviderChain: new CredentialProviderChain() }`| false | Options to configure the client |
| [options.primaryRegion] | `string`| `"us-west-2"`| false | The primary AWS region to target when retrieving an IAM JWT |
| [options.secondaryRegion] | `string`| `"us-east-1"`| false | The secondary AWS region to target when retrieving an IAM JWT, if the primary region fails |
| [options.credentialProviderChain] | `AwsCredentialIdentityProvider`|  | false | An instance of AwsCredentialIdentityProvider, from the @aws-sdk/credential-providers. Uses the default provider chain if not provided. |

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import path from 'path';
const certsDir =  path.join(__dirname, '/.certs')

export default makeGasket({
  plugins: [
    // plugins
  ],
  jwt: {
    goCaas: {
      ssoHost: 'sso.dev-godaddy.com',
      options: {
        primaryRegion: 'us-west-2',
        secondaryRegion: 'us-west-2'
      },
      ttl: 10000
    }
  }
});
```

## Actions

### getJwt

To generate a JWT, use the `getJwt` action provided by this plugin.
The `getJwt` action accepts a key that corresponds to the key in the `jwt`
object in the `gasket.js`.

```js
const jwt = await gasket.actions.getJwt('swp')
```
<!-- links -->
[gd-auth-client]:https://github.com/gdcorp-identity/node-gd-auth-client
[node-gd-auth]:https://github.com/gdcorp-identity/node-gd-auth
[@godaddy/gasket-plugin-auth]:/packages/gasket-plugin-auth/README.md
