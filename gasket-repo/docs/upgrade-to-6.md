# Upgrade to v6/v2

> You can find the official upgrade guide for updating `@gasket/*` packages to
> `6.x` on the [Gasket Open Source Repo].
>
> Links to the individual sections can be found below.

This guide will take you through updating `@godaddy/gasket-*` packages to `2.x`.

## Upgrade Tool

The [gasket-upgrade tool] handles the majority of the steps below. Utilize the
upgrade tool, alongside the upgrade guides, when performing this upgrade for a
reference of changes.

## Update Dependency Versions

Update all `@godaddy/gasket-*` packages to the v2 major version.

You can find more details about updating dependencies in
the [generic upgrade guide].

This is not an exhaustive list, but rather a sampling of dependencies to
demonstrate what to look for:

```diff
// package.json

"dependencies": {
-    "@godaddy/gasket-auth": "^1.3.1",
+    "@godaddy/gasket-auth": "^2.0.0",
-    "@godaddy/gasket-plugin-assets": "^1.0.0",
+    "@godaddy/gasket-plugin-assets": "^2.0.0",
-    "@godaddy/gasket-preset-webapp": "^1.0.18",
+    "@godaddy/gasket-preset-webapp": "^2.0.0",
}
```

## [Gasket Data]

We have decoupled several plugins from Redux, and instead use GasketData, which
allows passing server rendered data to the browser.

- [@gasket/data]
- [How to Add to Gasket Data]
- [`public` Config Property]

## [Redux]

As described above, we've made efforts to decouple various plugins from Redux.
If your app is currently using Redux with the `@gasket/plugin-redux`, here are a
few areas you will need to upgrade.

- [Update store file]

If you have apps or plugins when add initial state using the
`initReduxState` lifecycle, then you will need to add [placeholder reducers]
for these properties.

## [Next.js]

We have made updates to align Gasket with the latest version of Next.js.

- [Updates for next-redux-wrapper]
- [Remove Support for `next-routes`]

### Static content in public/

For automatic [static file serving] by Next.js, it is now preferred to place
contents in a directory named `public/` instead of ~`static/`~. The
[gasket-upgrade tool] can handle renaming the directory, and most file
references, but be sure to test and double-check your code.

### Built-in CSS support

The UXP plugin will no longer set up the CSS/SCSS next plugins. Instead, you can
now utilize the new Next.js [built-in CSS support]. There are a couple of
changes required to migrate, but which will provide a performance optimization
to your apps.

Global styles, should still continue to be imported to `_app.js` as before.
However, now any CSS/SCSS files imported to specific pages or components should
include `.module` in the file name and follow the [CSS Modules structure].

```diff
// components/example.js
import React from 'react';
- import './example.scss';
+ import styles from './example.module.scss';
export default function Example() {
  return (
-    <div className='example-card'>
+    <div className={ styles.exampleCard }>
      This is my example content.
    </div>
  );
}
```

The [gasket-upgrade tool] can rename the style files and import for you.
However, it is up to you to adjust the CSS module class names in your style and
component code.

If you wish to continue to use global class names, you will need to simply
change your style imports to be included in the `_app.js` file.

### Custom Error Page

In recent Next.js versions, there is a new behavior where error pages are
prerendered, even when the `getInitialProps` function is present on
the `_app.js` file.

Therefore, new GoDaddy Gasket apps will be created with a
basic `pages/_error.js` file which implements getInitialProps to address this
change. Existing apps will need to create this file, either using
the [gasket-upgrade tool] or manually.

## [Fetch]

Gasket is no longer providing a browser ponyfill for the fetch API. If you are
supporting older browsers that don't have fetch, please bring your own polyfill.

## [Intl]

There are several changes to `@gasket/plugin-intl`. Unfortunately, some of these
may be breaking changes depending on how your app consumes the plugin. Here are
the potential adjustments required to upgrade this plugin.

- [Simplified deployments]
    - [Ignore generated manifest]
    - [Opt-in serving]
    - [eslintConfig Update]
