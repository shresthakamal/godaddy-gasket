# Upgrade to Next.js 12

Upgrading to Next.js 12 should be pretty straightforward for Gasket apps already
utilizing v6/v2 packages. If your app is still on v5/v1 Gasket packages, be sure
to follow the [v6/v2 Upgrade Guide] first.

## Upgrade Tool

The [gasket-upgrade tool] handles the majority of the steps below. Be sure to
start with it to streamline the upgrade process.

## Update Dependency Versions

You will need to ensure that your `@gasket/*` and `@godaddy/gasket-*` are
up-to-date. Updates in these plugins and packages handle most of the integration
for Next.js 12, however, there are a few app-level fixup things to be aware of.

## Update Enzyme adapter

Next.js 12 requires React 17. However, since there is no "official" Enzyme
adapter for React 17, you will need to change to a community-contributed one.

```diff
{
  "name": "example-app",

  "devDependencies": {
    "enzyme": "^3.9.0",
-   "enzyme-adapter-react-16": "^1.10.0"
+   "@wojtekmaj/enzyme-adapter-react-17": "^0.6.6"
  }
}
```

Be sure to update any jest config or mocha setup files you may have, which the
[gasket-upgrade tool] can do for you.

For the long term, the general React community guidance is to migrate from
Enzyme to [React Testing Library]. See their [Migrate from Enzyme] docs for
details. All new Gasket apps with the latest presets are scaffolded with React
Testing Library.

## Static images use next/image

If you were previously using image imports in your app, there are some
adjustments you need to make for Next.js 12. Before, the Gasket UXP plugin would
add file and url Webpack loaders for static images. However, Next.js 12 now has
built-in support for this, paired with [next/image], which provides many great
features.

The required changes are fairly minimal. Instead of assigning the imported
variable to an `<img/>`, instead use the [Image][next/image] component.

```diff
import React from 'react';
+ import Image from 'next/image';

import headerImage from '../static/headerimage.jpg';

export default function Header() {
  return (
    <div className='hero-header'>
-     <img src={ headerImage } />
+     <Image src={ headerImage } />
    </div>
  );
}
```

By default, this may just work fine. However, be sure to review the images in
the browser and refer to the [Next docs][next/image] in case there are some prop
settings you may need to tune.

## Static content in public/

For automatic [static file serving] by Next.js, it is now _**required**_ to
place contents in a directory named `public/` instead of ~`static/`~. The
[gasket-upgrade tool] can handle renaming the directory and most file
references, but be sure to test and double-check your code.

## RTL support requires custom PostCSS

> ⚠️ `@godaddy/gasket-plugin-rtl-css` is no longer available in v3 plugins

We are deprecating the [@godaddy/gasket-plugin-rtl-css] and instead are
providing steps to configure PostCSS to handle RTL for apps. If you already have
custom PostCSS configured, or if your app does not need to support RTL language,
you can skip this step.

_Why are we deprecating this?_ The Gasket plugin had to rely too much on
internal Next logic, which has undergone several changes. Since v10, Next has
support for PostCSS config, which is the "official" way to custom CSS output, we
now embrace that approach.

There are various ways to configure PostCSS. We recommend adding a `postccs`
property in the package.json to simplify what files to track.

```diff
{
  "name": "example-app",

+  "postcss": {
+    "plugins": [
+      "postcss-flexbugs-fixes",
+      [
+        "postcss-preset-env",
+        {
+          "autoprefixer": {
+            "flexbox": "no-2009"
+          },
+          "stage": 3,
+          "features": {
+            "custom-properties": false
+          }
+        }
+      ],
+      "postcss-rtlcss"
+    ]
+  }
}
```

You will also need to install these dev dependencies:

```shell
npm install --save-dev postcss postcss-flexbugs-fixes postcss-preset-env postcss-rtlcss
```

Most of the above config is required by Next (see docs). For more details on how
RTL CSS works, see the [RTL CSS Guide].

