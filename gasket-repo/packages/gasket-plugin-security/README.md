# @godaddy/gasket-plugin-security

Adds security features for GoDaddy Gasket apps.

## Installation

This plugin is already included by [@godaddy/gasket-preset-webapp]. The
following steps are only necessary if that preset is not used.

#### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-security
```

#### Existing apps

```
npm i @godaddy/gasket-plugin-security
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginSecurity from '@godaddy/gasket-plugin-security';

export default makeGasket({
  plugins: [
+   pluginSecurity
  ]
});
```


## Configuration

This plugin sets up the [Helmet] middleware. It can be configured by setting the
`helmet` property in the `gasket.js`, using any options available as
described in the [helmet docs].

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // ...
  ],
  helmet: {
    xPermittedCrossDomainPolicies: {
      permittedPolicies: 'all'
    }
  }
});
```

Additionally, apps and plugins can hook the `helmet` lifecycle, described below.

## Actions

### insertCspHash

This action the Content Security Policy (CSP) header in an HTTP response to add a hash directive while ensuring that the 'unsafe-inline' directive is removed.

Parameters:

- res: The HTTP response object, which contains the headers to be modified.
- type: The type of CSP directive to be modified (e.g., script-src).
- cspHash: The hash value to be added to the CSP directives.

### addCspNonce

This action modifies the Content Security Policy (CSP) header in an HTTP response to add a nonce directive while ensuring that the 'unsafe-inline' directive is removed.

Parameters:

- res: The HTTP response object, which contains the headers to be modified.
- type (optional): The type of CSP directive to be modified (default is 'script-src').

### addCspHash

This action handler modifies the Content Security Policy (CSP) header in an HTTP response by adding hash directives for the provided content.

Parameters:

- res: The HTTP response object, which contains the headers to be modified.
- type: The type of CSP directive to be modified (e.g., script-src).
- ...contents: A variadic parameter representing the content strings for which hashes will be generated and added to the CSP directives.

## Lifecycles

### helmet

To adjust the Helmet config dynamically based on a request or other
configuration, you can use the `helmet` lifecycle in your app or plugin.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        helmet(gasket, helmetConfig, { req, res }) {
          const { env } = gasket.config;

          // Do something different based on env
          if(env.includes('local')) {
            helmetConfig.hsts = false;
          }

          return helmetConfig;
        }
      }
    }
  ]
});
```

### contentSecurityPolicy

A Content Security Policy (CSP) can be configured using this lifecycle. The CSP configuration can be set in three ways:

1. Disabled (default):
```js
// gasket.js
export default makeGasket({
  helmet: {
    contentSecurityPolicy: false
  }
});
```

2. Using custom helmet CSP configuration:
```js
// gasket.js
export default makeGasket({
  helmet: {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        // ... other directives
      }
    }
  }
});
```

3. Using default directives:
```js
// gasket.js
export default makeGasket({
  helmet: {
    contentSecurityPolicy: {
      enabled: true
    }
  }
});
```

> ⚠️ **DEPRECATED:** The Content Security Policy tooling in this plugin is deprecated and will be removed in a future version. Consider using helmet's built-in CSP configuration directly.

If a `contentSecurityPolicy` is already configured or disabled for the `helmet`
config, this lifecycle will not run, otherwise it will be used to configure it
for Helmet.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        async contentSecurityPolicy(gasket, directives, context, utils) {
          // Request and Response objects available from context
          const { req } = context;
          const { plid } = await gasket.actions.getVisitor(req);

          // Do something different based on a plid
          if(plid === 495469) {
            directives['script-src'].push('another.domain.com')
          }

          return directives;
        }
      }
    }
  ]
});
```

The lifecycle also make some helper utility functions for working with generated
nonce or hash (sha256) directives. It is uncommon that you would need these,
consider the [response methods].

