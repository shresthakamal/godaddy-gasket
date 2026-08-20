# Upgrade to v5/v1

This guide will take you through updating `@gasket/*` packages from `3.x` to
`5.x`, and switching to `@godaddy/gasket-*` packages at `1.x`.

> TIP: The first open source release of Gasket was at v5 in order to align all
> packages on the same major version. As a result, there is no v4 of
> `@gasket/cli`, hence no upgrade steps required.

## Overview

This upgrade introduces a change in naming convention for packages moving
forward. This change may prove tricky when upgrading apps to the new packages,
but the delineation between open source and inner source packages should help
teams know where to find docs and make contributions.

We now have two monorepo projects:

### Gasket

**Gasket** is now a public open source project, whose packages are denoted with
the `@gasket` scope.

- https://github.com/godaddy/gasket/

### GoDaddy Gasket

**GoDaddy Gasket** is the internal private gasket-based project for apps with
build at GoDaddy whose packages are indicated with the `@godaddy/gasket-` scope
and prefix.

- https://github.com/gdcorp-uxp/gasket

## Steps

The [gasket-upgrade] handles the majority of the steps below. Utilize it when
performing this upgrade alongside this guide for a reference of changes.

### Change dependencies

Update the names and version of Gasket packages in the app's `package.json`.

This is not an exhaustive list, but rather a sampling of dependencies to
demonstrate what to look for:

```diff
{
  "dependencies": {
-    "@gasket/cli": "^3.1.2",
+    "@gasket/cli": "^5.0.2",
-    "@gasket/fetch": "^1.0.1",
+    "@gasket/fetch": "^5.0.2",

-    "@gasket/mocha-plugin": "^1.4.1",
+    "@gasket/plugin-mocha": "^5.0.2",
-    "@gasket/service-worker-plugin": "^1.3.0",
+    "@gasket/plugin-service-worker": "^5.0.2",

-    "@gasket/auth": "^2.4.0",
+    "@godaddy/gasket-auth": "^1.0.0",
-    "@gasket/header-nav": "^2.2.0",
+    "@godaddy/gasket-header-nav": "^1.0.0",
-    "@gasket/next": "^4.0.0",
+    "@godaddy/gasket-next": "^1.0.0",

-    "@gasket/godaddy-preset": "^1.1.0",
+    "@godaddy/gasket-preset-webapp": "^1.0.0",
-    "@gasket/zkconfig-plugin": "^1.2.1",
+    "@godaddy/gasket-plugin-zkconfig": "^1.0.0"
   }
}
```

### Change imports

```diff
// pages/_app.js

-import { App, withPageEnhancers } from '@gasket/next';
+import { App, withPageEnhancers } from '@godaddy/gasket-next';
-import { withHeaderNav } from '@gasket/header-nav';
+import { withHeaderNav } from '@godaddy/gasket-header-nav';
 import { withLocaleRequired } from '@gasket/intl';
```

A common package to change will likely be for auth:

```diff
// pages/secure-page.js

import React from 'react';
import PropTypes from 'prop-types';
-import { withAuthRequired } from '@gasket/auth';
+import { withAuthRequired } from '@godaddy/gasket-auth';
```

Also, if you use `require` in any of your code, update those statements as well.
Notice in this example, some `@gasket/*` did not change, only the packages which
have not been open sourced.

```diff
// store.js
const { configureMakeStore } = require('@gasket/redux');
-const authReducers = require('@gasket/auth/reducers');
+const authReducers = require('@godaddy/gasket-auth/reducers');
 const intlReducers = require('@gasket/intl/reducers');
-const cookiesReducers = require('@gasket/cookies/reducers');
+const cookiesReducers = require('@godaddy/gasket-cookies/reducers');
```

### Change configured plugins

In the `gasket.config.js`, update the names of the preset and plugins to follow
the new naming convention. These can be in short form.

The preset to now use is `@godaddy/gasket-preset-webapp`, or `@godaddy/webapp`
in short form.

```diff
// gasket.config.js
module.exports = {
  plugins: {
-   presets: ['godaddy'],
+   presets: ['@godaddy/webapp'],
-   add: ['zkconfig', 'service-worker', 'workbox', 'manifest']
+   add: ['@godaddy/zkconfig', '@gasket/service-worker', '@gasket/workbox', '@gasket/manifest']
  }
}
```

### Configure assets plugin

The new webapp preset does not come with `@godaddy/gasket-plugin-assets` which
enables `asset-system`. It is now an opt-in plugin. If your app does not need it
then you can skip this.

You can know if the asset plugin is needed this by checking for `asset-provider`
in your app's dependencies. if you need it, then install it as a dependency in
your package and configure it in the `gasket.config.js`.

```diff
{
  "dependencies": {
    "@gasket/cli": "^5.0.2",
    "@gasket/fetch": "^5.0.2",
+    "@godaddy/gasket-plugin-assets": "^1.0.0",
    "@godaddy/gasket-plugin-auth": "^1.0.0",
    "@godaddy/gasket-preset-webapp": "^1.0.0",
    "asset-provider": "^4.1.0"
   }
}
```

```diff
// gasket.config.js
module.exports = {
  plugins: {
    presets: ['@godaddy/webapp'],
+    add: ['@godaddy/assets']
  }
}
```

### Change plugin timings and dependencies

In any custom plugins, whether in the `plugins/` folder in app, or as separate
packages, be sure to update the names of plugins in both the `timings` and
`dependencies`.

```diff
// plugins/example-plugin.js
module.exports = {
-  dependencies: ['log'],
+  dependencies: ['@gasket/log'],
  hooks: {
    configure: {
      timing: {
-        after: ['zkconfig']
+        after: ['@godaddy/zkconfig']
      },
      handler: function (gasket, config) {...}
    }
  }
}
```

### Rename custom plugins

For any custom plugins, especially those as separate shared packages, the names
should be modified to follow the new [naming convention].

Update the name in the `package.json`.

```
{
-  "name": "@wsb/sh-gasket-plugin",
+  "name": "@wsb/gasket-plugin-shared-header",
  "version": "2.1.0",
  "description": "the P&C shared header gasket plugin",
}
```

As well as the name exported by the plugin definition, in which case,
re-exporting the name from the package ensure consistency.

```diff
// index.js
module.exports = {
-  name: 'sh',
+  name: require('./package.json').name,
  hooks: {...}
}
```

Upon publishing the package changes, be sure and update the dependencies on in
in the apps consuming it.

> TIP: Because this is effective a new package with the rename, it is a good
> idea to publish on a new major version, or start over at v1.

> TIP: Keep a branch for any fixes under the original package name until apps
> that depend on the old plugin have upgraded. These can be forward ported to
> the mainline branch of your renamed version.

<!-- LINKS -->

[gasket-upgrade]: /packages/gasket-upgrade-cli/README.md
[naming convention]: https://github.com/godaddy/gasket/blob/main/packages/gasket-resolve/README.md#naming-convention
