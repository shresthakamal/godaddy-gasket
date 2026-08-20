# @godaddy/gasket-plugin-hcs

Gasket plugin for creating Header Content Services. React components used for
rendering content are available from [@godaddy/gasket-hcs].
Uses node 20

## Installation

This plugin is included with [@godaddy/gasket-preset-hcs].

## Create an HCS
```bash
create-gasket-app APPNAME --presets=@godaddy/gasket-preset-hcs
# APPNAME  is the name of the gasket application to create
```

### Output
After running `create-gasket-app`, your new HCS will have the following boilerplate files in addition to the default gasket files:
- `components/header.js`
  -  React Component to render the Header. This component must be present, but may return null if no header is required. Header will have a wrapping WithManifest and HeaderComponent will not.
- `components/footer.js`
  -  React Component to render the Footer. This component must be present, but may return null if no footer is required. Footer will have a wrapping WithManifest and FooterComponent will not.
- `mocha/test/header-footer.test.js` or `jest/test/jest.config.js` depending which test library is chosen
- `public/locales/en-US.json`
  - this json file is used to store strings for translation

### gasket.js
Your gasket config file will have an `environments` object for HCS specific config.
Initial values are defined in the [create.js](./lib/create.js) file.

Here is a sample `environments` object:
```js
    environments: {
        local: {
            hcs: {
                pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1', // base url for server side data
                pcsOverrideQuery: { // additional query params for pcsUrl
                    appdata: false
                },
                // cachingModule - defaults to the 'memory' caching module
                defaultCacheMaxAge: 0,
                devMode: true,
                enableBundleAnalyzer: false,
                webpackDevServer: {
                    port: 9212,
                    host: 'localhost',
                },
                removeManifest: true,
            }
        },
        development: {
            hcs: {
                pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1',
                pcsOverrideQuery: {
                    appdata: false
                },
                defaultCacheMaxAge: 600,
                localesOverride: ['en-US'],
                removeManifest: true,
            }
        },
        test: {
            hcs: { ... }
        },
        production: {
            hcs: { ... }
        }
    }
```
  #### Out of Band Caching
The HCS plugin supports out of band caching to improve performance. This cache allows calls to PCS to be non-blocking, meaning that the cache value will refresh in the background. To enable this feature, you need to set the `useOutOfBandCache` flag to `true` in your `gasket.config.js` file. You can also configure various caching parameters at the top level of the `hcs` object.

  Below is an example configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  hcs: {
    useOutOfBandCache: true, // Enable out of band caching
    fsCachePath: 'desired path', // Path for file system cache
    maxAge: 600, // Maximum age for cache entries in seconds
    maxStaleness: 6000, // Maximum staleness for cache entries in seconds
    memoryCacheMax: 1000 // Maximum number of entries in memory cache
  }
});
```

## Run HCS locally

1) Specify the port in `gasket.config.http`
2) Run `npm run local`
3) The hydra response will then be available at `http://localhost:port/v3/:appId`
    - appId is the app code registered with app-data-service
    - port is the port from `gasket.config.http`

## Warehouse (`wrhs`) configuration

The `wrhs` block in `gasket.js` controls how the plugin connects to Warehouse and publishes assets.

```js
// gasket.js
import os from 'os';
import path from 'path';
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  wrhs: {
    // --- Connection (required) ---
    baseUrl:  process.env.WRHS_ENDPOINT,  // Warehouse API base URL
    username: process.env.WRHS_USERNAME,  // Warehouse credentials
    password: process.env.WRHS_PASSWORD,

    // --- Variant rollout (optional) ---
    variant: process.env.WRHS_VARIANT,    // Named build variant, e.g. 'beta' or 'experiment-123'
                                          // Falls back to '_default' if not set or variant not found

    // --- Publish (optional) ---
    expiry:           process.env.WRHS_EXPIRY,           // When this variant expires, e.g. '30d' string, or an ISO date string
    mustIncludeFiles: ['my-header.js', 'my-header.css'], // Throw if these are missing from the build
    excludeFiles:     ['symbol-*', '*.gz', '*.br', '*.map'],      // Glob patterns for files to skip during upload

    // --- Caching (optional) ---
    fsCachePath: path.join(os.tmpdir(), '.wrhs-cache'),  // Where to store the on-disk response cache
                                                          // Defaults to <root>/.wrhs-cache
  }
});
```