- [Module Files]
    - [Ignore copied files]
- [Lifecycle name]
- [Config option names]
- [Decoupled from Redux]
    - [Loading messages]
    - [Selecting messages]

> NOTE: If you move your locale files to the `public/locales/` directory, be
> sure to update your translation location in GoLF.

### `@godaddy/gasket-cookies` Moved to Opt-In

The recommended approach moving forward for rendering React pages with cookie
data is to defer that content until a browser render, pulling from
`document.cookie`. If apps still want to use Redux to handle cookie data for
server and browser rendering, `@godaddy/gasket-cookies` will still be available
but require per-app configuration which has been added to the [usage docs].

_Impacted Plugins/Packages: `@godaddy/gasket-cookies`, `@godaddy/gasket-next`,
`@godaddy/gasket-plugin-uxp`_

## [Intl for React]

There are a few new features and improvements to the Gasket Intl package for
React. Here are the necessary changes to upgrade.

- [Package rename]
- [Simplified locale paths]
- [Next.js Initial Props]

## [Webpack 5]

Webpack 5 support is now available, and can be used with a few updates.

- [Removed Config Defaults]

## [Aligning Base Path Config]

Instead of using the zone config, we will now be using the basePath property, to
keep in alignment with Next.js.

## [Fallback Naming Removal]

Gasket no longer has fallback plugin/preset naming support.

## Helmet & CSP

We have renamed the `security` property in the `gasket.config.js` file to
`helmet`.

```diff
// gasket.config.js

module.exports = {
-  security: {
+  helmet: {
     crossDomain: { permittedPolicies: 'all' }
   }
}
```

### Content Security Policy

