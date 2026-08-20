# Requiring Authentication

Gasket gives you tools for securing parts of your app with GoDaddy SSO. The
[@godaddy/gasket-auth] components provide several configuration options,
including such things and either `jomax` or `idp` realms. Authentication is
enabled by the [@godaddy/gasket-plugin-auth], which also provides tools for
additional server-side checks.

## Authentication layers

Authentication can be required at different layers of your app:

- [App](#secure-an-app)
- [Page](#secure-a-page)
- [Component](#secure-a-component)
- [Component content](#secure-component-content)
- [Endpoints](#secure-endpoints)

For each of the examples below, we will require `jomax` auth. Refer to the
[@godaddy/gasket-auth docs][@godaddy/gasket-auth] for additional auth options
your app may choose to use.

### Secure an App

To secure every page on your app, use the `withAuthRequired` from
[@godaddy/gasket-auth] in conjunction with
[`withPageEnhancers`][withPageEnhancers] from [@godaddy/gasket-next].

```jsx
// pages/_app.js

import { App, withPageEnhancers } from '@godaddy/gasket-next';
import { withAuthRequired } from '@godaddy/gasket-auth';

export default withPageEnhancers([
  withAuthRequired({ realm: 'jomax' })
])(App);
```

Now, when any page is accessed in your app, authentication will be checked.
These checks occur during SSR, and a redirect response to SSO login will be sent
to the browser instead of your app code for unauthed requests.

### Secure a Page

If you want specific pages in your app to be open, and other to require auth,
then instead of updating the `_app.js`, use `withAuthRequired` on a particular
page. Let's, for example, you have two pages, `unsecure.js` and `secure.js`, the
latter of which you want to require auth.

```jsx
// pages/secure.js

import { withAuthRequired } from '@godaddy/gasket-auth';

const SecurePage = () => {
  return <div>Sensitive content<div/>
}

export default withAuthRequired({ realm: 'jomax' })(SecurePage);
```

Now, if the /secure route is requested directly by the browser, the auth check
will be performed server-side, and an SSO login redirect response sent. If
instead, a user lands on the /unsecure route, then client routes to the /secure
page, the auth check will be performed client-side, but a redirect will still
occur.

### Secure a Component

Sometimes, especially for shared components used across apps, you will want to
require auth on components, which may be used in pages or other components in an
app.

Make your component:

```jsx
// components/secret-stuff.js

import { withAuthRequired } from '@godaddy/gasket-auth';

const SecureStuff = () => {
  return <div>Sensitive content<div/>
}

export default withAuthRequired({ realm: 'jomax' })(SecureStuff);
```

Then use it in an unsecured page:

```jsx
// pages/secure-content.js

import SecureStuff from '../components/secure-stuff.js';

const SecureContentPage = () => {
  return (
    <div>
      <h1>Page with a mix of secured content</h1>
      <p>Unsecured stuff</p>
      <SecureStuff/>
    <div/>
  )
}

export default SecureContentPage;
```

Redirect responses from the server only happen when `withAuthRequired` is used
at the page or app layer. In this case, the app will load in the browser, but
the redirect will occur when the component mounts.

### Secure component content

If instead, you need to require auth for specific content within a component,
you can also use the `<AuthReqiured />` component. This can trigger an SSO login
redirect as well, but more commonly would be used with the `alt` prop to display
alternative content to unauthenticated users.

```jsx
// components/secure-things.js

import { AuthRequired } from '@godaddy/gasket-auth';

export default () => {
  return (
    <div>
      <h4>Component with a mix of secured content</h4>
      <p>Unsecured things</p>
      <AuthRequired realm='jomax' alt={<i>Auth is required see.</i>}>
        <p>Secured things</p>
      </AuthRequired>
    <div/>
  )
}
```

The `alt` prop is available for the `withAuthRequired` as well.

### Secure endpoints

Although it should be sufficient to secure your app using the component as
demonstrated above, there is a way to secure other requests to endpoints besides
your page routes. To check auth for other requests to the server, you can use
the `checkAuth` method made available to the req object by the
[@godaddy/gasket-plugin-auth] middleware.

For example, say you need to expose an endpoint using the `express` lifecycle.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        middleware: {
          timing: {
            after: ['@gasket/plugin-auth'] // handle AFTER checkAuth has been add by auth-plugin
          },
          handler: function express(gasket, app) {
            app.get('/api/secrets', async (req, res) => {
              try {
                const { valid, reason } = await req.checkAuth({realm: 'jomax', risk: 'medium'})
                if (valid) {
                  // Authenticated: continue
                  res.send('Secret content')
                } else {
                  // Unauthenticated: exit
                  res.status(401).send(reason)
                }
              } catch(err) {
                // Unauthenticated: exit
                res.status(401).send()
              }
            });
          }
        }
      }
    }
  ]
});
```

As a note, significant or complex server APIs should be implemented as
standalone services, independent of your web app. This example above should be
an edge-case for a Gasket app.

<!-- LINKS -->

[@godaddy/gasket-auth]:/packages/gasket-auth/README.md
[@godaddy/gasket-next]:/packages/gasket-next/README.md
[withPageEnhancers]:/packages/gasket-next/README.md
[@godaddy/gasket-plugin-auth]:../README.md