### Field reference

| Field | Required | Description |
|---|---|---|
| `baseUrl` | Yes | Warehouse API endpoint. Falls back to `WRHS_ENDPOINT` env var. |
| `username` | Yes | Warehouse username. Falls back to `WRHS_USERNAME` env var. |
| `password` | Yes | Warehouse password. Falls back to `WRHS_PASSWORD` env var. |
| `variant` | No | Build variant to request (e.g. `beta`). The plugin always requests `[variant, '_default']` so there is a safe fallback. |
| `expiry` | No | Expiration value passed through to Warehouse when publishing (the plugin does not parse/validate this value). |
| `mustIncludeFiles` | No | List of filenames that must exist in the build directory before publishing. Throws an error if any are missing. |
| `excludeFiles` | No | Glob patterns for files to leave out of the Warehouse upload tarball (in addition to server bundles like `**/*.server.js*` and `**/*.server.cjs*`). |
| `fsCachePath` | No | File system path for caching Warehouse responses between server restarts. Defaults to `<root>/.wrhs-cache`. |

### Excluding chunks from asset registration

Some apps bundle assets (e.g. SVG icon sprites) that handle their own URL resolution at runtime. These must not be registered via `addChunk` or they will be loaded from the wrong location. Use `hcs.excludeChunks` to skip them by name using glob patterns:

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  hcs: {
    excludeChunks: ['symbol-*'] // skip all chunks whose name starts with 'symbol-'
  }
});
```

Patterns are matched against the chunk filename without the `.js` extension. Exact names, prefix globs (`symbol-*`), suffix globs (`*-icons`), and single-character wildcards (`icon-?`) are all supported.

## Publish

The HCS plugin provides a `hcs-publish` Gasket command that copies your client-side build to a staging directory, uploads it as a tarball to [Warehouse], and optionally sets the head version.

```
gasket hcs-publish
```

#### Setting the head version

By default `hcs-publish` uploads and registers the asset but does not set it as the active head in Warehouse. Pass `--setHead` when you are ready for this version to go live:

```
gasket hcs-publish --setHead
```

#### What gets uploaded

The command copies the `build/` directory to a temporary `build-wrhs/` directory, excluding server-side bundles (`*.server.js`, `*.server.cjs`) automatically. Use `wrhs.excludeFiles` in `gasket.js` to exclude additional files (e.g. compressed files or icon sprites):

```
wrhs.excludeFiles: ['symbol-*', '*.gz', '*.br']
```

Use `wrhs.mustIncludeFiles` to assert that key output files exist before the upload starts — the command will throw if any are missing:

```
wrhs.mustIncludeFiles: ['my-header.js', 'my-header.css']
```

See the [Warehouse config reference](#field-reference) for the full list of `wrhs` options.

> Note: make sure that you are [onboarded to Warehouse][warehouse-onboard] and config is
> setup for the CLI. Reach out over Slack to `#uxp-warehouse-onboard` for more information.

## Lifecycles

### hcsProps

Your HCS will call the Platform Content Service (PCS) for platform data such as common props needed on all headers. By
default, these props will be passed down to both the header and footer React components in your HCS. You may add or
override these props as needed using the `hcsProps` lifecycle.

Props may be added/overridden for the header, footer, or both. The lifecycle is async, so you may do asynchronous
actions such as network requests or disk access to produce your props. Common uses include calling external APIs to
load data and then passing those in via props. Props must be serializable to JSON as they will be returned as part of
the header response payload and used during browser-side hydration of the header and footer React components.

This lifecycle receives the Express `request` object as a parameter. This allows using request parameters, headers, and objects added by Gasket plugins, like `@godaddy/gasket-plugin-switchboard` for example, when generating props.

