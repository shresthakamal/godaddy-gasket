# `@godaddy/gasket-plugin-switchboard`

Gasket plugin for the Switchboard system (formerly known as AppConfig).

Creates a [`@switchboard/client`][switchboard-client] that allows you to access
config throughout your application on both the server and the client, in
addition to Hivemind experiments.

## Installation

#### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-switchboard
```

#### Existing apps

```
npm i @godaddy/gasket-plugin-switchboard
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginSwitchboard from '@godaddy/gasket-plugin-switchboard';

export default makeGasket({
  plugins: [
+   pluginSwitchboard
  ]
});
```

### Windows Native OS Users

Windows (not WSL), has an extra setup step. Please follow the [Switchboard Client instructions](https://github.com/gdcorp-uxp/switchboard-client/#windows-native-os-client-consumers-all-client-library-languages-not-using-wsl).

## Configuration

The configuration object for this plugin should be placed under a `switchboard` property in `gasket.js`. It has the following properties.

| Option | Description  | Type |
|---------------|------------------------------|--------------------------|
| `app`         | The switchboard app ID to fetch settings for. Use this config option if you are fetching settings for only one app. Use an `@` prefix for special apps which do not appear directly in the switchboard UI, for example `@hivemind` to access hivemind experiments. | string                   |
| `apps`        | Like `app`, but specifies that settings should be fetched for multiple switchboard apps. | string[]                 |
| `appSettings` | Enables the fetching of a specific list of settings for one or more app IDs. If not specified, all settings are fetched.   | object |
| `appLabels`   | Enables fetching of a subset of settings based on labels (currently only supported for the `@hivemind` app). | object |
| `auth`            | **REQUIRED** Configuration for cert or **OPTIONAL** for [IAM JWT auth](https://godaddy-corp.atlassian.net/wiki/spaces/AUTH/pages/89655187/AWS+IAM+JWT) | object   |
| `auth.primaryRegion` | **REQUIRED** if using IAM JWT auth - Specifies the primary AWS region to use for fetching credentials.  | string |
| `auth.secondaryRegion` | **REQUIRED** if using IAM JWT auth - Specifies the backup AWS region to use for fetching IAM JWT auth credentials.  | string |
| `auth.cert` | Use this, along with `key` only if using [Cert JWT auth](https://godaddy-corp.atlassian.net/wiki/spaces/AUTH/pages/89655742/Cert+JWT). Should contain the PEM-encoded public certificate to use for authentication. Use `auth.certPath` if you wish to reference certificates stored on disk instead. | string \| string[] |
| `auth.key` | PEM-encoded private key to use for cert JWT authentication. Use `auth.keyPath` if you wish to use files instead. | string |
| `auth.certPath` | Like `auth.cert`, except using a file path instead of the cert content. | string \| string[] |
| `auth.keyPath` | Like `auth.key`, except using a file path instead of the cert content. | string |
| `auth.type` | Selects an **OAuth Bearer token** auth mode. One of `oauth_manual`, `oauth_client_credentials`, `oauth_iam_exchange`, `oauth_cert_exchange`, or `oauth_cert_path_exchange`. Omit for the legacy SSO JWT modes (IAM/cert). See [OAuth authentication](#oauth-authentication) below. | string |
| `auth.initialToken` | **REQUIRED** for `oauth_manual`. The OAuth Bearer access token to use. It is not auto-refreshed; rotate it via `client.updateOAuthToken()` before it expires. | string |
| `auth.clientId` | **REQUIRED** for `oauth_client_credentials`. OAuth client ID. | string |
| `auth.clientSecret` | **REQUIRED** for `oauth_client_credentials`. OAuth client secret. | string |
| `auth.scope` | OPTIONAL for OAuth exchange/credentials modes. OAuth scopes to request. Defaults to `["switchboard.setting:read"]`. | string[] |
| `auth.oauthTokenUrl` | OPTIONAL for OAuth exchange/credentials modes. Override the OAuth token endpoint URL. Defaults to the environment-appropriate URL. | string |
| `callingService` | Arbitrary identifier for your application used for tracking by the switchboard API. Defaults to your UXP app ID. | string |
| `cacheRefreshMs`  | Number of milliseconds to wait between background refreshes of config settings. Defaults to 2 minutes. | number   |
| `env`             | The environment to fetch settings for. Must be `development`, `test`, or `production`. Defaults to the Gasket environment.                       | string   |
| `output`          | Tune the `switchboard` object output                 | object   |
| `output.multiApp` | Output options for when you are fetching settings for more than one app ID. Must be either `merge` (default) or `group`. The `merge` option places setting keys for all apps in the same output object, whereas `group` places settings for each individual app under their own app ID keys. | string   |
| `enable`          | This can either be a boolean flag that disables switchboard entirely (useful for selectively disabling in environments) or a callback to control whether switchboard is enabled on a per-request basis. The callback receives an object with req and res properties for the HTTP request & response, and it should return `true` if switchboard should be enabled. See the example configuration below. | Function or boolean |

### Example configurations

Here is what configuration looks like for a Switchboard-enabled app. See the inline comments for details.

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import presetWebapp from '@godaddy/gasket-preset-webapp';

 export default makeGasket({
  plugins: [
    presetWebapp
  ],
  switchboard: {
    // (Required) The Switchboard app ID
    app: 'my-app',

    // Or if you need to fetch from multiple app IDs:
    // apps: ['my-app', 'another-app'],

    // Or if you need to fetch specific settings
    // appSettings: {
    //   "@hivemind": ['my_team_experiment_a', 'my_team_experiment_b']
    // },

    // Or if you want to use labels
    // appLabels: {
    //   "@hivemind": ['team1', 'team2']
    // },

    // As shown above, to use a special app not listed in the Switchboard UI,
    // like hivemind, prefix with an @ symbol.

    // Alternative to all of the above, you can use the dataRetrieval setting
    // of @switchboard/client directly instead. See https://github.com/gdcorp-uxp/switchboard-client/blob/main/node/config_client/docs/auto-generated/interfaces/ConfigOptions.md#dataretrieval.
    // Note that you must add a default| prefix in front of "regular" app
    // identifiers.
    // dataRetrieval: {
    //   'default|my-app': {}     // Empty object implies fetch all settings
    //   'hivemind': {
    //     settings: ['my_team_experiment_a', 'my_team_experiment_b'],
    //     labels: ['team1', 'team2']
    //   }
    // }

    // Only required if you're using CertJWT auth; default is to use IAM JWTs
    auth: {
      certPath: [
        '/etc/pki/tls/certs/my.client.crt',
        '/etc/pki/tls/certs/my.client_intermediate_chain.crt',
      ],
      keyPath: '/etc/pki/tls/private/my.client.key'
    },

    // Or if you have certificates/key contents rather than file paths
    // auth: {
    //   cert: [
    //     process.env.SWITCHBOARD_CERT,
    //   ],
    //   key: process.env.SWITCHBOARD_KEY
    // },

    // Or if you are using IAM JWTs, leave out the auth section or customize
    // it as below:
    // auth: {
    //   primaryRegion: 'us-west-2',
    //   secondaryRegion: 'us-east-1'
    // },

    // Optional: defaults to 2 minutes
    // cacheRefreshMs: 120_000,

    // Optional: defaults to your UXP app ID
    // callingService: 'my-app',

    // Optional: defaults to standard Gasket environments if you are using a
    // typical set of environments in your app.
    // env: 'production',

    // Optional: callback on a per-request basis for enabling/disabling
    // switchboard functionality. Receives an object with req and res properties
    // for the HTTP request & response. defaults to () => true
    // Example:
    // enable: ({ req, res }) => req.path.includes('/foo'),

    // Optional: enable access to switchboard data in `@gasket/data`
    // enableGasketData: true,

    // Optional: DEPRECATED - enable access to switchboard data in Redux state
    // enableRedux: true,

    /*
    // Optional: options controlling the format of the output
    output: {
      // Ouput format to use if you are fetching settings from multiple apps.
      // Default is 'merge' where setting keys from all apps appear in the
      // same output object. 'group' keeps each app's settings separate and
      // outputs an object with settings for each app under a key using the
      // app ID.
      multiApp: 'group'
    }
    */
  }
});
```