## Cleanup Babel config

Next v12 has a new [Rust compiler] built on SWC. It is recommend to utilize this
in your apps. However, if a Babel config is found, the build command will opt
out of using the Rust compiler. To take full advantage of this Next.js 12
feature, you can remove the `.babelrc` (or `babel.config.js`, etc).

There are some additional steps to take depending on your test suite. Newly
created Gasket app have similar configurations to what's described next.

### Mocha tests

_If you wish to use SWC and have Mocha tests._ The original Babel config, which
was previously generated for Gasket apps, was mainly for CommonJS support with
Mocha tests. If your test suite uses Mocha, you can create a custom Babel config
for tests only that does not interfere with building the Next app.

To do this, create a `test/setup.js` file with the following [@babel/register]
config:

```javascript
// test/setup.js

require('@babel/register')({
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          modules: 'commonjs'
        }
      }
    ]
  ]
});
```

Also, validate that `@babel/register` is installed as a `devDependency`. Next,
update your Mocha runner script to _require_ this new setup file. Ensure that it
occurs **after** the require `setup-env` argument.

```diff
{
  "name": "example-app",

  "scripts": {
-    "test:runner": "NODE_ENV=test mocha -r setup-env --recursive \"test/**/*.*(test|spec).js\"",
+    "test:runner": "NODE_ENV=test mocha -r setup-env -r ./test/setup.js --recursive \"test/**/*.*(test|spec).js\"",
  }
}
```

### Jest test

_If you wish to use SWC and have Jest tests._ Next.js now provides a built-in
config for Jest [Next docs][next/jest]. Use it with any addition config in
the `jest.config.js`.

```js
// jest.config.js

const nextJest = require('next/jest');
const pathToApp = 'pages';
const createJestConfig = nextJest(pathToApp);

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: ['**/*.js'],
  testURL: 'http://localhost/'
};

module.exports = createJestConfig(customJestConfig);
```

You may need to also install `jest-environment-jsdom`.

```shell
npm install --save-dev jest-environment-jsdom
```

## Update ESLint configs

To get current and continue working with Next.js 12, some upgrades and changes
need to take place. Several ESLint plugins are now included as dependencies of
the configs and can be removed.

```diff
{
  "devDependencies": {
+    "@babel/core": "^7.16.10",
+    "eslint": "^8.6.0",
+    "eslint-config-godaddy-react": "^9.0.0",
+    "eslint-config-godaddy": "^7.0.0",
+    "@godaddy/eslint-plugin-react-intl": "^1.1.1",

+    "eslint-config-next": "^12.1.0"

-    "eslint-plugin-jsx-a11y": "*",
-    "eslint-plugin-react": "*",
-    "eslint-plugin-json": "*",
-    "eslint-plugin-mocha": "*"

-    "babel-core": "*",
-    "babel-eslint": "*"
  }
}
```

Notice that besides the upgrades and removals, there is a new ESLint plugin for
Next.js. You will need to extend the ESLint config with it and remove the former
parser settings.

```diff
{
  "eslintConfig": {
    "extends": [
      "godaddy-react",
      "plugin:@godaddy/react-intl/recommended",
+      "next"
    ],
-    "parser": "babel-eslint"
  }
}
```

[v6/v2 Upgrade Guide]: /docs/upgrade-to-6.md
[RTL CSS Guide]: /packages/gasket-plugin-uxp/docs/rtl-css.md#usage
[gasket-upgrade tool]: /packages/gasket-upgrade-cli/README.md
[React Testing Library]: https://testing-library.com/react
[Migrate from Enzyme]: https://testing-library.com/docs/react-testing-library/migrate-from-enzyme/
[next/image]: https://nextjs.org/docs/api-reference/next/image
[next/jest]: https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler
[Rust compiler]: https://nextjs.org/blog/next-12#faster-builds-and-fast-refresh-with-rust-compiler
[Babel register]: https://babeljs.io/docs/en/babel-register