To use this lifecycle, add a `plugins` folder to the root of your HCS if one does not already exist and then create
a `hcs-props-plugin.js` file within. Use the template below to get started:

```js
// hcs-props-plugin.js

export default {
  name: 'hcs-props-plugin',
  hooks: {
  /**
   * @typedef {import('@gasket/core')} Gasket
   */
  /**
   * @typedef {{ header: Object, footer: Object, [key: string]: any }} Props
   * @prop {Object} [header] Props that are only needed on the header
   * @prop {Object} [footer] Props that are only needed on the footer
   */
  /**
   * Augment/transform props for header and footer
   *
   * @param {Gasket} gasket Gasket object
   * @param {Readonly<Object>} existingProps Readonly existing props
   * @param {import('express').Request} req Request object
   * @returns {Promise<Object>} Props to add or merge
   */
  async hcsProps(gasket, existingProps, req) {
    return {
      // Fields within the `header` object will only be passed to the Header React component
      header: {
        myHeaderProp: 'some value'
      },
      // Fields within the `footer` object will only be passed to the Footer React component
      footer: {
        myFooterProp: await getFooterPropValue(existingProps.market) // async calls are allowed
      },
      // Any other fields will be passed to both Header and Footer
      mySharedProp: 'yet another value',
      // Props will be deep merged onto the base props, so you may override existing values if needed
      urls: {
        account: {
          href: 'https://someotheraccount.godaddy.com'
        }
      }
    }
  }
};
```

### wrhsPackageRequests

Specify assets that need to be fetched from warehouse.

The default `ttl` is 10 minutes. To Skip caching of warehouse requests, you can set the `ttl` to `0`.
To cache indefinitely you can set the `ttl` to `-1`.

The plugin will fetch all packages returned from `wrhsPackageRequests` lifecycle from warehouse.

By default, the plugin also appends the base HCS package to the warehouse requests after any results from the `wrhsPackageRequests` lifecycle. It uses the name and version from `package.json`, and derives `acceptedVariants` from the optional `gasket.config.wrhs.variant` param. This behavior can be bypassed by setting `defaultWrhsPackageRequest: false` in `gasket.config.hcs`.
The HCS base packages are not added to the warehouse requests for local runs.

```js
/**
 * @typedef {Object} WrhsObjectRequest
 * @property {string} name Name of the package
 * @property {string} [env] Environment
 * @property {string} version Version
 * @property {string[]} acceptedVariants List of variants
 * @property {number} [ttl] Time in milliseconds that the package response should be cached for
 */
export default {
  name: 'wrhs-plugin',
  hooks: {
  /**
   * Returns a list of assets that needs to be fetched from warehouse.
   * @param {Gasket} gasket Gasket instance
   * @param {Object} context Lifecyle context
   * @param {Object} context.params Params from the HCS call
   * @param {string} context.locale Requested locale
   * @returns {Promise<WrhsObjectRequest[]>} List of requests
   */
    async wrhsPackageRequests(gasket, { params, locale }) {
      return [{
        name: '@org/package',
        env: 'test',
        version: '1.0.0',
        acceptedVariants: ['fr-FR', 'en-US']
      }];
    }
  }
};
```

##### File-System cache path for wrhs package requests

By default the package request file system cache will be maintained at the root directory as specified in `gasket.config.root`.
This can be configured by specifying a `fsCachePath` under `wrhs` in gasket config as shown below:

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  wrhs: {
    fsCachePath: path.join(os.tmpdir(), '.wrhs-cache')
  }
});