### Authentication at runtime

If you need to define certificates or keys at runtime, you can use the `prepare` lifecycle hook to set the `auth` property on the `switchboard` config. This is useful if you need to fetch certificates from a secret store or other dynamic source.

```js
// switchboard-certs-plugin.js
export default {
  hooks: {
    prepare: {
      timing: {
        // Hook run before the switchboard plugin to set up the auth config
        before: ['@godaddy/gasket-plugin-switchboard']
      },
      handler: async function prepare(gasket, defaultConfig) {
        if (!gasket.config.env.includes('local')) return defaultConfig;
        const { cert, key } = await gasket.actions.getDevCert('<cert-common>');
        return {
          ...defaultConfig,
          switchboard: {
            ...defaultConfig.switchboard,
            auth: {
              cert: [cert],
              key: key
            }
          }
        };
      }
    }
  }
}
```

### OAuth authentication

The Switchboard client also supports authenticating with an **OAuth Bearer
token** (`Authorization: Bearer <token>`) instead of a legacy SSO JWT. Select an
OAuth mode with the `auth.type` discriminator. Except for `oauth_manual`, the
client obtains and refreshes the token automatically in the background.

```js
// gasket.js
export default makeGasket({
  plugins: [presetWebapp],
  switchboard: {
    app: 'my-app',

    // Exchange the AWS IAM role (default credential chain) for an OAuth token.
    // Recommended for new IAM-authenticated workloads.
    auth: {
      type: 'oauth_iam_exchange',
      primaryRegion: 'us-west-2',
      secondaryRegion: 'us-east-1'
    }

    // Or exchange a client certificate for an OAuth token, by file path:
    // auth: {
    //   type: 'oauth_cert_path_exchange',
    //   certPath: ['/etc/pki/tls/certs/my.client.crt'],
    //   keyPath: '/etc/pki/tls/private/my.client.key'
    // },

    // ...or with the certificate/key contents inline:
    // auth: {
    //   type: 'oauth_cert_exchange',
    //   cert: [process.env.SWITCHBOARD_CERT],
    //   key: process.env.SWITCHBOARD_KEY
    // },

    // Or use the OAuth client credentials grant:
    // auth: {
    //   type: 'oauth_client_credentials',
    //   clientId: process.env.SWITCHBOARD_CLIENT_ID,
    //   clientSecret: process.env.SWITCHBOARD_CLIENT_SECRET
    // },

    // Or provide the token yourself (not auto-refreshed — rotate it via
    // client.updateOAuthToken() before it expires):
    // auth: {
    //   type: 'oauth_manual',
    //   initialToken: process.env.SWITCHBOARD_OAUTH_TOKEN
    // }
  }
});
```

