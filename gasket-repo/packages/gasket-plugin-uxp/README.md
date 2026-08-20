# @godaddy/gasket-plugin-uxp

Adds UX Platform support to your gasket application. Covers Presentation
Central & UXCore2.

## Guides

- [White Labeling] for Resellers
- [CSS Imports] for distributed styles
- [RTL CSS] for right-to-left languages

## Installation

This plugin is already included by [@godaddy/gasket-preset-webapp]. The
following steps are only necessary if that preset is not used.

#### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-uxp
```

#### Existing apps

```
npm i @godaddy/gasket-plugin-uxp
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginUxp from '@godaddy/gasket-plugin-uxp';

export default makeGasket({
  plugins: [
+   pluginUxp
  ]
});
```

## Configuration

### UXCore2 webpack configuration

The `webpack` capabilities provided by this plugin are added into any existing
`webpack` property inside of the Gasket config.
By default, externals will be added for `react` and `react-dom` to which allows
sharing these chunks across apps from the UXP CDN.
For React 18 apps, `react/jsx-runtime` is bundled from `node_modules` instead of
externalized; React 19 apps use the full `@ux/react-bundle` externals (detected
at configure time).
In some cases, such as when using [Next.js App Router], it may become necessary
for your app to bundle React.
To do this, you can set `uxp.externals` to `false` in your `gasket.js`.

When `gasket.config.turbopack` is `true` (set via
`makeGasket({ turbopack: true })`), this plugin's `nextConfig` hook adds
`@godaddy/gasket-plugin-uxp` and `@ux/presentation-central` to Next.js'
`serverExternalPackages` — mirroring the externalization its `webpackConfig`
hook applies on the Webpack side.

```js
// gasket.js
export default makeGasket({
  // ...
  uxp: {
    externals: false
  }
});
```

### Presentation Central

You can set a `presentationCentral` object with properties in the Gasket config.
The object can contain any [Presentation Central API options][pc-options]
with some defaults in place as noted:

- `fsCachePath`: Enable persisting cache to disk by default so reboots do not
  need refresh data, but can use cache from disk. This is pre-configured to
  store it in a `presentation-central-cache` folder in `os.tmpdir()`.
- `env`: The environment that we need to run in, defaults to the derivative of
  the Gasket runtime environment.
- `version`: Which API version of presentation-central we should use, defaults
  to `3.0`.
- `disableRTL`: Set this property to `true` if you wish to manually override and
  disable RTL for all markets. Setting this property to any other value will
  have no effect.
- `timeout`: Maximum time we allow a presentation-central request to take,
  defaults to `10 seconds` ¹.
- `maxStaleness`: maxStaleness + maxAge is the maximum age of a single cache
  item that we are allowed to use. It defaults to `5 minutes` ¹.
- `maxAge`: Max age of presentation-central response before it should
  automatically refresh, defaults to `30 minutes` ¹.
- `memoryCacheMax`: Maximum number of presentation central responses to store in
  the memory cache. Defaults to `1000`.
- `pcStuntDoubleUrl`: The URL to use for an alternate HCS to test with.
- `params`: Any [Presentation Central API params][pc-params] with these
  defaults in place:
  - `manifest`: Which type of header do we want to request.
    by default,
    defaults to `application-header`, or `internal-header` when hostname is
    gdcorp.tools.
  - `stuntDouble`: Use the `pcStuntDoubleUrl` from the parent `presentationCentral` config.
  - `theme`: Use to force a particular theme. e.g. `go-dark:brand` for internal apps.
  - `app`: The name of your app that is known by the UXPlatform team.
    This defaults to the `name` property in your `package.json`.
  - `deferjs`: Use defer attributed so that scripts execute after the document
    has been parsed which benefits first content paint. Defaults to `true`.
  - `uxcore`: The version of UXCore2 to bundle to fetch. This is a legacy option
    as apps are now expected to bundle UXCore themselves. Defaults to `false`.
  - `tealium`: Specifying this parameter to `false` disables the Tealium tracking.
  - `traffic`: Specifying this parameter to `disable` disables the Traffic tracking.
    It also would make sense to not include or remove the
    `@godaddy/gasket-plugin-traffic` gasket plugin if `traffic` is disabled.
  - `react`: The version of React we're using, this is auto detected.

**¹** The value is processed by the [millisecond]
module which can transform human readable such as `10 min`, `2 minutes`,
`10 d`, `10 days` in to their millisecond equivalents. These values are
easier to read than `1814400000` which is `3 weeks`. But you can still
supply a numeric value instead of the human-readable string.

```js
// gasket.js
export default makeGasket({
  // ...
  presentationCentral: {
    // required config properties:
    params: {
      app: 'my-app',
      manifest: 'internal-header'
    },
    // optional examples:
    maxAge: '2 hours' // Automatically gets transformed to 7,200,000ms
  }
});
```

### Presentation Central V2 API

While it is encouraged to use the V3 API, the V2 API is still supported and
necessary for sales-header based manifests at this time.

To use version 2 of the Presentation Central API, set the `version` property to
`2.0` in your Gasket config, and use the `header` property instead of `manifest`.

```diff
// gasket.js
export default makeGasket({
  // ...
  presentationCentral: {
+    version: '2.0',
    params: {
      app: 'my-app',
-      manifest: 'internal-header'
+      header: 'internal-header'
    }
  }
});
````

