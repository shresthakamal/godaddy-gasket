# @godaddy/gasket-auth Examples

This document provides working examples for all exported methods, HOCs, and functions from `@godaddy/gasket-auth`.

## Table of Contents

- [Higher-Order Components (HOCs)](#higher-order-components-hocs)
  - [withAuthProvider](#withauthprovider)
  - [withAuthRequired](#withauthrequired)
- [React Components](#react-components)
  - [AuthRequired](#authrequired)
- [React Hooks](#react-hooks)
  - [useAuthState](#useauthstate)
- [Next.js Functions](#nextjs-functions)
  - [authGetInitialProps](#authgetinitialprops)
  - [authGetServerSideProps](#authgetserversideprops)
- [Utility Functions](#utility-functions)
  - [authFetch](#authfetch)
  - [makeAuthFetch](#makeauthfetch)
- [Constants \& Enums](#constants--enums)
  - [AuthStatus](#authstatus)
  - [AuthRealm](#authrealm)
  - [AuthRisk](#authrisk)
- [Complete Example App](#complete-example-app)
- [App Router Setup](#app-router-setup)

## Higher-Order Components (HOCs)

### withAuthProvider

The `withAuthProvider` HOC provides authentication context to your app. Use it at the root level.

```jsx
// pages/_app.js
import { createApp } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';

function Layout(props) {
  const { Component, pageProps } = props;

  return (
    <Component {...pageProps} />
  );
}

const App = createApp({ Layout });

export default withAuthProvider()(App);
```

### withAuthRequired

The `withAuthRequired` HOC secures components by requiring authentication.

```jsx
// pages/secure-page.js
import { withAuthRequired } from '@godaddy/gasket-auth';
import gasket from '../gasket.js';

function SecurePage() {
  return (
    <div>
      <h1>Secure Content</h1>
      <p>Only authenticated users can see this.</p>
    </div>
  );
}

// Basic auth requirement
export default withAuthRequired({
  realm: 'jomax',
})(SecurePage);

// For use with getInitialProps
export default withAuthRequired({
  realm: 'jomax',
  initialProps: true,
  gasket // must be passed with initialProps: true
})(SecurePage);
```

```jsx
// With additional options
export default withAuthRequired({
  realm: 'idp',
  risk: 'medium',
  groups: ['admin', 'manager'],
  gasket,
  initialProps: true,
  injectDetails: true
})(SecurePage);
```

```jsx
// Injecting auth details into component
function UserProfile({ authDetails }) {
  return (
    <div>
      <h1>Welcome, {authDetails?.accountName}</h1>
      <p>Groups: {authDetails?.groups?.join(', ')}</p>
    </div>
  );
}

export default withAuthRequired({
  realm: 'jomax',
  injectDetails: true,
})(UserProfile);
```

## React Components

### AuthRequired

The `AuthRequired` component provides conditional rendering based on authentication state.

```jsx
// Basic usage with redirect to SSO
import { AuthRequired } from '@godaddy/gasket-auth';

export default function MixedContentPage() {
  return (
    <div>
      <h1>Public Content</h1>
      <p>Anyone can see this.</p>

      <AuthRequired realm="jomax">
        <p>This content requires authentication.</p>
      </AuthRequired>
    </div>
  );
}
```

```jsx
// With alternative content instead of redirect
export default function ConditionalContent() {
  return (
    <div>
      <AuthRequired
        realm="idp"
        alt={<p>Please log in to see exclusive content.</p>}
      >
        <div>
          <h2>Exclusive Member Content</h2>
          <p>Special offers and deals here!</p>
        </div>
      </AuthRequired>
    </div>
  );
}
```

```jsx
// With loading state and auth details injection
export default function DetailedAuthContent() {
  return (
    <AuthRequired
      realm="jomax"
      groups={['admin']}
      loading={<div>Verifying permissions...</div>}
      injectDetails={true}
      alt={<p>Admin access required.</p>}
    >
      {({ authDetails }) => (
        <div>
          <h2>Admin Panel</h2>
          <p>Welcome, {authDetails.accountName}</p>
          <p>Your groups: {authDetails.groups.join(', ')}</p>
        </div>
      )}
    </AuthRequired>
  );
}
```

## React Hooks

### useAuthState

The `useAuthState` hook provides authentication state within components.

```jsx
import { useAuthState, AuthStatus } from '@godaddy/gasket-auth';

export default function AuthStatusComponent() {
  const authState = useAuthState({
    realm: 'idp',
    risk: 'low'
  });

  if (authState.status === AuthStatus.LOADING) {
    return <div>Checking authentication...</div>;
  }

  if (authState.status === AuthStatus.ERROR) {
    return <div>Authentication error occurred.</div>;
  }

  if (authState.valid) {
    return (
      <div>
        <h2>Welcome!</h2>
        <p>Account: {authState.details?.accountName}</p>
        <p>Customer ID: {authState.details?.customerId}</p>
      </div>
    );
  }

  return <div>Authentication required.</div>;
}
```

```jsx
// Using with different auth requirements
export default function MultiAuthComponent() {
  const basicAuth = useAuthState({ realm: 'idp' });
  const adminAuth = useAuthState({
    realm: 'jomax',
    groups: ['admin']
  });

  return (
    <div>
      {basicAuth.valid && (
        <div>Basic user content</div>
      )}

      {adminAuth.valid && (
        <div>Admin-only content</div>
      )}
    </div>
  );
}
```

## Next.js Functions

### authGetInitialProps

The `authGetInitialProps` function creates a higher-order function for Next.js pages.

```jsx
// pages/profile.js
import { authGetInitialProps } from '@godaddy/gasket-auth';
import gasket from '../gasket.js';

function ProfilePage({ user }) {
  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {user.name}</p>
    </div>
  );
}

// Apply auth to existing getInitialProps
ProfilePage.getInitialProps = async (ctx) => {
  return {
    user: { name: 'John Doe' }
  };
};

export default authGetInitialProps({
  realm: 'idp',
  gasket
})(ProfilePage);
```

```jsx
// With no redirect option
export default authGetInitialProps({
  realm: 'idp',
  alt: 'noredirect',
  gasket
})(ProfilePage);
```

### authGetServerSideProps

The `authGetServerSideProps` function creates server-side authentication for Next.js pages.

```jsx
// pages/admin.js
import { authGetServerSideProps } from '@godaddy/gasket-auth';
import gasket from '../gasket.js';

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Administrative content here.</p>
    </div>
  );
}

export const getServerSideProps = authGetServerSideProps({
  realm: 'jomax',
  groups: ['admin'],
  gasket
});
```

```jsx
// With custom props and alternative content
export const getServerSideProps = authGetServerSideProps({
  realm: 'idp',
  alt: 'Sorry, access denied.',
  gasket
});
```

## Utility Functions

### authFetch

The `authFetch` function provides automatic SSO redirect on 401 responses when used in the browser.

```jsx
import { authFetch } from '@godaddy/gasket-auth';

export default function DataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authFetch('/api/user-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setData(userData);
        } else if (response.ssoRedirect) {
          // User was redirected to SSO
          console.log('Redirected to SSO for authentication');
        }
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    fetchData();
  }, []);

  return data ? (
    <div>User data: {JSON.stringify(data)}</div>
  ) : (
    <div>Loading...</div>
  );
}
```

```jsx
// POST request with body
const submitForm = async (formData) => {
  const response = await authFetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  if (response.ssoRedirect) {
    return; // User was redirected to SSO
  }

  return response.json();
};
```

### makeAuthFetch

Customize the `authFetch` function for specific realms or configurations.

```jsx
import { makeAuthFetch } from '@godaddy/gasket-auth';

// Bind a fetch to the jomax realm once, then reuse it
const jomaxAuthFetch = makeAuthFetch({ realm: 'jomax' });

export default function AdminData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await jomaxAuthFetch('/api/admin-data', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setData(await response.json());
      } else if (response.ssoRedirect) {
        // User was redirected to SSO for the jomax realm
        console.log('Redirected to SSO (jomax) for authentication');
      }
    };

    load();
  }, []);

  return data ? <div>Admin data: {JSON.stringify(data)}</div> : <div>Loading...</div>;
}
```

You can also configure the redirect base and subdomain via `ssoRedirectOverride`
and `ssoRedirectSubdomain`:

```jsx
const authFetch = makeAuthFetch({
  ssoRedirectOverride: 'https://sso.example.com/login'
});
```

Calling `makeAuthFetch()` with no arguments is equivalent to importing and using
`authFetch` directly.

## Constants & Enums

### AuthStatus

Authentication status constants for checking auth state.

```jsx
import { AuthStatus } from '@godaddy/gasket-auth';

function AuthStatusDisplay({ authState }) {
  switch (authState.status) {
    case AuthStatus.LOADING:
      return <div>🔄 Checking authentication...</div>;

    case AuthStatus.LOADED:
      return authState.valid ?
        <div>✅ Authenticated</div> :
        <div>❌ Not authenticated</div>;

    case AuthStatus.ERROR:
      return <div>⚠️ Authentication error</div>;

    default:
      return <div>Unknown status</div>;
  }
}
```

### AuthRealm

Authentication realm constants for specifying authentication domains.

```jsx
import { AuthRealm } from '@godaddy/gasket-auth';

// Use predefined realm constants
const authConfigs = {
  customer: { realm: AuthRealm.idp },
  employee: { realm: AuthRealm.jomax },
  partner: { realm: AuthRealm.pass },
  certificate: { realm: AuthRealm.cert },
  aws: { realm: AuthRealm.awsiam }
};

function getAuthConfig(userType) {
  return authConfigs[userType] || authConfigs.customer;
}
```

### AuthRisk

Authentication risk level constants for security requirements.

```jsx
import { AuthRisk } from '@godaddy/gasket-auth';

// Risk-based authentication examples
const securityLevels = {
  publicContent: { realm: 'idp', risk: AuthRisk.low },
  userAccount: { realm: 'idp', risk: AuthRisk.medium },
  adminPanel: { realm: 'jomax', risk: AuthRisk.high }
};

export default function SecureSection({ level }) {
  const authProps = securityLevels[level];

  return (
    <AuthRequired {...authProps}>
      <div>Content secured at {level} level</div>
    </AuthRequired>
  );
}
```

## Complete Example App

Here's a complete example showing multiple authentication patterns:

```jsx
// pages/_app.js
import { createApp } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';

function Layout({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

const App = createApp({ Layout });
export default withAuthProvider()(App);
```

```jsx
// pages/mixed-content.js
import { AuthRequired, useAuthState, AuthStatus } from '@godaddy/gasket-auth';

export default function MixedContentPage() {
  const guestAuth = useAuthState({ realm: 'idp' });

  return (
    <div>
      <h1>Welcome to Our Site</h1>

      {/* Public content */}
      <section>
        <h2>Public Information</h2>
        <p>This content is visible to everyone.</p>
      </section>

      {/* Conditional content based on auth state */}
      <section>
        {guestAuth.status === AuthStatus.LOADING && (
          <p>Checking login status...</p>
        )}

        {guestAuth.valid ? (
          <div>
            <h2>Welcome back, {guestAuth.details?.accountName}!</h2>
            <p>Your member benefits are ready.</p>
          </div>
        ) : (
          <div>
            <h2>Member Benefits</h2>
            <p>Sign in to access exclusive content.</p>
          </div>
        )}
      </section>

      {/* Protected content with redirect */}
      <AuthRequired realm="idp">
        <section>
          <h2>Member-Only Content</h2>
          <p>This section requires authentication.</p>
        </section>
      </AuthRequired>

      {/* Protected content with alternative */}
      <AuthRequired
        realm="jomax"
        groups={['admin']}
        alt={<p>Admin access required for this section.</p>}
      >
        <section>
          <h2>Admin Controls</h2>
          <button>Delete User</button>
          <button>Modify Settings</button>
        </section>
      </AuthRequired>
    </div>
  );
}
```

## App Router Setup

Auth components use React context, therefore you must designate the page component to be a client component with `'use client'`

```jsx
// page.jsx
'use client';
import React from 'react';

import { withAuthProvider } from '@godaddy/gasket-auth';
import WelcomeMessage from '../../../components/welcome-message';

function IndexPage() {
  return <WelcomeMessage />;
}

export default withAuthProvider()(IndexPage);
```

```jsx
// welcome-message.jsx
import React from 'react';
import { AuthRealm, withAuthRequired } from '@godaddy/gasket-auth';

function WelcomeMessage() {
  return "Welcome to the app!"
}

const options = { realm: AuthRealm.jomax };

export default withAuthRequired(options)(WelcomeMessage);
```