As with the cert modes, relative `certPath`/`keyPath` values for
`oauth_cert_path_exchange` are resolved against the Gasket root.

## Usage

### Accessing Switchboard Data

#### Example with Next.js SSR

The Switchboard config can be read during server-side rendering so long as you have the request object. Example using the `getServerSideProps` method with the Next.js pages router:

```js
// /pages/example.js

import * as React from 'react';
import gasket from '../gasket.js';

const PageComponent = () => <div>...</div>

export async function getServerSideProps({ req }) {
  const switchboardData = await gasket.actions.getSwitchboardConfig(req);
  return {
    flags: switchboardData.featureFlags
  };
}

export default PageComponent;
```

#### Example with gasketData

By default, Switchboard data is not included in the [gasketData] store. To include it, configure [@gasket/plugin-data] for your app and set the `enableGasketData` option in the `switchboard` configuration.
You can also hook the `switchboardBrowserState` lifecycle to customize the data that is exposed to the client.

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import dataPlugin from '@gasket/plugin-data';
import switchboardPlugin from '@godaddy/gasket-plugin-switchboard';

export default makeGasket({
  plugins: [
    dataPlugin,
    switchboardPlugin,
    {
      name: 'my-inlined-plugin',
      hooks: {
        switchboardBrowserState(gasket, defaultConfig, { req }) {
          return defaultConfig.browserSafeSettings;
        }
      }
    },
    // ...
  ],
  switchboard: {
    // ...
    enableGasketData: true
  },
  // ...
});
```

You can now access the `switchboard` key from `gasketData` in your component code using the [useGasketData] hook from `@gasket/nextjs`:

```js
import { useGasketData } from '@gasket/nextjs';