Most of the version 3 API config options are available in the version 2 API.
Notable exceptions include `deferjs` which is not available.

### `partners-header` support

If you want your app to use the Partners Sidebar (`partners-header`) when the
shopper is opted into the partners experience (determined by the `info_idp`
cookie's `pcx` prop), just simply set the
`gasket.config.presentationCentral.enablePartnersHeaderOverride` to `true`:

```js
// gasket.js
export default makeGasket({
  // ...
  presentationCentral: {
    enablePartnersHeaderOverride: true
  }
});
```

## Lifecycles

By default we fetch headers with the data that you specified in the
`gasket.js`, but you might need to dynamically introduce params for
requests based on the requirements of your app, for those use-cases we also
introduced a new lifecycle method: `presentationCentral`.

### presentationCentral

This lifecycle method is called every time a request is made with
PresentationCentral. You can use this to modify the params sent for a request.

```js
// gasket-plugin-example.js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    presentationCentral: async function (gasket, params, context) {
      const { req } = context;
      params.navigation = await fetchNavigation(req.url);
      params.privateLabel = 3490;
      params.market = 'nl-NL';
    }
  }
}
```

### headerContent

Although uncommon, if your app or plugin needs to provide custom header
content, or adjust what PresentationCentral returns, then this lifecycle method
can be hooked.

```js
// gasket-plugin-example.js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    headerContent: async function (gasket, content, context) {
      const { req } = context;
      return {
        ...content,
        data: {
          ...content.data,
          css: [
            content.data.css,
            '<link rel=\"stylesheet\" href=\"https://cdn.com/some/fancy.css\" media=\"all\"/>'
          ].join('')
        }
      }
    }
  }
}
```

## Actions

### getPresentationCentral

This action is used to retrieve the PresentationCentral data for the current
request.
It is used internally by [@godaddy/gasket-next] to fetch the header manifest,
but the action call also be used by other plugins or your app to fetch the data.

```js
// gasket-plugin-example.js

export default {
  name: 'gasket-plugin-example',
  actions: {
    async middleware(gasket, context) {
      return async function exampleMiddleware(req, res, next) {
        const content = await gasket.actions.getPresentationCentral(req);
        req.pc = content.data;
        req.pcMeta = content.meta;
        next();
      }
    }
  }
}
```

## Custom clients

If you are using an alternative header content client to PresentationCentral,
you can disable it with `presentationCentral.disabled`:

```js
// gasket-plugin-example.js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    configure: function (gasket, config) {
      return {
        ...config,
        presentationCentral: {
          disabled: true
        }
      }
    },
    headerContent: async function (gasket, content, context) {
      try {
        const { data, meta } = customClient.fetchContent(context);
        return {
          data,
          meta
        }
      } catch (error) {
        return {
          error
        }
      }
    }
  }
}
```

### Content signature

The content signatures can vary depending on if your app is using the v2 or v3
PresentationCentral API. For custom clients, you will want to follow the v2
signature below. Each string value is the html part you want rendered, such as
links for css, scripts for js, divs for header, etc.

```json5
{
  assets: {
    css: '',
    js: '',
    prefetch: '',
    preload: ''
  },
  header: '',
  footer: '',
  globals: '',
  loaders: ''
}
```

## RUM Data via Web Vitals

Learn more about [reporting RUM data with Web Vitals metrics](https://github.com/gdcorp-uxp/gasket/blob/main/packages/gasket-plugin-uxp/docs/web-vitals-rum.md).


[millisecond]: https://www.npmjs.com/package/millisecond
[pc-options]: https://github.com/gdcorp-uxp/presentation-central#presentationcentralopts
[pc-params]: https://github.com/gdcorp-uxp/presentation-central#api
[White Labeling]: docs/white-labeling.md
[CSS Imports]: docs/css-imports.md
[RTL CSS]: docs/rtl-css.md
[Next.js App Router]: /packages/gasket-next/README.md#app-router
[@godaddy/gasket-preset-webapp]:/packages/gasket-preset-webapp/README.md
[@godaddy/gasket-plugin-visitor]:/packages/gasket-plugin-visitor/README.md
