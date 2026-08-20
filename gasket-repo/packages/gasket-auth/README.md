# @godaddy/gasket-auth

Components and functions for securing features of web apps. Require
authentication at the component or page level. Works for both client and server
render.

- Components
  - [withAuthProvider]
  - [withAuthRequired]
  - [AuthRequired]

- Functions:
  - [authGetInitialProps]
  - [authGetServerSideProps]
  - [useAuthState]
  - [authFetch]
  - [makeAuthFetch]

  - [App Router Setup]

## Options

The various options can be categorized into two main types as follows:

### AuthParams

AuthParams are the options with `checkAuth` during SSR, or passed as query
params from the browser to the validation endpoint. They are the criteria for
authentication.

- `realm` - (string) Where the token should originate from; also called `typ`.
  - one of: `idp` (default), `idp_int`, `jomax`, `cert` and `pass`
- `risk` - (string) idp risk level.
  - one of: `low`(default), `medium`, `high`
- `type` - (string[]) Allowed *idp* token types; also called `auth`.
  - one or more of: `basic` (default), `s2s`, `e2s`, `e2s2s`, etc.
- `groups` - (string[]) Allowed *jomax* admin groups.
  An employee must have at least one of the specified groups when logged in to
  jomax realm, or when impersonating. This option can only be combined with
  *jomax* realm, or *idp* realm for *e2s* or *e2s2s* types.
- `allowHeartbeat` - (boolean) Perform heartbeat request when VAT is expired.

### AuthProps

AuthProps are the options for how to render or handle redirects once the
AuthParams have been validated.

- `alt` - (string|node) What to render for failed auth. Otherwise, a redirect to
  SSO login page will occur.
- `loading` - (string|node) Content to render while loading, otherwise null.
- `injectDetails` - (boolean) Optional injects `authDetails` to props of children.
  Always injected when using HOC.
  - `authDetails` - (object) may contain information such as `cid`, `shopperId`,
    `plid`, etc
- `ssoRedirectOverride` - (string) url to override the default sso redirect url.
  Intended for use on individual pages (not for the entire app) to redirect to
  offer logins.