const MyComponent = () => {
  const { switchboard } = useGasketData();
  return (
    <div>
      {switchboard.someFeatureFlag && <p>Feature is enabled!</p>}
    </div>
  );
};
```

#### Example with Redux

_⚠️ DEPRECATED - This Redux approach is not guaranteed to work and will be removed in a future release.
Please use the `gasketData` method above instead._

By default, Switchboard data is not included in your redux store. To include it, set the `enableRedux` option in the `switchboard` configuration. You can also hook the `switchboardBrowserState` lifecycle to customize the data that is exposed to the client.

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import reduxPlugin from '@gasket/plugin-redux';
import switchboardPlugin from '@godaddy/gasket-plugin-switchboard';

export default makeGasket({
  plugins: [
    reduxPlugin,
    switchboardPlugin,
    {
      name: 'my-inlined-plugin',
      hooks: {
        switchboardBrowserState(gasket, defaultConfig, { req }) {
          return defaultConfig.browserSafeSettings;
        }
      }
    },
    // ...
  ],
  switchboard: {
    // ...
    enableRedux: true
  },
  // ...
});
```

You can now access the data in your client-side component code under a `switchboard` Redux state property:

```js
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const { someFeatureFlag } = useSelector(state => state.switchboard);
  return (
    <div>
      {someFeatureFlag && <p>Feature is enabled!</p>}
    </div>
  );
};
```

#### Example with Middleware

You can also access Switchboard config within express middleware:

```js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        middleware(gasket) {
          return async (req, res, next) => {
            try {
              const {
                betaSite,
                betaSiteURL
              } = await gasket.actions.getSwitchboardConfig(req);
              if (betaSite) {
                res.redirect(betaSiteURL);
              } else {
                next();
              }
            } catch (err) {
              next(err);
            }
          }
        }
      }
    }
  ]
});
```

#### Example direct switchboard client usage

If you wish to access the switchboard client outside of the context of an HTTP request, you can reference the [`@switchboard/client`][switchboard-client] directly from the `getSwitchboardClient` action:

```js
const client = await gasket.actions.getSwitchboardClient();
```

...or if you do not have access to the gasket context, you can access the instance which was created with the alias `gasket` from the switchboard library directly:

```js
const { getClient } = require('@switchboard/client');

const client = getClient('gasket');
```

### Notes on usage with hivemind

Be aware of the following when consuming hivemind experiments through `@godaddy/gasket-plugin-switchboard`:

1. You must specify the specific settings or labels your app is consuming from hivemind so that events are not recorded across all experiments.
2. Cohort allocation decisioning for every experiment you are consuming takes place on every request, including the logging of cohort allocation events for analysis. If you want to restrict cohort assignments along with all other config rule exercising from taking place, you can use the `enable` callback to customize per request.
3. If the "all or nothing" approach to reading hivemind experiments doesn't work for your case, like if you want to only exercise specific experiments procedurally instead of having all exercised per request, you should use a `@switchboard/client` instance directly instead of controlling experiments through this plugin.
4. Since cohort allocations are determined on the server, usage of trigger events is recommended so users that haven't actually observed the experiment aren't included in your reports.

## Actions

### getSwitchboardClient

This action creates a single instance of the Switchboard client and returns the same instance on subsequent calls. This action is asynchronous and takes no parameters.

```js
const client = await gasket.actions.getSwitchboardClient();
```

### getSwitchboardConfig

