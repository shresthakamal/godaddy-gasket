# @godaddy/gasket-header-nav

Provides SPA navigation capabilities to the UXP application header navigation
links.

## What is this?

Gasket has a router that enables transitioning among pages without requiring a full page reload. Unfortunately, navigation links in the UX Platform's application header are standard links, so when you click on them you'll get a full page reload instead of fast in-page navigation. This package lets you set up navigation links that integrate with gasket's client-side routing along with additional header customizations.

## Installation

```shell
npm i --save @godaddy/gasket-header-nav
```

## Usage

Use one of the following links to find the appropriate usage documentation.

| Header Type | Application Header | Application Sidebar |
|-------------|--------------------|---------------------|
| Component   | [`<Navigation/>`](#navigation-component) | [`<SidebarNav/>`](#sidebarnav-component) |
| HOC         | [`withHeaderNav`](#withheadernav-hoc) | Not available |
| Hook        | Not available      | [`useSidebar`](#usesidebar-hook) |

### Navigation component

The `Navigation` component comes in two varieties: one for applications using the pages router and one for those using the apps router. If you're using the page router, use the default export from `@godaddy/gasket-header-nav`.

```jsx
// In /pages/_app.js

import React from 'react';
import { createApp } from '@godaddy/gasket-next';
import Navigation from '@godaddy/gasket-header-nav';

export default createApp({ Layout: ({ Page, pageProps }) => (
  <>
    <Navigation
      bottom={[
        { caption: 'A', href: '/a' },
        { caption: 'B', href: '/b' }
      ]}
    />
    <Page {...pageProps} />
  </>
) });
```

If your app is using the Next.js app router, you must import from a different location.

```jsx
// In layout.js

import * as React from 'react';
import { createApp } from '@godaddy/gasket-next';
import Navigation from '@godaddy/gasket-header-nav/layout';

export default function Layout(props) {
  return <>
    <Navigation
      bottom={[
        { caption: 'A', href: '/a' },
        { caption: 'B', href: '/b' }
      ]}
    />
    // ... other layout content
  </>
};
```

The component has the following props, all optional:

| Property    | Description                                                                                                                      |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------- |
| bottom      | An array of [Navigation Items](#navigation-items) to use for the "bottom" navigation of the header                               |
| right       | An array of [Navigation Items](#navigation-items) to use for the "right" navigation of the header                                |
| side        | An array of [Navigation Items](#navigation-items) to use for the left (or right, if the project is RTL) navigation of the header |
| top         | A single [Navigation Item](#navigation-items) to use for the "top" navigation link                                               |
| activeCheck | See [Active State Determination](#active-state-determination) for details                                                        |
| router      | Not required unless you're integrating with [`next-routes`](#advanced-routing-integration)                                       |
| onUpdate    | An optional callback providing the [header](https://github.com/gdcorp-uxp/application-header#api) after updating navigation |
| onClear     | An optional callback providing the [header](https://github.com/gdcorp-uxp/application-header#api) after updating navigation |


### withHeaderNav HOC

You can augment an existing component with the application header using the
`withHeaderNav` higher-order component:

```jsx harmony
import * as React from 'react';
import { withHeaderNav } from '@godaddy/gasket-header-nav';

const MyComponent = () => <div>...</div>;

export default withHeaderNav([
  { caption: 'A', href: '/a' },
  { caption: 'B', href: '/b' }
])(MyComponent);
```

`withHeaderNav` can take one of the following config parameters:

- A `props => navProps` function
- A plain object containing static navigation props
- An array, which will be used for the most common `bottom` navigation prop.

An App Router version of `withHeaderNav` is exported from the layout module.

```jsx
import { withHeaderNav } from '@godaddy/gasket-header-nav/layout';

const MyComponent = () => <div>...</div>;

export default withHeaderNav([
  { caption: 'A', href: '/a' },
  { caption: 'B', href: '/b' }
])(MyComponent);
```

When using the `withHeaderNav` HOC with App Router, be sure to add `use client` to the top of your component file. The HOC can only be used in a client component.

```diff
+ 'use client';
import * as React from 'react';
import { withHeaderNav } from '@godaddy/gasket-header-nav/layout';

const MyComponent = () => <div>...</div>;

export default withHeaderNav([
  { caption: 'A', href: '/a' },
  { caption: 'B', href: '/b' }
])(MyComponent);
```

### SidebarNav component

For applications using the sidebar variety of headers, use the `<SidebarNav/>` component. Two properties are required for `<SidebarNav/>` to integrate with a router.

| Property     | Description |
|--------------|-------------|
| `currentUrl` | The URL that the application is currently showing |
| `onNavigate` | Callback when navigation is clicked, receiving the URL to navigate to |

Here's how you set these props with the Next.js page router:

```jsx
// In /pages/_app.js

import React from 'react';
import { useRouter } from 'next/router.js';
import { createApp } from '@godaddy/gasket-next';
import { SidebarNav } from '@godaddy/gasket-header-nav';

export default createApp(({ Page, pageProps }) => {
  const router = useRouter();

  return (
    <>
      <SidebarNav
        currentUrl={ router.asPath }
        onNavigate={ router.push }
        sidebarNav={[
          { key: 'a', caption: 'A', href: '/a' },
          { key: 'b', caption: 'B', href: '/b' }
        ]}
      />
      <Page {...pageProps} />
    </>
  );
});
```

...and how you set them with the app router:

```jsx
// In /app/layout.js
'use client';

import * as React from 'react';
import { SidebarNav } from '@godaddy/gasket-header-nav';
import { useRouter, usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <SidebarNav
        currentUrl={pathname}
        onNavigate={router.push}
        sidebarNav={[
          { key: 'a', caption: 'A', href: '/a' },
          { key: 'b', caption: 'B', href: '/b' }
        ]}
      />
      {children}
    </>
  );
}
```

The remaining props are all optional and integrate with the [`application-sidebar` extension methods](https://github.com/gdcorp-uxp/application-sidebar). See the extension methods documentation for descriptions of what these do.

| Property | Extension Method | Description |
|----------|------------------|-------------|
| `sidebarNavTopComponent` | `updateSidebarNavTopComponent` | Updates the content at the top of the sidebar navigation |
| `sidebarNav` | `updateSidebarNav` | Updates the links in the sidebar area |
| `sidebarFooterNav` | `updateSidebarFooter` | Updates the bottom links for the sidebar area |
| `topNav` | `updateNavigationTop` | Updates the links/components for the top navigation |
| `helpUrl` | `updateHelpUrl` | Updates the Help Center URL |
| `waffleTopLinks` | `updateWaffleLinks` | Updates the top links within the "waffle" menu popout |
| `waffleQuickLinks` | `updateWaffleLinks` | Updates the quick links within the "waffle" menu popout |
| `cartUrl` | `updateCartLink` | Updates the link for the cart button |
| `cartComponent` | `updateCartComponent` | Updates the component used for the cart button |
| `accountTrayNav` | `updateAccountTrayNav` | Updates the navigation inside of the account tray popout |
| `accountTrayBottomNav` | `updateAccountTrayBottomNav` | Updates the bottom navigation links of the account tray popout |
| `backLink` | `updateNavBreadcrumb` | Updates the back link (single breadcrumb link) |
| `beforeNavHeading` | `updateBeforeNavHeading` | Updates content before the navigation heading |
| `navHeading` | `updateNavHeading` | Updates the navigation heading |
| `afterNavHeadingLeft` | `updateAfterNavHeadingLeft` | Updates the content after the navigation heading, to the left |
| `afterNavHeadingRight` | `updateAfterNavHeadingRight` | Updates the content after the navigation heading, to the right |
| `navSubHeadline` | `updateNavSubHeadline` | Updates the sub-headline below the navigation heading |
| `inPageNav` | `updateNavigation` | Updates the links of the in-page top navigation |
| `inPageRightNav` | `updateNavigation` | Updates the right-most links for the in-page top navigation |
| `inPageNavClassName` | `updateInPageNavContainerClass` | Updates the class name for the in-page navigation |

### useSidebar hook

The `useSidebar` hook provides easy access to the [`application-sidebar` extension methods](https://github.com/gdcorp-uxp/application-sidebar). This will initially return `null`, but then when the header is ready, it will contain a reference to the extension methods.

```javascript
import { useEffect } from 'react';
import { useSidebar } from '@godaddy/gasket-header-nav';

function MyComponent({ heading }) {
  const sidebar = useSidebar();

  useEffect(() => {
    sidebar?.updateNavHeading({ text: heading });
  }, [sidebar, heading]);
  
  // 
}
```

### Internationalization

Because the navigation items are rendered in the uxcore header, which is mounted
outside of the React contexts for your application, a bit of a special setup is
required to accomplish internationalization for the header strings. This can be
accomplished by using the `injectIntl` HOC.

```jsx
// In /components/navigation.js

import React from 'react';
import HeaderNav from '@godaddy/gasket-header-nav';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

const Navigation = ({ intl }) => (
  <HeaderNav
    bottom={[{ caption: intl.formatMessage({ id: 'string-key' }), href: '/' }]}
  />
);

export default injectIntl(Navigation);
```

### Navigation Items

**This information applies to the application header only**

Each of the navigation items should match
[the format required by `application-header`](https://github.com/gdcorp-uxp/application-header#navigation-data).
The component will modify the items based on the following rules:

- If the item has an `href` property that's a relative URL (it doesn't contain a
  domain name), a click handler will be injected.
- If the item has no `href` or it's an absolute URL, no click handler will be
  added.
- If the item already has a click handler, no additional handler will be added.
- If the item has a `fullLoad` property set to `true`, it will not inject the
  click handler.
- If the item does not have an explicit `active` property, it will be set based
  on the [Active State Determination](#active-state-determination) algorithm.

#### Active State Determination

By default, the active flag is set on navigation items based on the following
rules:

- Absolute URLs are never active.
- Relative URLs are compared using an exact match with the current URL.\*

The default rule can be overridden globally by adding an `activeCheck` callback
prop to the component. This callback is passed the `item` and the current URL,
and it should return `true` if the item should be considered active. You can
also explicitly set an `active` property or `activeCheck` callback on a
navigation item object for more granular determinations. The individual
callbacks are only passed the current URL.

\*: Unless the current URL contains just the plid parameter. In this case, the
active state would still be true (e.g. `/foo?plid=1234` would be active, but
`/foo?plid=1234&bar=baz` and `/foo?bar=baz&plid=1234` would not due to the
presence of additional parameters)

Some pre-canned active check functions are exportable from this package.

```js
import {
  // This is what is used if prop isn't specified
  defaultActiveCheck,

  // Same as the default, only the query string/hash is ignored
  nonExactActiveCheck
} from '@godaddy/gasket-header-nav';
```

<!-- LINKS -->

[next/navigation]:https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#userouter-hook
[makeLayout]: ../../packages/gasket-next/README.md#customizing-your-root-layout
