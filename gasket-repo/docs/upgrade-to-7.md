# Upgrade to v7/v3 (Active)

See [what is new] for a summary of the new features and changes in Gasket.

> You can find the official upgrade guide for updating `@gasket/*` packages to
> `7.x` on the [Gasket Open Source Repo].

This guide will focus on updating internal `@godaddy/gasket-*` packages.

## Table of Contents

- [Core Updates](#core-updates)
- [Update Dependency Versions](#update-dependency-versions)
- [Remove Plugins](#remove-plugins)
- [Update Signatures](#update-signatures)
- [Update Lifecycles Contexts](#update-lifecycles-contexts)
- [Update Next.js Document](#update-nextjs-document)
- [Update Next.js App](#update-nextjs-app)
  - [Add Layout Component](#add-layout-component)
  - [Include Auth Provider](#include-auth-provider)
  - [Include Intl Provider](#include-intl-provider)
  - [Update Redux](#update-redux)
    - [How GasketData Replaces Redux](#how-gasketdata-replaces-redux)
    - [Do You Still Need Redux?](#do-you-still-need-redux)
    - [Option A: Drop Redux, Use GasketData](#option-a-drop-redux-use-gasketdata)
    - [Option B: Keep Redux with GasketData](#option-b-keep-redux-with-gasketdata)
    - [Pages Router: Server-Side Redux with next-redux-wrapper](#pages-router-server-side-redux-with-next-redux-wrapper)
    - [Update Switchboard Configuration](#update-switchboard-configuration)
    - [Cleanup](#cleanup)
- [Update Auth initialProps](#update-auth-initialprops)
- [Switch from Linaria](#switch-from-linaria)
- [Update to ESM](#update-to-esm)
- [Updates for Shared Headers](#updates-for-shared-headers)

## Core Updates

Many of the essential upgrade steps are described in the
[Open Source Upgrade Guide].
Be sure to start there, and come back here for additional steps.

## Update Dependency Versions

Update all `@godaddy/gasket-*` packages to the v3 major version.

You can find more details about updating dependencies in
the [generic upgrade guide].

This is not an exhaustive list, but rather a sampling of dependencies to
demonstrate what to look for:

```diff
// package.json

"dependencies": {
-    "@godaddy/gasket-auth": "^2.18.0",
+    "@godaddy/gasket-auth": "^3.0.0",
-    "@godaddy/gasket-plugin-auth": "^2.26.0",
+    "@godaddy/gasket-plugin-auth": "^3.0.0",
-    "@godaddy/gasket-preset-uxp": "^2.44.2",
+    "@godaddy/gasket-preset-uxp": "^3.0.0",
}
```

## Remove Plugins

The following packages have been removed in this release:

**@godaddy/gasket-plugin-healthcheck**

  - Redundant with healthcheck in [@gasket/plugin-https].

**@godaddy/gasket-plugin-rtl-css**

  - Refer to the [Next 12 RTL Upgrade Guide] for background.

**@godaddy/gasket-plugin-linaria**

  - Not compatible. Refer to [Switch from Linaria] below.

**@godaddy/gasket-plugin-appconfig**

  - Migrate to [@godaddy/gasket-plugin-switchboard][from appconfig].

**@godaddy/gasket-plugin-hivemind** and **@godaddy/gasket-hivemind**

  - Migrate to [@godaddy/gasket-plugin-switchboard][from hivemind].

## Update Signatures

**[@godaddy/gasket-auth]**

- Removed deprecated `authStatus` export which is now `AuthStatus`.

```diff
- import { authStatus } from '@godaddy/gasket-auth';
+ import { AuthStatus } from '@godaddy/gasket-auth';
```

**[@godaddy/gasket-next]**

- Removed deprecated `createAppComponent`. Use `createApp` instead.

```diff
- import { createAppComponent } from '@godaddy/gasket-next';
+ import { createApp } from '@godaddy/gasket-next';
```

**[@godaddy/gasket-plugin-uxp]**

- Removed deprecated export of Presentation class and package method.

## Update Lifecycles Contexts

Updated the `trafficDataLayer` lifecycle to adopt a unified `{ req, res }`
context object within its parameters.
This parameter change aligns this lifecycle with other Gasket lifecycles
that use a single context object.

If your app or plugins hooks this lifecycle, you will need to adjust it.

```diff
- async trafficDataLayer(gasket, req, res){
+ async trafficDataLayer(gasket, { req, res }){
```

## Update Next.js Document

There are some necessary changes to the `pages/_document.js` to work with the
new Gasket v7 patterns.

```diff
// Before
- import Document from '@godaddy/gasket-next/document';

- export default Document;

// After
+ import { makeDocument } from '@godaddy/gasket-next/document';
+ import { withGasketData } from '@gasket/nextjs/document';
+ import * as NextDocument from 'next/document';
+ import gasket from '../gasket.js';

+ export default withGasketData(gasket)(makeDocument(gasket, NextDocument));
```

## Update Next.js App

In the previous version, the `App` component exported from `@godaddy/gasket-next`
was pre-wired with several features that are now separated into higher-order
components.
This change allows for more flexibility and customization in the app and works
better with new patterns in Gasket v7.

We will walk through the necessary changes in stages here.

### Add Layout Component

```diff
// Before
import '../styles/global.scss';

- import { App, reportWebVitals } from '@godaddy/gasket-next';

- export default App;
export { reportWebVitals };

// After
import '../styles/global.scss';

+ import { createApp, reportWebVitals } from '@godaddy/gasket-next';
+
+ function Layout(props) {
+   const { Component, pageProps } = props;
+
+   return (
+     <Component { ...pageProps } />
+   );
+ }
+
+ const App = createApp({ Layout, initialProps: true });
+
+ // Wrap the app with higher-order components
+ export default [
+   // any App HOCs can go here
+ ].reduce((cmp, hoc) => hoc(cmp), App);
+
export { reportWebVitals };
```

### Include Auth Provider

Another necessary change is to ensure the Auth provider is available.
To do this, add the `withAuthProvider` to your `_app.js` file.

```diff
import { createApp, reportWebVitals } from '@godaddy/gasket-next';
+ import { withAuthProvider } from '@godaddy/gasket-auth';

-- snip --

// Wrap the app with higher-order components
export default [
+  withAuthProvider()
].reduce((cmp, hoc) => hoc(cmp), App);
```

### Include Intl Provider

See the [Bring Your Own Intl Provider] upgrade section for more background.
The updates below ensure the proper locale is available for GoDaddy apps.

```diff
import { createApp, reportWebVitals } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';
+ import { withMessagesProvider } from '@gasket/react-intl';
+ import { withLocaleInitialProps } from '@gasket/nextjs';
+ import { useRouter } from 'next/router';
+ import { IntlProvider } from 'react-intl';
+ import intlManager from '../intl.js';
+ import gasket from '../gasket.js';

+ const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);

function Layout(props) {
  const { Component, pageProps } = props;
+  const locale = props.locale ?? 'en-US';

  return (
+    <IntlMessagesProvider locale={ locale }>
      <Component { ...pageProps } />
+    </IntlMessagesProvider>
  );
}

// Wrap the app with higher-order components
export default [
  withAuthProvider(),
+  withLocaleInitialProps(gasket)
].reduce((cmp, hoc) => hoc(cmp), App);
```

### Update Redux

`@gasket/plugin-redux` and `@gasket/redux` are **deprecated** and will be removed
in a future major version. They are only compatible with Pages Router apps using
a [custom server] with [@gasket/plugin-middleware].

This section walks through the recommended approaches for updating your app's
use of Redux. If you are setting up Redux with the App Router, see the
[Redux with App Router] guide.

#### How GasketData Replaces Redux

A common use of Redux in Gasket apps has been to transfer server-side data to
the client — config values, feature flags, switchboard settings, API URLs, and
similar request-specific data. The typical flow was:

1. `@gasket/plugin-redux` creates a Redux store on each request
2. Plugins inject data via the `initReduxState` lifecycle
3. `next-redux-wrapper` serializes the store and sends it to the client
4. Components read the data with `useSelector`

[GasketData][@gasket/plugin-data] replaces this with a simpler mechanism:

1. Plugins inject data via the `publicGasketData` lifecycle
2. `withGasketData` renders it as a `<script>` tag in the HTML
3. Components read the data with the `useGasketData()` hook or `gasketData()`
   from `@gasket/data`

No store, no reducers, no actions, no serialization — just a JSON payload
embedded in the HTML and read on the client. The lifecycle mapping for plugin
authors is straightforward:

| Redux pattern | GasketData equivalent |
|:---|:---|
| `initReduxState` hook | `publicGasketData` hook |
| `useSelector(state => state.x)` | `useGasketData().x` or `gasketData().x` |
| `@gasket/plugin-redux` | `@gasket/plugin-data` |
| `req.store.getState()` | `gasket.actions.getPublicGasketData(req)` |

GasketData is **read-only and flows one direction** (server → client). It does
not replace Redux for dynamic client-side state such as form inputs, UI
toggles, or anything that changes after the initial page load. For those use
cases, a client-side state solution like [@reduxjs/toolkit], React context, or
`useState` is still appropriate.

#### Do You Still Need Redux?

With that in mind, consider what Redux is actually doing in your app:

- **Config-like data** (API URLs, feature flags, switchboard settings, locale) —
  This data flows from the server to the client and rarely changes at runtime.
  **GasketData is the better fit.** It handles server→client transport
  automatically and works with both Pages Router and App Router.

- **True client-side app state** (shopping cart, form state, UI toggles) —
  Redux is a reasonable choice for this. Set it up directly with
  [@reduxjs/toolkit] instead of the deprecated `@gasket/redux` package.

If your app only uses Redux for config-like data, follow **Option A** to
remove Redux entirely. If you have a mix of both, follow **Option B** to keep
Redux for app state while moving server data to GasketData.

#### Option A: Drop Redux, Use GasketData

This is the recommended path. GasketData surfaces server-side data to the
browser without Redux. It works with both the Pages Router and App Router.

**1. Ensure `@gasket/plugin-data` is configured**

```js
// gasket.js
import pluginData from '@gasket/plugin-data';
import gasketData from './gasket-data.js';

export default makeGasket({
  plugins: [pluginData],
  data: gasketData
});
```

See the [@gasket/plugin-data] docs for setting up your `gasket-data.js` file
with environment-specific configuration.

**2. Inject GasketData into your document or layout**

For Pages Router:

```diff
// pages/_document.js
import { makeDocument } from '@godaddy/gasket-next/document';
+ import { withGasketData } from '@gasket/nextjs/document';
import * as NextDocument from 'next/document';
import gasket from '../gasket.js';

+ export default withGasketData(gasket)(makeDocument(gasket, NextDocument));
```

For App Router:

```diff
// app/layout.js
+ import { withGasketData } from '@gasket/nextjs/layout';
import gasket from '../gasket.js';

async function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

+ export default withGasketData(gasket)(RootLayout);
```

**3. Access data in components**

For Pages Router, wrap your app with `withGasketDataProvider` and use the
`useGasketData` hook:

```diff
// pages/_app.js
+ import { withGasketDataProvider } from '@gasket/nextjs';
import gasket from '../gasket.js';

-- snip --

export default [
  withAuthProvider(),
  withLocaleInitialProps(gasket),
+  withGasketDataProvider(gasket)
].reduce((cmp, hoc) => hoc(cmp), App);
```

Then in your components, replace Redux selectors with the hook:

```diff
// components/my-component.js
- import { useSelector } from 'react-redux';
+ import { useGasketData } from '@gasket/nextjs';

export default function MyComponent() {
-  const flags = useSelector(state => state.gasketData.featureFlags);
+  const { featureFlags: flags } = useGasketData();

  return <div>{flags.showBanner && <Banner />}</div>;
}
```

For App Router, `@gasket/data` reads from the script tag injected by
`withGasketData` and is **browser-only**. Components that use it must be client
components:

```js
// components/my-component.js
'use client';
import { gasketData } from '@gasket/data';

export default function MyComponent() {
  const { featureFlags } = gasketData();
  return <div>{featureFlags.showBanner && <Banner />}</div>;
}
```

**4. Remove Redux dependencies**

Once all components have been migrated off Redux selectors, remove the Redux
packages:

```diff
// package.json
"dependencies": {
-    "@gasket/plugin-redux": "^7.x.x",
-    "@gasket/redux": "^7.x.x",
-    "react-redux": "^8.x.x",
-    "next-redux-wrapper": "^7.x.x",
-    "lodash.merge": "^4.x.x",
-    "redux": "^4.x.x",
}
```

Remove the Redux plugin from your gasket configuration:

```diff
// gasket.js
- import pluginRedux from '@gasket/plugin-redux';

export default makeGasket({
  plugins: [
-   pluginRedux,
  ]
});
```

Delete your `store.js` (or `redux/store.js`) and any reducer files that were
only serving config data. Remove the Redux Provider from `_app.js`.

#### Option B: Keep Redux with GasketData

If your app uses Redux for real client-side state, you can keep it while moving
server→client data transport to GasketData. This approach uses GasketData to
deliver data to the browser and dispatches it to the Redux store on the client.

**1. Set up GasketData** as described in Option A (steps 1-2).

**2. Set up your Redux store with `@reduxjs/toolkit`**

Replace the deprecated `@gasket/redux` configuration with modern toolkit
patterns:

```diff
// store.js
- import { configureMakeStore } from '@gasket/redux';
+ import { configureStore } from '@reduxjs/toolkit';
import reducers from './reducers.js';

- export default configureMakeStore({ reducers });

+ export const makeStore = () => {
+   return configureStore({
+     reducer: {
+       ...reducers
+     }
+   });
+ };
```

**3. Create a store provider and hydrate from GasketData**

For Pages Router, wrap your app with both `withGasketDataProvider` and a Redux
Provider. Use `useGasketData` to hydrate the store on mount:

```js
// pages/_app.js
import { createApp } from '@godaddy/gasket-next';
import { withGasketDataProvider, useGasketData } from '@gasket/nextjs';
import { Provider as ReduxProvider } from 'react-redux';
import { useRef } from 'react';
import { makeStore } from '../store.js';
import gasket from '../gasket.js';

function Layout(props) {
  const { Component, pageProps } = props;
  const gasketData = useGasketData();
  const storeRef = useRef();

  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (gasketData) {
      storeRef.current.dispatch({
        type: 'HYDRATE_GASKET_DATA',
        payload: gasketData
      });
    }
  }

  return (
    <ReduxProvider store={ storeRef.current }>
      <Component { ...pageProps } />
    </ReduxProvider>
  );
}

const App = createApp({ Layout, initialProps: true });

export default [
  withGasketDataProvider(gasket)
].reduce((cmp, hoc) => hoc(cmp), App);
```

For App Router, follow the [Redux with App Router] guide for the base setup,
then hydrate the store from GasketData in the `StoreProvider`. Since
`@gasket/data` is browser-only, the store will be populated with GasketData on
the client after the script tag is parsed:

```js
// app/store-provider.jsx
'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { gasketData } from '@gasket/data';
import { makeStore } from '../redux/store';

export default function StoreProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = makeStore();
    const data = gasketData();
    if (data) {
      storeRef.current.dispatch({
        type: 'HYDRATE_GASKET_DATA',
        payload: data
      });
    }
  }

  return <Provider store={ storeRef.current }>{children}</Provider>;
}
```

Then wrap your layout with both `withGasketData` and the `StoreProvider`:

```js
// app/layout.js
import { withGasketData } from '@gasket/nextjs/layout';
import StoreProvider from './store-provider.jsx';
import gasket from '../gasket.js';

async function RootLayout({ children }) {
  return (
    <StoreProvider>
      <html lang='en'>
        <body>{children}</body>
      </html>
    </StoreProvider>
  );
}

export default withGasketData(gasket)(RootLayout);
```

Any component that interacts with the Redux store must be a client component.

**4. Migrate selectors incrementally**

Components that read config-like data from Redux can be migrated to
`useGasketData()` over time. Components that use Redux for real app state
continue to use `useSelector` / `useDispatch` as before.

#### Pages Router: Server-Side Redux with next-redux-wrapper

If your Pages Router app needs Redux state populated during server-side
rendering (not just on the client), you can use [next-redux-wrapper] to manage
the store server-side and dispatch GasketData before render.

> **Note:** This approach only works with Pages Router. It does not support App
> Router. Using `getInitialProps` at the app level disables Next.js
> [Automatic Static Optimization].

```js
// store.js
import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import reducers from './reducers.js';

const makeStore = () => configureStore({
  reducer: {
    ...reducers
  }
});

export const nextRedux = createWrapper(makeStore);
```

```js
// pages/_app.js
import { createApp } from '@godaddy/gasket-next';
import { Provider as ReduxProvider } from 'react-redux';
import { nextRedux } from '../store.js';
import gasket from '../gasket.js';

function Layout(props) {
  const { Component, ...rest } = props;
  const { store, props: { pageProps } } = nextRedux.useWrappedStore(rest);

  return (
    <ReduxProvider store={ store }>
      <Component { ...pageProps } />
    </ReduxProvider>
  );
}

const App = createApp({ Layout, initialProps: true });

App.getInitialProps = nextRedux.getInitialAppProps(store => async context => {
  const publicGasketData = await gasket.actions.getPublicGasketData(context.ctx.req);
  store.dispatch({
    type: 'HYDRATE_GASKET_DATA',
    payload: publicGasketData
  });

  return {};
});

export default App;
```

In either case, add a reducer to handle the dispatched data:

```js
// reducers.js
function gasketData(state = {}, action) {
  if (action.type === 'HYDRATE_GASKET_DATA') {
    return { ...state, ...action.payload };
  }
  return state;
}

export default { gasketData };
```

#### Update Switchboard Configuration

If your app uses `@godaddy/gasket-plugin-switchboard` with Redux, switch from
`enableRedux` to `enableGasketData`:

```diff
// gasket.js
export default makeGasket({
  switchboard: {
-   enableRedux: true,
+   enableGasketData: true
  }
});
```

With `enableGasketData`, switchboard data is available under
`gasketData.switchboard` via `useGasketData()` or `@gasket/data` instead of
the Redux store.

```diff
// components/my-component.js
- import { useSelector } from 'react-redux';
+ import { useGasketData } from '@gasket/nextjs';

export default function MyComponent() {
-  const switchboard = useSelector(state => state.switchboard);
+  const { switchboard } = useGasketData();

  return <div>{switchboard.someFeature && <Feature />}</div>;
}
```

#### Cleanup

After migrating, verify the following:

- [ ] `@gasket/plugin-redux` and `@gasket/redux` are removed from `package.json`
- [ ] `@gasket/plugin-middleware` is removed if it was only used for Redux
- [ ] `next-redux-wrapper` and `lodash.merge` are removed (if not using the
  server-side wrapper approach)
- [ ] The Redux Provider is removed from `_app.js` (or replaced per Option B)
- [ ] `store.js` and reducer files for config data are deleted
- [ ] `useSelector` calls for config data are replaced with `useGasketData()`
- [ ] Switchboard config uses `enableGasketData` instead of `enableRedux`
- [ ] Custom plugins that hooked `initReduxState` are migrated to
  use the `publicGasketData` lifecycle instead

## Update Auth initialProps

If your app uses `withAuthRequired` with `getInitialProps` to validate user
authentication for pages on the server, then you will need to make a small adjustment.
Since we are moving away from attaching things to req/res via middleware, it is
now necessary to pass the `gasket` instance to the `withAuthRequired` function.

```diff
+ import gasket from '../gasket.js';

function MyPage(props) {
  return <div>Secure Content</div>;
}

- export default withAuthRequired({ realm: 'jomax', initialProps: true })(MyPage);
+ export default withAuthRequired({ realm: 'jomax', initialProps: true, gasket })(MyPage);
```

This allows the HOC to access the `gasket` and use the new [Auth GasketActions]
to validate server-side, only.
The `gasket` will not be bundled nor available client-side in the browser.

The `initialProps` options explicitly tells the HOC to run the `getInitialProps`
when used with page components.
However, initials props can be implicitly enabled if the page component has
`getInitialProps` already.
In either case, the `gasket` instance will still need to be passed as an
argument to enable server-side validation.

## Switch from Linaria

Linaria v6 does not smoothly integrate with Next.js 14.
Because of this, the Gasket team has decided to remove the Linaria plugin in v3.

If you are looking to integrate CSS-in-JS into your Gasket project,
you can use a similar zero-runtime CSS-in-JS library like [Pigment CSS].
This library is built on [WyW-in-JS] which is what powers Linaria and has a
similar api to Linaria.

To integrate Pigment CSS into your v3 Gasket project, follow the documentation
on adding [Pigment with Next.js] and when adding `withPigment` to your
next.config, do so like in the example below:

```diff
// next.config.js

import gasket from './gasket.js';
+ import { withPigment } from '@pigment-css/nextjs-plugin';

+ export default  gasket.actions.getNextConfig(withPigment({}));
```

## Updating to ESM

The latest apps generated by Gasket now default to ECMAScript Modules (ESM). If you're updating your app to use ESM, there are a few considerations to keep in mind.

**ESM and CommonJS interoperability**

When you import a module that was originally in CommonJS but is now being used in an ESM context, you might need to access the `.default` property to get the main export.

```js
import ImageDefault from 'next/image'
const Image = ImageDefault.default || ImageDefault;
```

**Update some file extentsion**

You might need to update some of your imports to include the file extension as ESM will not allow for implicit file extensions.

```diff
- import SomeImport from './some-import';
+ import SomeImport from './some-import.js';

```

If you are using a module that is only available in CommonJS syntax, you can rename the file to have a `.cjs` extension and reflect that change where it is imported.

```diff
- import SomeCommonJsFile from 'some-commonjs-file';
+ import SomeCommonJsFile from 'some-commonjs-file.cjs';
```

## Updates for Shared Headers

If your app was previously using the `@wsb/gasket-plugin-shared-header` plugin, you will need to switch to the new
`@godaddy/gasket-plugin-shared-header` plugin.

First, remove the old plugin and install the new plugin:

```bash
npm uninstall @wsb/gasket-plugin-shared-header
npm install @godaddy/gasket-plugin-shared-header
```

Then, update your `gasket.js` file to use the new plugin:

```diff
// gasket.js
- import pluginSharedHeader from '@wsb/gasket-plugin-shared-header';
+ import pluginSharedHeader from '@godaddy/gasket-plugin-shared-header';
```

That really is all you need to do to switch to the new plugin.
The configuration options are the same, so you shouldn't need to make any other changes.
You can refer to the [@godaddy/gasket-plugin-shared-header] documentation for more details.


<!-- LINKS -->
[Gasket Open Source Repo]: https://github.com/godaddy/gasket/blob/main/docs/upgrade-to-7.md
[Pigment CSS]: https://github.com/mui/pigment-css
[WyW-in-JS]: https://wyw-in-js.dev/
[Pigment with Next.js]: https://github.com/mui/pigment-css?tab=readme-ov-file#start-with-nextjs
[@gasket/plugin-https]: https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-https/README.md
[Open Source Upgrade Guide]: https://github.com/godaddy/gasket/tree/main/docs/upgrade-to-7.md
[Bring Your Own Intl Provider]: https://github.com/godaddy/gasket/tree/main/docs/upgrade-to-7.md#bring-your-own-intl-provider
[next-redux-wrapper]: https://github.com/kirill-konshin/next-redux-wrapper
[@reduxjs/toolkit]: https://redux-toolkit.js.org/
[@gasket/plugin-data]: https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-data/README.md
[@gasket/plugin-middleware]: https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-middleware/README.md
[custom server]: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
[Automatic Static Optimization]: https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization
[Redux with App Router]: https://github.com/godaddy/gasket/tree/main/packages/gasket-redux/docs/redux-with-app-router.md

<!-- Docs -->
[generic upgrade guide]: upgrades.md#minor-and-patch-upgrades
[Next 12 RTL Upgrade Guide]: upgrade-to-next-12.md#rtl-support-requires-custom-postcss
[what is new]: what-is-new.md

[from appconfig]: /packages/gasket-plugin-switchboard/README.md#migrating-from-godaddygasket-plugin-appconfig
[from hivemind]: /packages/gasket-plugin-switchboard/README.md#migrating-from-godaddygasket-plugin-hivemind
[Auth GasketActions]: /packages/gasket-plugin-auth/README.md#actions

[@godaddy/gasket-auth]: /packages/gasket-auth/README.md
[@godaddy/gasket-next]: /packages/gasket-next/README.md
[@godaddy/gasket-plugin-uxp]: /packages/gasket-plugin-uxp/README.md
[@godaddy/gasket-plugin-shared-header]: /packages/gasket-plugin-shared-header/README.md

<!-- Anchor -->
[Switch from Linaria]: #switch-from-linaria