This action returns the switchboard config and invokes the `switchboardPerRequestParams` lifecycle to extract the params from the request. This action is asynchronous and takes a request object as a parameter.

```js
const switchboardConfig = await gasket.actions.getSwitchboardConfig(req);
```

### getPublicSwitchboardConfig

This action returns the public switchboard config object and invokes the `switchboardBrowserState` lifecycle. The `getSwitchboardConfig` action is used in this action to retrieve the switchboard config. This action is asynchronous and takes a request object as a parameter.

```js
const publicSwitchboardConfig = await gasket.actions.getPublicSwitchboardConfig(req);
```

### getExperimentCohorts

This action returns an object map, where each key is a hivemind experiment ID and each value is the assigned cohort ID for that experiment. This action is asynchronous and takes a request object as a parameter.

```js
const experimentCohorts = await gasket.actions.getExperimentCohorts(req);
```

## Lifecycles

### switchboardPerRequestParams

Switchboard allows your settings to vary based on rules that run against a set of parameters. By default, this Gasket plugin supplies a set of standard GoDaddy parameters that come from the inbound HTTP request: `locale`, `plid`, `shopperId`, `visitorGuid`, `visitorId`, and `visitGuid`. If you need to provide additional parameters for your switchboard rules, you can use the `switchboardPerRequestParams` lifecycle event.

This lifecycle event is passed the standard parameters and the HTTP request context. Hooks should return a new object instead of mutating an existing object. This is especially vital in the case of this event to avoid cross-request information leaks. Sample:

```js
// gasket.js
import { makeGasket } from '@gasket/core';
const getShopperInfo = require('./special-shopper-info');

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        async switchboardPerRequestParams(gasket, defaultParams, { req }) {
          const { isNewUser, isTLA } = await getShopperInfo(req);
          return {
            ...defaultParams,
            isNewUser,
            isTLA
          };
        }
      }
    }
  ]
});
```

### switchboardConfigOverride

If you need to override the config data that is fetched from Switchboard, you can use the `switchboardConfigOverride` lifecycle event. This event occurs during the `getSwitchboardConfig` action. It is called with the fetched data and the HTTP request context. Hooks should return a new object instead of mutating an existing object. This is especially vital in the case of this event to avoid cross-request information leaks. Sample:

```js
export default makeGasket({
  plugins: [
    {
      name: 'switchboard-data-override',
      hooks: {
        switchboardConfigOverride(gasket, defaultConfig, { req }) {
          if (req.headers['x-integration-test']) {
            return {
              ...defaultConfig,
              someFeatureFlag: true
            };
          }

          return defaultConfig;
        }
      }
    }
  ]
});
```

### switchboardBrowserState

