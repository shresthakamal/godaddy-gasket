# Migrating from `gd-webapp`

General gotchas and things to be aware of coming from `gd-webapp` app, and
shared module development. Intended for developers with a `gd-webapp` background
beginning new development and/or porting existing code to Gasket.

> **NOTE:** this guide was created during the migration of [config-ui].

Looking for more help? Come ask us in `#gasket-support` on Slack!

## File structure

Next.js structures your application with a top-level `pages` directory. This is
different than the common convention for many projects which nest all code under
a `/src` directory.

Approaching this with an open mind, having a flatter structure is convenient in
many ways. After embracing the top-level directory philosophy, we have this
overall structure:

```
/
  actions/                      // My redux action creators
  components/                   // Any non-page components
  config/                       // App-specific configuration
  lifecycles/                   // Hooks into the gasket lifecycle
  pages/                        // Next.js pages
  reducers/                     // Redux reducers
  server/                       // Server-only code
    actions/                    // Server-side actions
    middleware/                 // Express middleware
  styles/                       // SASS files
  tests/                        // Unit tests
  utils/                        // Utility JS
  gasket.js              // Gasket configuration
  routes.js                     // Custom routing
  store.js                      // Store creator
```


## Redux

Gasket standardizes state management to be handled with Redux. The way you
create a store doesn't vary substantially from creating a store in `gd-webapp`.

In the case of gasket, you point [`redux.makeStore`][makeStore] in your
`gasket.js` to a [module][makeStore-module] that exports a store creation
function. Like with `gd-webapp`, a [convenience method] is available (in
`@gasket/redux`). This allows you to simply pass in a map of reducers and you
get what you need. The redux tools browser extension continued working with no
problems.

For even more convenience if you place a `make-store.js` file in your
application's root directory it will automatically be discovered by Gasket.

One thing Gasket does not have is the concept of a top-level server-side redux
action. Server-side actions are supported, but they're something you need to
manually invoke via `getServerSideProps` or [`getInitialProps`][getInitialProps].

> **NOTE:** There are currently issues with the store-related code requiring
> CommonJS modules. This is not related to Gasket itself, but a side-effect of
> how Node.js and ESModules interop. See [Common "Gotchas"].

## React components

Authoring React components isn't any different from how you'd do it in `gd-
webapp`, but Gasket (well, next.js) makes it a bit more convenient. You can now
import SCSS files directly at the top level because server-side code under
next.js is webpack-bundled with `.scss` files ignored. The only real differences
with components comes when you're authoring your _page_ components, since those
support special next.js-specific things like `getInitialProps` methods.

## Lifecycles

The [@gasket/plugin-lifecycle] which is included in the default preset enabled
me to create some files under `/lifecycles` to modify some webpack configuration
and inject express middleware.

### Webpack lifecycle

Webpack is used for both client- and server-side code in Next.js, you have to be
careful that you don't break things by accidentally introducing breakage for
server-side code. Thankfully, this lifecycle event includes details to tell you
whether it's server-side or client-side.

> **NOTE:** this distinction is necessary for several scenarios including not
> injecting UXCore2 externals server-side within `@godaddy/gasket-plugin-uxp`.

When the desired webpack changes are for client-side only bundles, use a
[`webpack` _hook_][webpack-hook] instead of `gasket.js` to customize
webpack configuration.

### Consider using a `/server` directory

A common issue for app developers is importing unnecessary code in client-side
pages. Since Next.js pages support a `getInitialProps` method that is called for
both SSR and client-side page transitions pages often import server-side code
that is not necessary in client-side bundles.

A simple way that bundling mistake can be avoided is to use file path
conventions, such as a `/server` directory, and
[exclude all of those files][server-exclude] for client bundles.

