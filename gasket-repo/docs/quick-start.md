# Quick Start

To get started, be sure you are on VPN so that you can access the services needed.

Now to create a new app, use a package runner with `create-gasket-app`:

```bash
npx create-gasket-app --help
# OR
yarn create gasket-app --help
```

You'll also need to specify an `appname` and choose a template for your app.
In this example, we'll create a Next.js app using the internal template `@godaddy/gasket-template-webapp-pages`.
You can find other available [templates] in the main README.

This template is available via the NPM Artifactory registry.
If you haven’t set that up yet, make sure to follow the [NPM Setup Guide] to gain access.

```bash
npx create-gasket-app your-app-name --template @godaddy/gasket-template-webapp-pages
```

If not set as the default registry in your `~/.npmrc` file, specify it using the npm config env var before the gasket command:

```bash
npm_config_registry=https://gdartifactory1.jfrog.io/artifactory/api/npm/node-virt/ npx create-gasket-app your-app-name --template @godaddy/gasket-template-webapp-pages
```

This will create a new directory with the name of your app.

``` bash
cd ./your-app-name
```

From here, you can run your starter app in development mode:

``` bash
npm run local
```

Now you should be all set to start writing your code and see updates live in the browser.

[NPM Setup Guide]:https://github.com/gdcorp-engineering/javascript-best-practices/blob/master/nodejs/using-npm-with-artifactory.md
[templates]:/README.md#templates