If you would like to inject Switchboard data into your web app's client-side data, whether it's [`@gasket/data`](https://gasket.dev/docs/modules/data/) or your Redux store, you can hook the `switchboardBrowserState` lifecycle event in a custom plugin to provide that data. This is invoked during the [`publicGasketData`](https://gasket.dev/docs/plugins/plugin-data/#publicgasketdata) and [`initReduxState`](https://gasket.dev/docs/plugins/plugin-redux/#initreduxstate) lifecycle events and _after_ `switchboardConfigOverride`. The lifecycle hook is called with the full set of Switchboard data as well as a context object containing the HTTP request:

```js
export default makeGasket({
  plugins: [
    {
      name: 'switchboard-browser-state',
      hooks: {
        switchboardBrowserState(gasket, defaultConfig, { req }) {
          return defaultConfig.browserSafeSettings;
        }
      }
    }
  ]
});
```

## Migrating from @godaddy/gasket-plugin-appconfig

> ⚠️ `@godaddy/gasket-plugin-appconfig` is no longer available in `@godaddy/gasket` v3

Switchboard is the new name for what was formerly known as appconfig. This gasket plugin is similar in some ways, but it adds some new capabilities and breaking changes. Here's a step by step guide to migrating.

<!-- Team skips level 3 in headings to avoid them appearing in navigation -->

#### 1. Swap in the new plugin

Update your dependencies:

```shell
npm uninstall --save @godaddy/gasket-plugin-appconfig
npm install --save @godaddy/gasket-plugin-switchboard
```

...and update your plugins in `gasket.js`

``` diff
// gasket.js
+ import pluginSwitchboard from '@godaddy/gasket-plugin-switchboard';

export default makeGasket({
  plugins: [
+    pluginSwitchboard
  ]
});
```

#### 2. Update config settings

Configuration moves from an `appconfig` property to `switchboard` in your `gasket.js`.

```diff
{
-  appconfig: {
+  switchboard: {
    app: 'my-app',
    env: 'test', // "development" | "test" | "production" | "manual"
    auth: {
-      iam: {
      primaryRegion: 'us-west-2',
      secondaryRegion: 'us-east-1',
-      }
-      cert: process.env.CLIENT_CERT,
+      cert: [process.env.CLIENT_CERT],
      key: process.env.CLIENT_CERT_KEY,
    },
-    cache: {
-      path: null,
-      ttl: Infinity,
-      tts: 120_000,
+  cacheRefreshMs: 120_000,
-    },
-    immutable: true,
-    fetchOptions: {},
-    timedAuthTokenRefresh: true,
-    plugins: [/*...*/],
-    hivemindApp: 'my-app',
-    hivemindSdkKey: process.env.HIVEMIND_KEY
+    enableRedux: false,       // DEPRECATED - if enabled, places config under `config.switchboard` in redux state
+    enableGasketData: true    // if enabled, places config under `config.switchboard` in @gasket/data
  }
}
```

Notable changes:

* `auth.cert` - this should always be an Array, if it isn't already. This gives you the ability to append the issuing CA chain after the certificate if they aren't already concatenated together.
* `auth.cert`, `auth.key` - these should only be used if you're using PEM file contents; if you have file paths, change those to `auth.certPath` and `auth.keyPath`.
* The new Switchboard client library only does non-blocking background cache refreshes, so there is no separate `ttl` and `tts` concept.
* The new Switchboard client library always does timed refreshes of auth tokens.
* The new Switchboard client library does not support a file system cache.
* The new Switchboard client library does not support plugins.
* Hivemind split config rules are not supported by the new switchboard client, though [Hivemind experiments based on Switchboard settings are](#hivemind-migration).
* You must now explicitly opt in to whether your config is exposed to redux or @gasket/data via an `enableRedux` or `enableGasketData` config setting.

#### 3. Update lifecycle hooks

With the new plugin, the hookable lifecycles have new names and signatures.

```diff
# switchboardPerRequestParams
- module.exports = function (gasket, params, req, res) {
+ module.exports = function (gasket, params, { req, res }) {
  return { ...params, another: 'param' };
}
```

```diff
# switchboardBrowserState
- module.exports = function (gasket, state, req, res) {
+ module.exports = function (gasket, state, { req, res }) {
  return state.browserSafeProperties;
}
```

The `switchboardBrowserState` lifecycle differs a bit in behavior from `appConfigResults`. The `appConfigResults` lifecycle adjusts both what is present in `req.config.appConfig` and `config.appConfig` inside of the redux state. In contrast, the new plugin always makes the entire set of config values available at `req.config.switchboard`, but `switchboardBrowserState` adjusts what's exposed to any redux or `@gasket/data` state. This lets you consume private config values on the server but exclude them from being shipped to the browser.


#### 4. Update consumption property paths

In server-side code, config settings are now namespaced under `req.config.switchboard` rather than `req.config.appConfig`:

```diff
function someMiddleware(req, res, next) {
-  console.log(req.config.appConfig.someSetting);
+  console.log(req.config.switchboard.someSetting);
  next();
}
```

...and in the redux state, `appConfig` is changed to `switchboard` as well:

```diff
function someSelector(state) {
-  return state.config.appConfig.someSetting;
+  return state.config.switchboard.someSetting;
}
```

#### 5. Update usage of the client

If you are calling the appconfig client directly via `gasket.appConfigClient`, use `gasket.switchboard` instead to access the [`@switchboard/client`](https://github.com/gdcorp-uxp/switchboard-client/blob/main/node/config_client/docs/auto-generated/README.md) instance. Note that the interface is substantially different, so you'll have to reference the documentation.

#### 6. Replace unnecessary direct client usage

The appconfig plugin did not support reading config settings for multiple apps. As a workaround, many users are manually creating `@wsb/config-api-client` instances in their gasket apps. With `@godaddy/gasket-plugin-switchboard` you may now load config settings from multiple app sources:

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // ...
  ],
  switchboard: {
    apps: ['appA', 'appB']
  }
});
```

...and you can even be more specific and fetch a subset of settings:

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // ...
  ],
  switchboard: {
    apps: ['appA', 'appB'],
    appSettings: {
      appB: ['settingA', 'settingB']
    }
  }
});
```

