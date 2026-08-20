# @godaddy/gasket-plugin-gocaas

Generates the GoCaas node client in Gasket apps.

## Installation

#### New apps

``` sh
gasket create <app-name> --plugins @godaddy/gasket-plugin-gocaas
```

#### Existing apps

``` sh
npm i @godaddy/gasket-plugin-gocaas
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginGoCaas from '@godaddy/gasket-plugin-gocaas';

export default makeGasket({
  plugins: [
+   pluginGoCaas
  ]
});
```

## Configuration

This plugin leverages the [gasket-plugin-jwt] to configure AWS IAM and certificate JWT authentication for the [GoCaas node client]. When defining the `jwt` object in the `makeGasket` function in `gasket.js` for this plugin, use `goCaas` as the configuration key.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ]
  jwt: {
    goCaas: {
      // Cert or IAM configuration
    }
  }
});
```

To add optional headers to your GoCaas client, you can define a `goCaas` object in `makeGasket` in `gasket.js` and add your optional headers as key-value pairs on the `headers` object. The `headers` object will be passed to the GoCaas client as the `headers` parameter.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ]
  goCaas: {
    headers: {
      'x-custom-header': 'custom-value'
    }
  }
});
```

## Usage

To generate a GoCaas client, use the `getGoCaasClient` action provided by this plugin. The env parameter for the [GoCaas node client] is populated under the hood by using the `gasket.config.env` property.


The `getGoCaasClient` action will automatically use the JWT configuration from `jwt.goCaas` in the Gasket Config to authenticate the GoCaas service.

```js
const client = await gasket.actions.getGoCaasClient()
```

If you do not provide a JWT configuration in the Gasket Config, you can provide a JOMAX JWT directly to the `getGoCaasClient` action. The use of JOMAX JWTs is restricted from being used in production environments.

```js
const client = await gasket.actions.getGoCaasClient(req.cookies.auth_jomax)
```


<!-- links -->
[gasket-plugin-jwt]: /packages/gasket-plugin-jwt/README.md
[GoCaas node client]: https://github.com/gdcorp-im/caas-client