> ⚠️ **DEPRECATED:** The following CSP helper methods are deprecated and will be removed in a future version. Consider using helmet's built-in CSP configuration directly.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        async contentSecurityPolicy(gasket, directives, context, utils) {
          const { req } = context;

          // Helpers to create generated directive
          const { createHash, createNonce } = utils;

          // If you want to use a nonce for some content sources you can generate it
          // here and make it available when rendering the document
          const nonce = createNonce();
          directives['script-src'].push(nonce.directive)
          res.locals.nonce = nonce.value;

          // If you have some script content which will be rendered, add a hash for it
          if(req.someInlineScript) {
            const hash = createHash(req.someInlineScript);
            directives['script-src'].push(hash.directive)
          }

          return directives;
        }
      }
    }
  ]
});
```

The reason this is a separate lifecycle from the `helmet` lifecycle, is to also
allow it to be invoked for other uses other than with the Helmet middleware,
such as when using meta tags.

#### Disabled for local command

The Content Security Policy is disabled during the `gasket local` command, due
to inline and eval directives being required for Webpack/Next reloading. To test
the policy locally, instead use `gasket build` followed by `gasket start --env
local`. This will mimic your app's behavior when deployed.

## Methods

While [it is recommended][MDN CSP] to avoid using inline styles and scripts
altogether, there may be some cases where it cannot be avoided.

> 📌 **NOTE:** Currently, `style-src 'unsafe-inline'` is set due to inline
> styles being added by third-party scripts after document load. We will be
> investigating the best approach for these ([STGLS-308]). For now, be sure to
> secure all inline JavaScript content.

> ⚠️ **DEPRECATED:** The following CSP helper methods are deprecated and will be removed in a future version. Consider using helmet's built-in CSP configuration directly.

When the `contentSecurityPolicy` is configured, the middleware will also attach
a couple of helper methods to the Response object. This will allow you to add
generated nonce or hash (sha256) directives to the `content-security-policy`
response header.

These are particular useful when combined with rendering inline scripts in the
Next.js Document. See the [@godaddy/gasket-next] docs for added details.

### addCspHash

This response method can be used to add a hash for content that will be inlined
when rendering.

```js
function someMiddleware(req, res, next) {
  const customScript = `window.bogus = true`;

  // hash the script content and add directive to the script-src
  res.addCspHash('script-src', customScript)

  // some script content which will be rendered in a document
  res.locals.customScript = customScript;

  next();
}
```

### addCspNonce

This response method can be used to add a nonce value which can be used when
rendering inline content.

```js
function someMiddleware(req, res, next) {
  // create a nonce directive for script-src and get the value
  const value = res.addCspNonce('script-src');

  // make the nonce value available for rendering in the document
  res.locals.scriptNonce = value;

  next();
}
```

## Utilities

### getContentSecurityPolicy

This is already used when setting up the content security policy for Helmet
middleware. If you have a case where you want the policy for use *without*
Helmet, you can use this function to get the default directives and invoke the
[contentSecurityPolicy lifecycle].

```js
// gasket.js
import { makeGasket } from '@gasket/core';
const getContentSecurityPolicy = require('@godaddy/gasket-plugin-security/get-content-security-policy')

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        middleware(gasket) {
          return async function customMiddleware(req, res, next) {
            const policy = await getContentSecurityPolicy(gasket, { req, res });
            // do something with policy
            next();
          }
        }
      }
    }
  ]
});
```

<!-- LINKS -->

[contentSecurityPolicy lifecycle]:#contentsecuritypolicy
[response methods]:#methods

[@godaddy/gasket-preset-webapp]:/packages/gasket-preset-webapp/README.md
[@godaddy/gasket-next]:/packages/gasket-next/README.md#content-security-policy

[STGLS-308]:https://jira.godaddy.com/browse/STGLS-308

[helmet]:https://helmetjs.github.io
[helmet docs]:https://helmetjs.github.io/docs/
[MDN CSP]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_inline_script

