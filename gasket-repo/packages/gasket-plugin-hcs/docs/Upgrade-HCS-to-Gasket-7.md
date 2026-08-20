# Upgrade Guide for upgrading an HCS from Gasket 6 to Gasket 7.

### Notes

- Refer to the [Internal Gasket Upgrade Guide]
- Refer to the [Public Gasket Upgrade Guide]
- Refer to the [No Header HCS Upgrade PR] or [Application Header Upgrade PR] (the app header is a bit more complex)

## Update Dependencies

- Update all `@godaddy/gasket` and `@gasket/` scoped packages.

## Remove the `gasket.config.js` and add a new `gasket.js`

Follow the pattern in the No Header PR linked above. The main change is that the plugins need to be explicitly imported and instead of returning just an object, it returns the `makeGasket` function invocation.

## Important changes in the new `gasket.js`

- Under `local` config, remove `devMode`
- Remove `webpackDevServer` configuration
- Update paths for switchboard `fallbackFileCache` to use `path.resolve`
- Add intl changes (see detailed section below)

> NOTE: As part of the migration, the webpack dev server is going away. We serve the built local files through the main application server at the `/static` path instead.

## Convert all lifecycles such as `hcsProps` and `switchboardPerRequestParams` to plugins.

Example:

```js
// plugins/hcs-props.js
const pluginHCSProps = {
    name: 'hcs-props',
    hooks: {
        async hcsProps(gasket, existingProps, req) {
            const switchboardConfig = await gasket.actions.getSwitchboardConfig(req);

            return {
                ...existingProps,
                features: {
                    ...switchboardConfig
                }
            };
        }
    }
};

export default pluginHCSProps;
```

And then import this plugin in `gasket.js`

```js
// gasket.js
import pluginHCSProps from './plugins/hcs-props.js';

export default makeGasket({
  plugins: [
    ... other plugins
    pluginHCSProps,
  ],
  ... other config
})

```

Any other existing lifecycles should be converted to plugins following the structure from above.

## Remove the `webpack-config` lifecycle. We do not need an equivalent local plugin for this one.

## Remove the `express` lifecycle which is exposing a default route at `/` for Katana (this has been migrated inside the `gasket-plugin-hcs`)

## Create a new `server.js` at the root.

With the following content:

```js
// server.js
import gasket from './gasket.js';

gasket.actions.startServer();
```

## Update `elastic-apm.js`

Follow the [No Header HCS Upgrade PR] to change the elastic-apm js file

## Changes for the `package.json`

- Add `"type": "module"`

- Make the following changes to the `scripts` in package json:

```diff
-   "build": "gasket build",
-   "start": "gasket start --require ./elastic-apm.js",
-   "local": ". ./bin/load-secrets && LOCAL=true gasket local",
+   "build": "node ./gasket.js build",
+   "build:local": "GASKET_ENV=local LOCAL=true node ./gasket.js build",
+   "start": "NODE_OPTIONS=--import=./elastic-apm.js node server.js",
+   "start:local": "GASKET_ENV=local node ./server.js",
+   "local": ". ./bin/load-secrets && LOCAL=true GASKET_DEV=1 nodemon server.js",
```

```diff
-   "test:all": "mocha --require setup-env test/*.{js,jsx}",
+   "test:all": "mocha -r setup-env -r ./test/register-loader.js --recursive \"test/**/*.{test,spec}.{js,jsx}\"",
```

```diff
-   "hcs-publish": "gasket hcs-publish"
```

### Optional - replace elastic-apm with gasket-otel

Follow the relevant changes from [Replace elastic-apm with gasket-otel in no-header].
In short, do the following:
- add `@godaddy/gasket-otel` and `@godaddy/gasket-plugin-otel` as dependencies.
- remove `elastic-apm-node` as dependency.
- delete the `elastic-apm.js` file in root.
- create a new `setup.js` (refer to the PR above)
- import and add the plugin in the `gasket.js`
- change the `start` script in the `package.json` to `NODE_OPTIONS='--import ./setup.js' node server.js`

## Changes for Intl

Refer to https://gasket.dev/docs/modules/intl/ and https://gasket.dev/docs/plugins/plugin-intl/ for more details.

#### Move all locale files from `public/locales/*.json` to `locales/*.json`

No changes are needed for the files, just move them to root.
Make sure you update the `manifest.xml` for GoLF checkins to keep working.

#### Add intl dependencies in `package.json`

- `@gasket/intl`
- `@gasket/plugin-intl`

#### Add intl plugin in `gasket.js`

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
+ import pluginIntl from '@gasket/plugin-intl';

export default makeGasket({
  plugins: [
+    pluginIntl
  ],
+  intl: {
+    experimentalImportAttributes: true,
+    locales: ['ar', 'da', 'de', ...all other locales that present ],
+    defaultLocale: 'en-US'
+ }
})
```

After making these changes when you run `npm run build` it will generate a new `intl.js` in the root of the project. You should commit that file to git.

## Change how we run the `hcs-publish` command in the `Dockerfile`

```diff
-   npm run hcs-publish -- --env=${WRHS_ENV}; \
+   GASKET_ENV=${WRHS_ENV} node gasket.js hcs-publish; \
```

## Rename `.eslintrc.js` and `babel.config.js` to `.cjs` 

## IMPORTANT in the deployed environment a `GASKET_ENV` variable is required

If deployed on Katana, you can add it directly from the Katana UI. The variable value should match the deployment environment name (for example, `development`, `test`, or `production`).


[Public Gasket Upgrade Guide]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-7.md
[Internal Gasket Upgrade Guide]: https://github.com/gdcorp-uxp/gasket/blob/main/docs/upgrade-to-7.md
[No Header HCS Upgrade PR]: https://github.com/gdcorp-uxp/no-header/pull/175
[Application Header Upgrade PR]: https://github.com/gdcorp-uxp/application-header/pull/268
[Replace elastic-apm with gasket-otel in no-header]: https://github.com/gdcorp-uxp/no-header/pull/184/changes