- `ssoRedirectSubdomain` - (function|boolean) This can be used to customize the
  subdomain look up logic for setting the query param to SSO. See the
  [SSO subdomain examples](#example-with-sso-subdomain).

## Components

### withAuthProvider

**_Required_**

Higher-order component to make the auth context available through the Next.js
App allowing the auth context to be available to all pages and components.
Once an auth criteria is validated, it does not have to be rechecked by each
component that may require it.

**Signature**

- `withAuthProvider()`

```js
import { withAuthProvider } from '@godaddy/gasket-auth';

const App = createApp({ initialProps: true });

export default withAuthProvider()(App);
```

### withAuthRequired

Higher-order component to wrap pages or components.

For page components, `getInitialProps` is set up. Auth check will then occur on
the server, and redirects happen without rendering the page. When in the
browser, auth checks will occur between route changes.

Because `getServerSideProps` is not compatible with `getInitialProps`, you can
disable it with `initialProps: false` in the options. If you need to use
`getServerSideProps` for a page, you can also use [authGetServerSideProps] with
it.

**Signature**

- `withAuthRequired({ ...authParams, ...authProps })`

**Props**

- All [AuthParams] and [AuthProps] are available.
- `initialProps` - (boolean) By default, `getInitialProps` is added to wrapped
  page components. Set this to `false` to disable it.
- `injectDetails` - (boolean) By default, the HOC injects `authDetails` to props of
  children. Set this to `false` to disable this behavior.
- `initialProps` - (boolean) Enable `getInitialProps` when used with page components.
- `gasket` - (Gasket) If getInitialProps is enabled by either the previous options,
  or because the page already has `getInitialProps`, then the `gasket` instance
  is required to enable server-side checks.

#### Example with HOC

This is the simplest and likely most common use case.

```jsx
import gasket from 'path-to-gasket.js';
import { withAuthRequired } from '@godaddy/gasket-auth';

function SensitivePage() {
  return <div>Sensitive content<div/>
}

export default withAuthRequired({ initialProps: true, gasket })(SensitivePage);
```

#### Example with HOC options

Additional options can be set, and the HOC used on a component, not just pages.
This can also useful for shared components across GoDaddy Gasket apps.

```jsx
import gasket from 'path-to-gasket.js';
import { withAuthRequired } from '@godaddy/gasket-auth';

function InternalComponent() {
  return <div>Sensitive content<div/>
}

const options = { realm: 'jomax', groups:['ImportantPeople'], gasket };

export default withAuthRequired(options)(InternalComponent);
```

#### Example with App redirect

The HOC `withPageEnhancers` from `@godaddy/gasket-next` can use
`withAuthRequired` to ensure pages are only accessible with valid
authentication. This will redirect users with invalid credentials to SSO.

```jsx
import gasket from 'path-to-gasket.js';
import { withAuthProvider, withAuthRequired } from '@godaddy/gasket-auth';
import { App, withPageEnhancers } from '@godaddy/gasket-next';

const authRequired = withAuthRequired({ realm: 'jomax', groups:['ImportantPeople'], gasket });

export default withAuthProvider()(
  withPageEnhancers([authRequired])(App)
);
```

#### Example with SSO Subdomain

Generally, you only need the `app` key to redirect back to your app properly.
However, for CICD bucketed builds, you may need to redirect back to a dynamic
subdomain (i.e. `sha1234.my-app`). The default behavior is to add the
`subdomain=` query param, only if the subdomain has 2 or more parts.

This behavior can be disabled by setting this prop to `false`, or by providing a
function to return a subdomain based on the `host` argument.

```jsx
import gasket from 'path-to-gasket.js';
import { withAuthRequired } from '@godaddy/gasket-auth';

function InternalComponent() {
  return <div>Sensitive content<div/>
}

// example to only set sso subdomain if 3 or more parts
function customSubdomain(host) {
  const parts = host.split(':')[0].split('.').slice(0, -2);
  if(split.length >= 3) return parts.join('.')
}

const options = { realm: 'jomax', ssoRedirectSubdomain: customSubdomain, gasket };

export default withAuthRequired(options)(InternalComponent);
```

### AuthRequired

Higher-order component to wrap pages or components.

**Signature**

- `<AuthRequired { ...authParams, ...authProps }>`

**Props**

- All [AuthParams] and [AuthProps] are available.

#### Example with component

In some cases, it may be useful to secure only parts of a component, and without
redirecting to SSO. This can be done with the `<AuthRequired>` component, and
setting `alt` with content to show for unauthenticated views.

```jsx
import { AuthRequired } from '@godaddy/gasket-auth';

export default function PartialContentComponent() {
  return (
    <div>
      This text will always be visible.

      <AuthRequired
        realm='jomax'
        groups={['ImportantPeople']}
        loading='Checking to see if you are important'
        alt='Sorry, you are not important.'>
        Congrats, you are important!
      </AuthRequired>
    <div/>
  );
}
```

## Functions

### authGetInitialProps

Similar to [withAuthRequired] in that it performs an auth check and populates
initial props, however without any component render gating. This is useful for
pre-auth checks to avoid round trip validate requests for non-page-level
[AuthRequired] components.

**Signature**

- `authGetInitialProps({ ...authParams, alt })`

**Props**

- All [AuthParams] are available.
- `alt` - (string) Can be set to avoid redirecting (i.e. `noredirect`)

#### Example

Use `authGetInitialProps` with `noredirect` if you still want to show the page
but hide certain content.

```js
import { authGetInitialProps, AuthRequired } from '@godaddy/gasket-auth';

function SensitiveContent() {
  return <>
    <AuthRequired type={ ['basic', 'e2s', 's2s', 'e2s2s'] }>
      <p>Sensitive content for shoppers, delegates, and impersonators</p>
    </AuthRequired>
    <AuthRequired type={ ['basic', 'e2s'] } alt='no delegates allowed'>
      <p>Sensitive content NOT available to delegates, but do not redirect</p>
    </AuthRequired>
  </>;
}

function MyPage() {
  return <>
    <p>Anybody can see this content on the page</p>
    <SensitiveContent/>
  </>;
}

const shopperOnlyAuth = authGetInitialProps({ type: ['basic', 'e2s'], alt: 'noredirect' });
const commonAuth = authGetInitialProps({ type: ['basic', 'e2s', 's2s', 'e2s2s'], alt: 'noredirect' });

export default shopperOnlyAuth(commonAuth(MyPage));
```

In this example, we check for both auth types, but do not perform a redirect
during the get initial props checks.

### authGetServerSideProps

Perform an auth check on the server for page requests. This happens even when
routing to a page in the browser. This is suitable for apps with single pages or
infrequent routing changes.

If you expect users to change routes regularly, a more performant option is to
use `getInitialProps` from [withAuthRequired].

**Signature**

- `authGetServerSideProps({ ...authParams, alt })`

**Props**

- All [AuthParams] are available.
- `alt` - (string) Can be set to avoid redirecting (i.e. `noredirect`)

#### Example

When using `authGetServerSideProps`, the check will occur with a server request,
during SSR and each time you navigate to the page in the client routing.

```jsx
import { authGetServerSideProps } from '@godaddy/gasket-auth';

export default function InternalComponent() {
   return <div>Sensitive content<div/>
}

const options = { realm: 'jomax' };

export const getServerSideProps = authGetServerSideProps(options);
```

#### Example with Component

If you want to render alternative content for unauthorized users, but need to
also use `authGetServerSideProps`, you can specify the `alt` option for both
your component (or HOC) and `authGetServerSideProps`.

```jsx
import { AuthRequired, authGetServerSideProps } from '@godaddy/gasket-auth';

const options = { realm: 'jomax', alt: 'Sorry, not allowed' };

export default function InternalComponent() {
   return <AuthRequired { ...options }>Sensitive content</AuthRequired>
}

export const getServerSideProps = authGetServerSideProps(options);
```

### useAuthState

This React hook is available for client-side only situations where the
[auth components] don't provide the behavior required.

**Signature**

- `useAuthState({ ...authParams, alt })`

**Props**

- All [AuthParams] are available.
- `alt` - (string|node) Should be specified if you do not with to redirect.

#### Example

```jsx
import { useAuthState, AuthStatus } from '@godaddy/gasket-auth';

export default function MySecureComponent(props) {
  const authState = useAuthState(props);

  if (authState.valid) return 'You made it.';
  if (authState.status === AuthStatus.LOADING) return 'Checking things out...';
  return 'Sorry, nothing here for you.';
}
```

### authFetch

A client-side only wrapper around `@gasket/fetch`. Will return back the response
from fetch or in case of a 401(unauthorized) will redirect the user to the SSO
page. The redirect uses the default `idp` realm. To redirect to a different
realm (e.g. `jomax` for internal apps), use [makeAuthFetch] instead.

**Signature**

- `authFetch(url, [options])`

**Props**

- All the same options from [Fetch API] are available.

### Example fetch

Similar to `@gasket/fetch`, you must provide a url and an opts object.
`authFetch` will pass through these two parameters to the underlying
`@gasket/fetch` call.

If a request to an endpoint returns a 401 (Unauthorized), then the user will be
directed to SSO. Upon successful login, the user will then be redirected back to
the page where the auth fetch failed. The `Response` object will have an added
`ssoRedirect` property set to `true` if a redirect has taken place.

```js
import { authFetch } from '@godaddy/gasket-auth';

async function sendShopperData(shopper) {
  const response = await authFetch('https://shopperapi.com', {
    method: 'POST',
    body: { email: shopper.email, item: shopper.item },
    headers: {
      'Accept': 'application/json',
      'Cookie': 'auth_idp=mock_auth_idp',
      // example extra headers
      'X-App-Key': 'winback',
      'X-Shopper-Id': '101010'
    }
  });

  const responseBody = await response.json();
  return responseBody;
}
```

### makeAuthFetch

`makeAuthFetch` is a factory that returns an [authFetch]-style function bound to
a set of [AuthProps]. This allows customization of the SSO Url for 401 redirects
instead of always defaulting to `idp`. The redirect URL is built the same way as
the component and SSR flows (via `ClientHandler.getRedirectUrl`), honoring
`realm`, `ssoRedirectOverride`, and `ssoRedirectSubdomain`.

Calling `makeAuthFetch()` with no config is equivalent to using `authFetch`
directly.

**Signature**

- `makeAuthFetch([authProps])` → `(url, [options]) => Promise<Response>`

**Props**

- `authProps` - (object) Optional [AuthProps] used to build the SSO redirect on
  a 401. Commonly `realm`, plus `ssoRedirectOverride` / `ssoRedirectSubdomain`.

```js
import { makeAuthFetch } from '@godaddy/gasket-auth';

// Internal app: redirect to the jomax realm on a 401
const jomaxAuthFetch = makeAuthFetch({ realm: 'jomax' });

async function loadAdminData() {
  const response = await jomaxAuthFetch('https://internalapi.com/admin', {
    headers: { 'Accept': 'application/json' }
  });

  if (response.ssoRedirect) return; // redirected to SSO (jomax)

  return response.json();
}
```

## App Router Setup

The Gasket Auth components require React Context, which can only be used in the browser for App Router. Therefore, you need to make sure the page you want to add auth to is marked as a client component.

To wire it up, you'll need to set `"use client"` in a Page component, then add [withAuthProvider]. Any nested component can then use [AuthRequired], [useAuthState], etc.

```diff
// page.jsx
+ 'use client';
import React from 'react';

+ import { withAuthProvider } from '@godaddy/gasket-auth';
import WelcomeMessage from '../../../components/welcome-message';

function IndexPage() {
  return <WelcomeMessage />;
}

+ export default withAuthProvider()(IndexPage);
```
<!-- LINKS -->
[Fetch API]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

[auth components]: #components
[AuthParams]: #authparams
[AuthProps]: #authprops
[withAuthProvider]: #withauthprovider
[withAuthRequired]: #withauthrequired
[AuthRequired]: #authrequired
[authGetInitialProps]: #authgetinitialprops
[authGetServerSideProps]: #authgetserversideprops
[useAuthState]: #useauthstate
[authFetch]: #authfetch
[makeAuthFetch]: #makeauthfetch
[App Router Setup]: #app-router-setup