#### <a id="hivemind-migration">7. Replace Hivemind split usage</a>

Hivemind splits are no-longer supported. The alternative approach is to create switchboard-based experiments in Hivemind. Then, to consume these experiments, specify the experiment IDs you wish to load under a special `@hivemind` app ID:

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // ...
  ],
  switchboard: {
    apps: ['your-app', '@hivemind'],
    appSettings: {
      '@hivemind': ['experimentA', 'experimentB']
    }
  }
});
```

This will make the cohort assignments and associated data available in the same place as other Switchboard settings. Under the key of the hivemind experiment IDs will be an object with a `cohortId` and `data` property. As with any other switchboard setting, this is accessible on the server or in redux state:

```javascript
function someMiddleware(req, res, next) {
  const { cohortId, data } = req.config.switchboard.experimentA;
  console.log('User is assigned to cohort', cohortId);
  res.locals.experimentData = data;
  next();
}
```

There is no support for split.io-based Hivemind experiments.

#### 8. Test deployment of update in containers

_The following may no-longer be necessary with versions `2.8.2` and later and may be removed after we've received confirmation._

The new Node.js switchboard client is based on a compiled native module built from Rust in order to reuse code across multiple programming languages. This compiled code is dependent on the OpenSSL 1.1 shared library being present.

At the time of this writing, MacOS users do not have to do anything; the library is already installed. For Linux users or those using WSL, you may have to install `libssl1.1` (Ubuntu) or `openssl1.1-compat` (Alpine) on your desktop environment or Docker images. For Windows users that are not using WSL, do the following:

1. Install [vcpkg](https://vcpkg.io/en/getting-started.html)
2. Run `vcpkg integrate install`
3. Run `vcpkg install --recurse openssl --triplet x64-windows-static-md`

<!-- Links -->

<!-- External Links -->
[switchboard-client]: https://github.com/gdcorp-uxp/switchboard-client/tree/main/node/config_client

## Migrating from `@godaddy/gasket-plugin-hivemind`

The `@godaddy/gasket-plugin-switchboard` plugin is not designed as a drop-in replacement for `@godaddy/gasket-plugin-hivemind`, but because Hivemind uses Switchboard under the covers, you can get the same functionality by using the `@godaddy/gasket-plugin-switchboard` plugin instead.

First off, here are the features that are _not_ supported in `@godaddy/gasket-plugin-switchboard` which you will be losing if you make the switch.

1. The switchboard plugin does not give you access to hivemind experiments that are built in split.io.
2. There is no support for bypassing hivemind for local development data in the switchboard plugin, so if you're using the `useLocal`, `overrides`, or `allowCookieOverrides` config settings of the hivemind plugin, you would have to discontinue usage.
3. The switchboard plugin does not support cohort allocations taking place in the browser; all cohort allocation is performed on the server.
4. The switchboard plugin doesn't support the concept of retrieving experiments for parameters. You can only retrieve by specific experiment IDs (settings in switchboard lingo) or labels.

If you're ok with these limitations, here's how to make the switch.

#### Update your gasket.js

Here's how to update your `gasket.js` from the hivemind plugin to the switchboard plugin:

```diff
+ import pluginSwitchboard from '@godaddy/gasket-plugin-switchboard';

