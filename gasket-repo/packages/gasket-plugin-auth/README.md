# @godaddy/gasket-plugin-auth

Gasket plugin to set up auth related middleware and express endpoints. For
securing pages and components of your Gasket app, it is recommended to use the
components from [@godaddy/gasket-auth].

## Important Changes

### New Token Expiration Policy (Default)

**As of this version, the default token expiration policy has changed** to provide better security and consistency:

#### New Policy (Default: `use12HourExpiration: true`)
- **Level 1/2 (low/medium risk)**: 30 days for persistent tokens, 12 hours for non-persistent
- **Level 3 (high risk)**: 1 hour for all tokens

#### Legacy Policy (`use12HourExpiration: false`)
- **Level 1 (low risk)**: 180 days persistent, 24 hours non-persistent
- **Level 2 (medium risk)**: 7 days persistent, 12 hours non-persistent
- **Level 3 (high risk)**: 1 hour for all tokens

**Migration:** If your application requires the legacy 180-day token lifetime, set `use12HourExpiration: false` in your auth configuration:

```javascript
// gasket.config.js
export default {
  auth: {
    use12HourExpiration: false  // Use legacy policy
  }
}
```

## Installation

This plugin is already added by [@godaddy/gasket-preset-webapp].
The following steps are only necessary if that preset was not used.

#### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-auth
```

#### Existing apps

```
npm i @godaddy/gasket-plugin-auth
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginAuth from '@godaddy/gasket-plugin-auth';