```

### hcsHints

Your HCS might need to add hint tags to the manifest. Hints are used to prefetch or preload assets for performance. `hcsHints`
provides access to the [assetManager](./lib/asset-manager/asset-manager.js) as well as packages from [warehouse] to assist with
this.

To use this lifecycle, add a `plugins` folder to the root of your HCS if one does not already exist and then create
a `hcs-hints-plugin.js` file within. See a minimal example below.

```js
// hcs-hints-plugin.js
export default {
  name: 'hcs-hints-plugin',
  hooks: {
  /**
   * Process application scripts.
   * @param {Gasket} gasket Gasket instance
   * @param {AssetManager} assetManager Asset manager instance with addPrefetchHint,
      addDnsPrefetchHint,
      addPreconnectHint,
      addJsPreloadHint,
      addCssPreloadHint,
      addFontPreloadHint
  * @param {Object.<string, WrhsData>} packages Warehouse packages
  * @param {Object} props Combined HCS and PCS manifest React render props
  * @param {Object} params HCS request parameters
  * @returns {void}
  */
    hcsHints(gasket, assetManager, packages, props, params) {
        const pkg = packages['@ux/my-package'];
        pkg.files.forEach(file => {
          if (file.url.endsWith('.js'))
            assetManager.addJsPreloadHint({ href: file.url });
          else if (file.url.endsWith('.css'))
            assetManager.addCssPreloadHint({ href: file.url }, { prepend: true }); // Prepend CSS hint to existing hints
        });
    };
  }
};
```

### hcsScripts
By default, the HCS plugin will add scripts to the manifest, including a script to load the combined header/footer asset from warehouse.

The minimal example below summarizes how these default additions are made.

```js
// hcs-scripts-plugin.js
export default {
  name: 'hcs-scripts-plugin',
  hooks: {
  /**
   * Process application scripts.
   * @param {Gasket} gasket Gasket instance
   * @param {AssetManager} assetManager Asset manager instance with addInlineScript, addScript, addChunk
   * @param {Object.<string, WrhsData>} packages Warehouse packages
   * @param {Object} props Combined HCS and PCS manifest React render props
   * @param {Object} params HCS request parameters
   * @returns {void}
   */
    hcsScripts(gasket, assetManager, packages, props, params) {
        const pkg = packages['@ux/my-package'];
        findChunks(pkg)
        pkg.files.forEach({ url, metadata, name } => {
          if (url.endsWith('.js')) {
            // warehouse allows us to store arbitrary metadata along with a build. in this case: `isChunk`
            if (metadata.isChunk) {
              assetManager.addChunk({ name, src: url })
            } else {
              assetManager.addScript({ src: url }, { prepend: metadata.bootstrap }); // Prepend JS to existing JS assets
            }
          }
        });
    }
  }
};
```

An HCS may hook the `hcsScripts` lifecycle to perform further actions with the asset manager instance or the packages from [warehouse]. Props and params are also made available to this lifecycle.

To use this lifecycle, add a `plugins` folder to the root of your HCS if one does not already exist and then create a `hcs-scripts-plugin.js` file within.

The plugin accepts `hcs.defaultHcsScripts: false` in `gasket.js` to bypass the default script additions. In such a case, the HCS is responsible for hooking the `hcsScripts` lifecycle.

### hcsCss
Your HCS might need to add style tags to the manifest.
`hcsCss` provides access to the [assetManager] as well as packages from [warehouse] to assist with this.

To use this lifecycle, add a `lifecycles` folder to the root of your HCS if one does not already exist and then create
a `hcs-css.js` file within. See a minimal example below.

```js
// hcs-css-plugin.js
export default {
  name: 'hcs-css-plugin',
  hooks: {
  /**
   * Process application scripts.
   * @param {Gasket} gasket Gasket instance
   * @param {AssetManager} assetManager Asset manager instance with addInlineCss, addCss, addInlineFontCss
   * @param {Object.<string, WrhsData>} packages Warehouse packages
   * @param {Object} props Combined HCS and PCS manifest React render props
   * @param {Object} params HCS request parameters
   * @returns {void}
   */
    hcsCss(gasket, assetManager, packages, props, params) {
        assetManager.addInlineCss(`body { background-color: lightblue; }
          h1 {
            color: navy;
            margin-left: 20px;
          } `
        );
        assetManager.addCss({ href: 'cdn url for css asset' });
    }
  }
};
```

### hcsParams
In certain cases, an HCS may need to mutate the parameters it receives before they are used in the request to the
Platform Content Service (PCS). The `hcsParams` lifecycle allows such mutation.

To use this lifecycle, add a `plugins` folder to the root of your HCS if one does not already exist and then create
a `hcs-params-plugins.js` file within. See the minimal example below:

```js
// hcs-params-plugin.js
export default {
  name: 'hcs-params-plugin',
  hooks: {
  /**
   * Process application scripts.
   * @param {Gasket} gasket Gasket instance
   * @param {Record<string, string>} params Path and query string parameters originally passed to the HCS
   * @returns {Record<string, string> | Promise<Record<string, string>>}
   */
    hcsParams(gasket, params) {
        // Default the `foo` parameter to false for this HCS
        if (!('foo' in params)) {
          params.foo = false;
        }
        return params;
    }
  }
};
```

## Actions

### getAppsClient

This action returns an instance of [`@ux/apps`](https://github.com/gdcorp-uxp/apps) that can be used to access app registration data.

```js
async function fetchSomeAppData(gasket, req) {
  return new Promise(resolve => {
    gasket.actions.getAppsClient().get({ key: req.params.appKey, market: req.query.market }, function (error, app) {
      if (error || !app) {
        gasket.logger.error(`Failed to get app data for ${ req.params.appKey } ${ error ? error : '' }`);
        return resolve(null);
      }
      resolve(app.getExternalKey('ventureRedirector'));
    });
  });
}
```

## Asset manager
The asset manager contains methods grouped by lifecycle to help manage assets. These methods are used inside lifecycles
to create and add assets.
For example `hintMethods`, `scriptMethods`, and `cssMethods`.

## i18n

This plugin also requires that you install the `@gasket/plugin-intl` plugin.
`@gasket/plugin-intl` is included in the `@godaddy/gasket-preset-hcs` preset.

Any locale specific json files will need to be in the `public/locales` directory
that is generated from this plugin. [Example translation files]

## PCS integration

This plugin provides some functionality for configuring the HCS's interactions with the Platform Content Service. Currently, the v1 REST API of the PCS is supported for providing platform content to an HCS. The plugin creates some generic configuration in `environments[env].hcs` of [`gasket.js`](###gasket.js).

### Setting the PCS host
The plugin sets the default value for `environments[env].hcs.pcsUrl` to `https://pcs-<env>.uxp.godaddy.com/v1`. If the HCS shares a cluster with the PCS, the `PCS_HOST` environment variable may be set to `http://pcs.pcs.svc.cluster.local:8080/v1` (the cluster local address of the PCS) via the Helm chart. If present, it will override the value in `gasket.js` to avoid DNS-related performance costs. For example, this is done in the [application sidebar](https://github.com/gdcorp-uxp/application-sidebar/blob/80c8ce/chart/config/development.yaml#L5).

### Setting PCS query parameters
Entries added to the `environments[env].hcs.pcsOverrideQuery` object are merged into the query parameters of the PCS request.

Currently, the main parameter of note is `appdata: false`, which prevents the PCS from making a request to the App Data Service. While ADS is slow due to on-prem infrastructure, use this parameter for a faster uncached PCS response if the HCS does not require the following props: `appName, resolvedKey`, custom polyfills, prefetch/preload hints.

See [PCS documentation] for further details on this API.

[@godaddy/gasket-preset-hcs]:/packages/gasket-preset-hcs/README.md
[@godaddy/gasket-hcs]:/packages/gasket-hcs/README.md
[PCS documentation]: https://github.com/gdcorp-uxp/platform-content-service/blob/master/README.md
[Warehouse]: https://github.com/godaddy/warehouse.ai/
[warehouse-onboard]: https://github.com/godaddy/warehouse.ai/blob/master/QUICKSTART.md#configuring-the-cli
[Example translation files]: https://github.com/gdcorp-uxp/application-sidebar/tree/master/public/locales