- module.exports = {
-   plugins: {
-     add: [
-       '@godaddy/gasket-plugin-hivemind'
-     ]
-   },
-   hivemind: {
-     app: 'my-app',
-     sdkKey: getKeyFromSecretStore(),
-     experiments: ['experimentId1', 'experimentId2'],
-     labels: ['my-app'],
-     parameters: ['button_color'],
-     useLocal: true,
-     allowCookieOverrides: true,
-     customAttributes: { /* ... */ }
-   }
-   environments: {
-     local: {
-       hivemind: {
-         overrides: {
-           experimentId1: {
-             cohortId: 'treatmentA',
-             data: {
-               css: 'my-treatmentA-class'
-             }
-           }
-         }
-       }
-     }
-   }
- }

+ export default makeGasket({
+   plugins: [
+     pluginSwitchboard
+     {
+       name: 'hivemind-cookie-overrides',
+       hooks: {
+         switchboardPerRequestParams(gasket, defaultAttributes, { req }) {
+           const { parameters = {} } = JSON.parse(req.cookies.hivemind ?? '{}');
+           return {
+             ...defaultAttributes,
+             ...parameters
+           };
+         },
+         switchboardConfigOverride(gasket, defaultData, { req }) {
+           const { cohorts = {} } = JSON.parse(req.cookies.hivemind ?? '{}');
+           return {
+             ...defaultData,
+             hivemind: {
+               ...defaultData.hivemind,
+               ...cohorts
+             }
+           };
+         },
+       }
+     }
+   ],
+   switchboard: {
+     callingService: 'my-app',
+     auth: {
+       // See documentation
+     },
+     appSettings: {
+       '@hivemind': ['experimentId1', 'experimentId2']
+     },
+     appLabels: {
+       '@hivemind': ['my-app']
+     },
+     // parameters are not supported
+     enableRedux: true, // Required to enable access via redux
+     // allowCookieOverrides are not supported; see custom plugin above
+   },
+   environments: {
+     local: {
+       switchboard: {
+         overrides: {
+           hivemind: {
+             experimentId1: {
+               cohortId: 'treatmentA',
+               data: {
+                 css: 'my-treatmentA-class'
+               }
+             }
+           }
+         }
+       }
+     }
+   }
+ });
```

#### Update redux state references

Whereas the hivemind plugin required setting up a reducer for a top-level `hivemind` state property in your redux store, the switchboard plugin places its data in a `config.switchboard` property of the redux state. This means you can remove your `hivemind` reducer, and any selectors will have to be modified.

```diff
-const cohort = useSelector(state => state.hivemind.experiment1.cohortId);
+const cohort = useSelector(state => state.config.switchboard.experiment1.cohortId);
```

#### Update access via middleware

Similarly, attachment of hivemind data to the request/response objects for access in middleware is different, and you'll also want to make sure you adjust any timings in your middleware relative to the hivemind plugin so that they're relative to the switchboard plugin. For example, in a plugins `middleware` hook:

```diff
export default {
  timing: {
-    after: ['@godaddy/gasket-plugin-hivemind']
+    after: ['@godaddy/gasket-plugin-switchboard']
  },
  handler: () => [
    (req, res, next) => {
-      const cohort = res.locals.hivemind.experiment2.cohortId;
+      const cohort = req.config.switchboard.experiment2.cohortId;
      next();
    }
  ]
}
```

#### Update custom attribute lifecycles

The equivalent of the `hivemindCohortAttributes` lifecycle is `switchboardPerRequestParams`. Besides the change of name, they are identical in behavior.

```diff
export default function switchboardPerRequestParams(gasket, defaultAttributes, { req, res }) {
  return {
    ...defaultAttributes,
    isNewUser: isNewUser(req)
  };
}
```

[gasketData]: https://gasket.dev/docs/modules/data/
[useGasketData]: https://gasket.dev/docs/modules/nextjs/#usegasketdata
[@gasket/plugin-data]: https://gasket.dev/docs/plugins/plugin-data/