A proposal to standardize this convention can be found here:
[`GX-12984` - As a developer, ISBAT easily avoid including server-only code in client bundles](https://jira.godaddy.com/browse/GX-12984)

### Express / middleware lifecycles

`gd-webapp` provides a really easy way to specify custom middleware / routes for
express. Gasket provides a simple way to do this through
[@gasket/plugin-lifecycle]. This plugin assumes that a `lifecycles` folder
exists in the root of your application.

This folder should contain files that can interact with the various of gasket
lifecycle events that are implemented by the plugins.

The name of the file (excluding the `.js` extension) is used as the name of the
lifecycle event and the exported function of that file is used as handler of the
event. So you end up with the following application structure:

```
gasket.js
pages/
lifecycles/
  presentation-central.js
  middleware.js
  webpack.js
```

#### `body-parser` not enabled by default

See: `body-parser` not enabled by default in [Express plugin gotchas].

## Auth

Gasket provides more flexible auth via [components][auth-components] than `gd-
webapp`. Although that may be the better solution for the majority of apps, this
was inconvenient in my case because:

* I needed auth details as part of my app's data model
* I needed auth details for SSR
* `@godaddy/gasket-auth` doesn't do up-front auth before render time, unlike
  `gd-webapp` which does auth in a middleware.

I was able to find a workaround to pre-populate the Jomax groups
[via `getInitialProps`][auth-prepopulate], and that may be good enough unless we
find lots of similar struggles for other apps.

## Routing

Next.js has a routing solution in place, mapping `/pages` file names to route
names, and requiring the query string to parameterize these routes.

Gasket does provide a way to do [advanced routing]. This advanced routing made
it easy to create URLs match those used in the `gd-webapp` version of the app.

[I set up my routes][my-routes], then placed my "page" components
[in their own files][my-pages]. This removed the need for any `react-router`
`<Switch>` components.

I also needed to [convert my `<Link/>`s][convert-links] [and procedural routing]
to the new way of doing things.

Next.js doesn't support nested routing, sadly. Nested routing allows you to
easily share common code among multiple routes. To avoid duplication, I had to
go with [customizing my `_app.js`][custom-app] instead.

## Navigation

Before porting over the app, `config-ui` utilized the
[@wsb/react-router-header-nav] package to work around header navigation
limitations. An equivalent package for gasket is [@godaddy/gasket-header-nav],
which `config-ui` [now uses].

The downside to either package is that the navigation is not present during a
SSR. In the case of `config-ui` where the navigation is dynamic based on
application state, maybe it's the best we can hope for, but for other apps where
the navigation is more static, maybe we can do better.

A proposal to standardize this convention can be found here:
[`GX-12989` - As a developer, ISBAT integrate header navigation events with my client-side routing framework][GX-12989]

<!-- LINKS -->

[config-ui]: https://github.secureserver.net/appconfig/config-ui/blob/master/README.md
[@wsb/react-router-header-nav]: https://github.secureserver.net/PC/react-router-header-nav/blob/master/README.md
[GX-12989]:https://jira.godaddy.com/browse/GX-12989

<!-- CODE LINKS -->

[makeStore]: https://github.secureserver.net/appconfig/config-ui/blob/master/gasket.config.js#L13
[makeStore-module]: https://github.secureserver.net/appconfig/config-ui/blob/master/store.js#L4
[getInitialProps]: https://github.secureserver.net/appconfig/config-ui/blob/master/pages/_app.js#L23-L29
[webpack-hook]: https://github.secureserver.net/appconfig/config-ui/blob/master/lifecycles/webpack.js
[server-exclude]: https://github.secureserver.net/appconfig/config-ui/blob/master/lifecycles/webpack.js#L15-L18
[my-routes]: https://github.secureserver.net/appconfig/config-ui/blob/master/routes.js
[my-pages]: https://github.secureserver.net/appconfig/config-ui/blob/master/pages
[convert-links]: https://github.secureserver.net/appconfig/config-ui/blob/master/pages/history.js#L95-L97
[and procedural routing]: https://github.secureserver.net/appconfig/config-ui/blob/master/pages/setting.js#L278
[custom-app]: https://github.secureserver.net/appconfig/config-ui/tree/master/pages/_app.js
[auth-prepopulate]: https://github.secureserver.net/appconfig/config-ui/blob/master/pages/_app.js#L24-L28
[now uses]: https://github.secureserver.net/appconfig/config-ui/blob/master/components/navigation.js#L27-L44

<!-- GASKET LINKS -->

[@gasket/plugin-lifecycle]:https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-lifecycle/README.md
[Express plugin gotchas]:https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-express/docs/gotchas.md#body-parser-not-enabled-by-default
[convenience method]:https://github.com/godaddy/gasket/tree/main/packages/gasket-redux/README.md#functions
[advanced routing]:https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-nextjs/docs/routing.md#advanced-routing
[Common "Gotchas"]:https://github.com/godaddy/gasket/tree/main/packages/gasket-cli/docs/gotchas.md

<!-- REPO LINKS -->

[auth-components]: https://github.com/gdcorp-uxp/gasket/tree/main/packages/gasket-auth/README.md
[@godaddy/gasket-header-nav]: https://github.com/gdcorp-uxp/gasket/tree/main/packages/gasket-header-nav/README.md