export default makeGasket({
  plugins: [
+   pluginAuth
  ]
});
```

## Configuration

To be set under `auth` in the `gasket` config:

- `appName` - (string) Set if app is not using `uxp-plugin`. Defaults to app from
  `presentationCentral` params.
- `basePath` - (string) Set if the app is served under a path from the domain.
  This can also be set at the root of the `gasket.js`, which useful for
  specifying `basePath` for multiple plugins.
- `realm` - (string) Target token type for the app (default: `idp`).
  - one of: `idp`, `jomax`, `pass`, `cert`, `awsiam`, `oauth`
- `forceHeartbeat` - (boolean) Configures whether heartbeat checks are performed
  against the `vat` claim of JWTs (default `true`).
- `apiProxy` - (object) Set if the app requires going through an API proxy for SSO.
  This object should include:
  - `host` - (string) the hostname of the API proxy your app is using (do not include the scheme)
  - `cert` - (string) the contents of the client cert your app uses to authenticate with the API Proxy
  - `key` - (string) the contents of the client cert's key your app uses to authenticate with the API Proxy
- `host` - (string[]) By default, this will be set according to the runtime env.
  This can be used in uncommon situations such as running the `local` env, but
  needing the auth host to be `['test-godaddy.com']`.
- `authRoutes` - (object) Configuration for protecting specific routes with authentication.
  Each route key should be a string path that will be matched against incoming requests.
  The path can include parameters and wildcards following [path-to-regexp] rules.
  - `[route]` - (object) Route-specific configuration.
    - `params` - (object) Authentication parameters for route protection.
      Supports all [Request Options](#request-options).
- `oauth` - (object) OAuth resource-server validation config for the `oauth` realm.
  - `oauthIssuer` - (string) OAuth issuer URL. Uses per-env defaults when not set.
  - `oauthAudience` - (string) Expected audience (resource identifier).
    When omitted, audience validation is **disabled** — any well-formed token
    from the issuer is accepted, so a token minted for another service can be
    replayed against this one. Set this to your service's resource identifier
    to restrict tokens to your service.

### Request Options

These options can be set when making an auth check for a request, but can also
be added to `auth` in the `gasket` config acting as defaults.

- `realm` - (string) Where the token should originate from; also called `typ`.
  If not specified, the realm in Gasket configuration will be used.
  - one of: `idp`, `idp_int`, `jomax`, `pass`, `cert`, `awsiam`, `oauth`
- `risk` - (string) The token expiration level.
  - one of: `low`, `medium`, `high`
- `type` - (string[]) Allowed *idp* token types; also called `auth`.
  - one or more of: `basic` (default), `s2s`, `e2s`, `e2s2s`, etc.
- `groups` - (string[]) Allowed *jomax* admin groups.
  An employee must have at least one of the specified groups when logged in to
  jomax realm, or when impersonating. This option can only be combined with
  *jomax* realm, or *idp* realm for *e2s* or *e2s2s* types.
- `certs` - (string[]) Allowed *cert* common names.
- `roles` - (string[]) Allowed AWS IAM *role*.
- `scopes` - (string[]) Allowed *oauth* scopes; at least one must be present on the token.
- `allowHeartbeat` - (boolean) Perform heartbeat request when VAT is expired.
- `use12HourExpiration` - (boolean) Use the new 12-hour/30-day expiration policy for IDP
  tokens. When `true` (default), tokens expire based on the new policy:
  - Risk level `low` (1): 30 days persistent / 12 hours non-persistent
  - Risk level `medium` (2): 30 days persistent / 12 hours non-persistent
  - Risk level `high` (3): 1 hour (both persistent and non-persistent)

  When `false`, uses the legacy expiration policy:
  - Risk level `low` (1): 180 days persistent / 24 hours non-persistent
  - Risk level `medium` (2): 7 days persistent / 12 hours non-persistent
  - Risk level `high` (3): 1 hour (both persistent and non-persistent)

  Default: `true`. Applies to IDP realm only.

### Return Value

The returned value is a Promise that resolves to an object with the following properties:

| Property                   | Type      | Description                                                                                                                            |
|----------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------|
| `valid`                    | `Boolean` | Indicates whether the request's credentials are valid and authorized.                                                                  |
| `reason`                   | `String`  | Error message explaining the reason for the auth check failing. Only present if `valid === false`.                                     |
| `authReason`               | `Number`  | A reason code which is understood by SSO if passed to the login page as a `reason` query parameter. Only present if `valid === false`. |
| `realm`                    | `String`  | The auth realm the check was performed for. Only present if `valid === true`.                                                          |
| `details`                  | `Object`  | Details about the authorized credentials. Only present if `valid === true`.                                                            |
| `details.shopperId`        | `String`  | Shopper ID from the auth token. Only present if `realm` is `idp` or `idp_int`.                                                         |
| `details.privateLabelType` | `Number`  | Type of reseller the shopper belongs to. Only present if `realm` is `idp` or `idp_int`.                                                |
| `details.customerId`       | `String`  | Customer ID from the auth token. Only present if `realm` is `idp` or `idp_int`.                                                        |
| `details.type`             | `Number`  | The IDP auth type. Only present when `realm` is `idp` or `idp_int`.                                                                    |
| `details.plid`             | `Number`  | The private label ID. Only present when `realm` is `idp`, `idp_int`, or `pass`.                                                        |
| `details.passId`           | `String`  | PASS ID from the auth token. Only present if `realm` is `pass`.                                                                        |
| `details.accountName`      | `String`  | Jomax username. Only present if `realm === 'jomax'`.                                                                                   |
| `details.groups`           | `Array`   | Array of Jomax active directory groups. Only present if `realm === 'jomax'`.                                                           |
| `details.role`             | `String`  | AWS IAM role ARN. Only present if `realm === 'awsiam'`.                                                                                |
| `details.cert`             | `String`  | Common name of the certificate. Only present if `realm === 'cert'`.                                                                    |
| `details.clientId`         | `String`  | OAuth client identifier from the token. Only present if `realm === 'oauth'`.                                                           |
| `details.scopes`           | `String[]`| OAuth scopes granted to the token. Only present if `realm === 'oauth'`.                                                                |


## Lifecycles

### authChecked

This is a `gasket` lifecycle that provides a mechanism so that applications
and plugins can observe various auth events. This can be used to log these
events.

When wiring up to this lifecycle the lifecycle will look like:
`authChecked: async function(gasket, authData)`. `authData` will be an options
 style parameter. This object will contain at a minimum the following properties:

- `message` (string) A simple message about what the event is. In the case of auth failure, this will be the reason for failure
- `req` (object) The http request object
- `success` (boolean) True if auth succeeded, False for any authentication/authorization failure
- `...other` (...Any) The object may contain additional data about the event

## Actions

### getCheckAuth

This action returns a `checkAuth` function that can be used to check different
authorization criteria for a given of a request.

```js
import gasket from '../gasket.js';

async function doSomethingSecurely(req) {
  const checkAuth = gasket.actions.getCheckAuth(req);

  const highRiskAuth = await checkAuth({
    realm: 'idp',
    risk: 'high'
  });
  if(highRiskAuth.valid) {
    return {
      some: 'high risk details'
    }
  }

  const lowRiskAuth = await checkAuth({
    realm: 'idp',
    risk: 'high'
  });

  if(lowRiskAuth.valid) {
    return {
      some: 'low risk details'
    }
  }
}
```

### checkAuth

This action accepts the auth params and checks the auth criteria for a request
directly.

```js
import gasket from '../gasket.js';

