# {{{appName}}}

## Development

Ensure you are connected to the VPN, then start the app.

```bash
cd {{{appName}}}

npm install

npm run local
```

The app should now be accessible over https on port 8443 at:

```
https://local.gasket.dev-godaddy.com:8443
```

### Give your code a home on Github Enterprise

```bash
cd {{{appName}}}
git init  # if not already initialized
git remote add origin git@github.com:YOURORG/YOUR-REPO.git
```

### Going to production?

Create an appcode in GoDaddy Cloud UI:

```bash
open https://cloud.int.godaddy.com/grouping/appregs/new
```

### Documentation

Generated docs will be placed in the `.docs` directory. To generate markdown documentation for the API, run:

```bash
npm run docs
```

### App Router

This Gasket app uses Next.js 14 with [App Router] which allows for intuitive, file-based routing within the app directory. The integration with Next.js 14 enhances development by leveraging features like automatic static optimization and server-side rendering, ensuring a scalable and efficient web application.

### HTTPS Proxy

The HTTPS proxy in this Gasket app forwards requests to the default Next.js server, enabling HTTPS for development and support on deployed servers.

### TypeScript & App Router

When using TypeScript with Next.js and Gasket on the default Next.js server, the App Router files omit extensions at the root level. This is because Next.js builds TypeScript in a CommonJS (CJS) environment, while Gasket is set to type: module for ES Modules (ESM). This difference requires careful handling to ensure compatibility between the two environments.

Additionally, Gasket files like gasket.ts, gasket-data.ts, intl.ts, and app-level plugins can all be written in TypeScript. This allows for type safety and better tooling support across the Gasket app, even as it integrates with Next.js’s CJS environment.

#### ESM & TypeScript

A common workaround when using ESM in a TypeScript project with `"type": "module"` set in `package.json` is to import `.ts` files using the `.js` extension. For example:

```ts
import { myFunction } from './myModule.js';
```

Here, `myModule.ts` is the actual TypeScript file, but it's imported using the `.js` extension. TypeScript is able to resolve `myModule.ts` to `myModule.js`, making the import work at runtime.

For more information, see the extended documentation in the [Gasket TypeScript] doc and the [@gasket/plugin-typescript] package.


### Docusaurus

When using [Docusaurus], generated docs will be available at `http://localhost:3000` when running the [Docusaurus] server. By default the Docusaurus server is started with the `docs` script. Add the `--no-view` option to only generate the markdown files.

<!-- LINKS -->
[App Router]: https://nextjs.org/docs/app
[Page Router]: https://nextjs.org/docs/pages
[Custom Server]: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[tsx]: https://tsx.is/
[@gasket/plugin-typescript]: https://gasket.dev/docs/plugins/plugin-typescript/
[Gasket TypeScript]: https://gasket.dev/docs/typescript/
[App Router]: https://nextjs.org/docs/app
[Docusaurus]: https://docusaurus.io/