A default Content Security Policy is for available Gasket apps. There is an
ongoing effort to define GoDaddy's CSP policies. More details on remaining work
can be followed in this [JIRA Epic](https://jira.godaddy.com/browse/STGLS-469).

This is disabled by default currently, but can be enabled by removing this line
in the `gasket.config.js`:

```diff
// gasket.config.js

module.exports = {
   helmet: {
-    contentSecurityPolicy: false
   }
}
```

To learn more about configuring your helmet or content security policy settings,
check out the [`@godaddy/gasket-plugin-security` docs].

_Impacted Plugins/Packages: `@godaddy/gasket-plugin-security`_

## Private Label ID Type Normalization

We have normalized private label ID's across our platform to be numbers
exclusively. Please ensure that all private label ID's are numbers.

```diff
// example.js

results = await checkAuth({
   realm: idp,
-  plid: '5678'
+  plid: 5678 
});
```

## Bundling SVGs

We are no longer supporting `@godaddy/gasket-plugin-assets` with
`asset-provider`. Instead, you should use [SVGR] to transform your SVGs to React
components. Be sure to check out the [Dynamic Imports Guide] for some additional
tips on optimizing SVG loading and render in your app.

### React components

This is an example of using the [SVGR CLI] to transform your SVGs to React
components at development time.

```bash
npx @svgr/cli icons/clock-icon.svg
```

Be sure to review the [docs][SVGR CLI] to see all the CLI options.

Now in your consuming component, you can simply import the generated React
component.

```diff
// pages/example.js
- import Provider, { Asset } from 'asset-provider';
- import clockIcon from '../icons/ClockIcon.svg';
import ClockIcon from '../icons/ClockIcon'
 
export default function Example() {
  return (
-    <Provider uri='_next/static/bundle.svgs'>
      <div>
-        <Asset name={ clockIcon } width={ 100 } height={ 100 } />
+        <ClockIcon width={ 100 } height={ 100 } />
      </div>
-    </Provider>
  );
}
```

### Webpack loader

Another option, is to continue to import `.svg` files into your code and
transform them at build time with the [SVGR Webpack loader]. To configure it,
first install the loader:

```
npm install @svgr/webpack --save-dev
```

Then update your gasket.config as follows:

```diff
// gasket.config.js
module.exports = {
  plugins: {
    presets: ['@godaddy/webapp'],
    add: [
-      '@godaddy/assets'
    ]
  },
  webpack: {
    module: {
      rules: [
        { test: /\.svg$/, use: ['@svgr/webpack'] }
      ]
    }
  }
}
```

Now in your components, you can get rid of the asset provider bits but use your
imported '.svg' as if it were a React component.

```diff
// pages/example.js
- import Provider, { Asset } from 'asset-provider';
- import clockIcon from '../icons/ClockIcon.svg';
import ClockIcon from '../icons/ClockIcon.svg';
 
export default function Example() {
  return (
-    <Provider uri='_next/static/bundle.svgs'>
      <div>
-        <Asset name={ clockIcon } width={ 100 } height={ 100 } />
+        <ClockIcon width={ 100 } height={ 100 } />
      </div>
-    </Provider>
  );
}
```

## Lifecycle signature changes

### presentationCentral

This lifecycle was updated to pass a context object for future flexibility for
passing additional data. If your app or plugins hooks this lifecycle you may
need to adjust it.

```diff
// lifecycles/presentation-central.js
- module.exports = async function presentationCentral(gasket, params, req, res) {
+ module.exports = async function presentationCentral(gasket, params, context) {
+  const { req } = context;
  params.navigation = await fetchNavigation(req.url);
  params.privateLabel = 3490;
  params.market = 'nl-NL';
}
```

<!-- LINKS -->

[gasket-upgrade tool]: /packages/gasket-upgrade-cli/README.md
[usage docs]: /packages/gasket-cookies/README.md#usage
[generic upgrade guide]: /docs/upgrades.md#minor-and-patch-upgrades
[`@godaddy/gasket-plugin-security` docs]: /packages/gasket-plugin-security/README.md#configuration
[Dynamic Imports Guide]:/packages/gasket-plugin-uxp/docs/static-assets.md

[Gasket Open Source Repo]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md
[Aligning Base Path Config]:https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#aligning-base-path-config
[Gasket Data]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#gasket-data
[@gasket/data]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#gasketdata
[How to Add to Gasket Data]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#how-to-add-to-gasket-data
[`public` Config Property]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#public-config-property
[Redux]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#redux
[placeholder reducers]:https://github.com/godaddy/gasket/tree/main/packages/gasket-redux#example-initial-state
[Update store file]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#update-store-file
[Next.js]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#nextjs
[Updates for next-redux-wrapper]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#updates-for-next-redux-wrapper
[Remove Support for `next-routes`]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#remove-support-for-next-routes
[Fetch]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#fetch
[Intl]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#intl
[Simplified deployments]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#simplified-deployments
[Ignore generated manifest]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#ignore-generated-manifest
[Opt-in serving]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#opt-in-serving
[eslintConfig Update]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#eslintconfig-update
[Module Files]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#module-files
[Ignore copied files]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#ignore-copied-files
[Lifecycle name]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#lifecycle-name
[Config option names]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#config-option-names
[Decoupled from Redux]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#decoupled-from-redux
[Loading messages]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#loading-messages
[Selecting messages]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#selecting-messages
[Intl for React]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#intl-for-react
[Package rename]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#package-rename
[Simplified locale paths]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#simplified-locale-paths
[Next.js Initial Props]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#nextjs-initial-props
[Webpack 5]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#webpack-5
[Removed Config Defaults]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#removed-config-defaults
[Fallback Naming Removal]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-6.md#aligning-base-path-config

[static file serving]: https://nextjs.org/docs/basic-features/static-file-serving
[built-in CSS support]: https://nextjs.org/docs/basic-features/built-in-css-support
[CSS Modules structure]: https://nextjs.org/docs/basic-features/built-in-css-support#adding-component-level-css
[SVGR]: https://react-svgr.com
[SVGR CLI]: https://react-svgr.com/docs/cli/
[SVGR Webpack loader]: https://react-svgr.com/docs/webpack/