async function doSomethingSecurely(req) {
  const employeeAuth = await gasket.actions.checkAuth(req, { realm: 'jomax' });

  if(employeeAuth.valid) {
    const { accountName, groups } = employeeAuth.details;

    return {
      accountName,
      groups
    }
  }
}
```

### checkShopperAuth

Much like the previous action, this action checks the auth criteria for a
request but with preconfigured options for the shoppers in `idp` realm.

```js
import gasket from '../gasket.js';

async function doSomethingSecurely(req) {
  const shopperAuth = await gasket.actions.checkShopperAuth(req);

  if(shopperAuth.valid) {
    const { shopperId, customerId } = shopperAuth.details;

    return {
      shopperId,
      customerId
    }
  }
}
```

## Route Protection

This plugin can protect any route with authentication when configured using `authRoutes`.
When a user accesses a protected route without proper authentication, they will be
redirected to SSO for login.

The realm defaults to the one specified in the main `auth` configuration if not provided
in the route-specific configuration.

### Basic Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginAuth,
    pluginSwagger
  ],
  
  // Swagger plugin configuration
  swagger: {
    apiDocsRoute: '/api-docs'
  },

  // Auth plugin configuration
  auth: {
    realm: 'jomax',

    // Route protection configuration
    authRoutes: {
      '/api-docs': {
        params: { realm: 'jomax' }
      }
    }
  }
});
```

### Advanced Configuration

```js
// gasket.js
export default makeGasket({
  auth: {
    realm: 'jomax',
    risk: 'low',

    // Protect multiple routes with different authentication requirements
    authRoutes: {
      '/api-docs': {
        params: { realm: 'jomax', risk: 'medium' }
      },
      // protect admin and nested routes with high risk idp tokens
      '/admin{/*path}': {
        params: { realm: 'idp', risk: 'high' }
      },
      // protect internal API with certs
      '/internal-api': {
        params: { realm: 'cert' }
      }
    }
  }
});
```

### getAuthToken

This action extracts the authentication token for a specific realm from the 
request. It checks both HTTP headers (`Authorization` and `X-Authorization`) 
and cookies for the token. Returns the token string if found, or `null` if 
no valid token is present. This does not validate the token; only retrieves it.

```js
import gasket from '../gasket.js';

async function extractTokenForRealm(req) {
  // Get IDP token from request
  const idpToken = await gasket.actions.getAuthToken(req, 'idp');
  
  if (idpToken) {
    // Token found - can use for further processing
    return { token: idpToken, realm: 'idp' };
  }
  
  // Try another realm
  const jomaxToken = await gasket.actions.getAuthToken(req, 'jomax');
  
  if (jomaxToken) {
    return { token: jomaxToken, realm: 'jomax' };
  }
  
  // No tokens found
  return null;
}
```

## Endpoint

A GET endpoint will be added to the express server which accepts the Options as
query params. This allows auth checks to be made from the browser.

#### Endpoint Example

```js
async function doSomethingInBrowser() {
  const authResponse = await fetch('/api/auth/validate?realm=jomax')
  if(authResponse.ok) {
    const authData = await authResponse.json();
    if(authData.valid) {
      // Authenticated: continue
    }
  }

  // Unauthenticated: exit
}
```

If `basePath` is specified, the endpoint will _also_ be available with under
this path to allow for different proxy configurations.

## FFI Library Support (Experimental)

The plugin now supports the new `@godaddy/gd-auth-lib` FFI-based authentication library 
as an optional feature. This provides better performance while maintaining backward 
compatibility with the existing `gd-auth` library.

To enable the FFI library, add the following to your configuration:

```js
// gasket.js
export default makeGasket({
  auth: {
    appName: 'my-app',
    host: ['godaddy.com'],
    useFFILibrary: true,  // Enable the new FFI library
    client: 'my-client',  // Client identifier (optional)
    pcpId: '12345',       // PCP identifier (REQUIRED for production)
    // ... other auth config
  }
});
```

**Important**: `pcpId` is required when using the FFI library in production environments. For local development, a default value will be used with a warning.

For more details, see the [FFI Library Integration documentation](./docs/ffi-library-guide.md).
## Next.js Authentication

GoDaddy Gasket apps are currently limited to Next.js 14, which doesn't support Node.js runtime in middleware.
This means server-side authentication for a request won't work in Next.js App Router apps. In the meantime,
use client-side authentication with [@godaddy/gasket-auth] components until we can support Next.js 15.

<!-- LINKS -->

[@godaddy/gasket-auth]:/packages/gasket-auth/README.md
[@godaddy/gasket-preset-webapp]:/packages/gasket-preset-webapp/README.md
[path-to-regexp]: https://github.com/pillarjs/path-to-regexp
