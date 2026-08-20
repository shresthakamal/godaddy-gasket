# @godaddy/gasket-next

Gasket extensions and wrappers for Next.js components.

By default, GoDaddy Gasket apps with be wired up with the Next.js `Document` and `App`
implementations from this package. If you need to customize your global HTML structure,
components, or features, you can use the configuration or helpers described below.

- [Page Router](#page-router)
  - Document
    - [makeDocument](#customizing-your-document)
  - App
    - [GasketApp](#customizing-your-app)
    - [createApp](#createapp)
    - [reportWebVitals](#reportwebvitals)
    - [withPageEnhancers](#withpageenhancers)
- [App Router](#app-router-) 🧪
  - [makeLayout](#makelayout)
  - [makeDynamicLayout](#makedynamiclayout)
- [Components](#components)
  - [VisitorLink](#visitorlink)  

## Guides

- [Static Page Router Guide]
- [Static App Router Guide]

## Page Router

With Page Router, the Next.js app is composed of three types of pieces.
When an HTTP request is received, the server renders the component under 
`/pages/_document.js`.
This provides the overall static HTML structure of the site.
Nested inside the _document_ is the _App_ component which comes from 
`/pages/_app.js`.
This is rendered both client-side and server-side, and it is responsible for 
layout, loading, and transitioning among _pages_.
Finally, the rest of the files under `/pages` are actual page components. In 
summary, the component hierarchy is:

```text
Document (server-rendered)
  App    (universally rendered)
    Page (universally rendered)
```

### Customizing your Document

To customize the HTML content of your _document_, you can subclass 
`Presentation` used with `makeDocument`, in a custom `/pages/_document.js`.

```js
// pages/_document.js

import { makeDocument, Presentation } from '@godaddy/gasket-next/document';
import * as NextDocument from 'next/document';
import gasket from '@/gasket.js'

class CustomPresentation extends Presentation {
  renderPreAppScriptContent() {
    return <script src='//some.url/additional/script'/>;
  }
}

export default makeDocument(gasket, NextDocument, CustomPresentation);
```

#### Customizing Presentation

The `Presentation` class organizations where content from PresentationCentral
and other resources should be rendered in the document.

While you can opt to override the entire `renderDocument` method, some more 
granular methods are provided so that you can keep the overall Gasket 
document intact and just make some small changes.
Refer to the [Presentation Types](src/server/index.d.ts) to see which render 
methods are available for overriding and how they are sequenced.

#### Customize Presentation Props

The `getProps` method is a static method on the `Presentation` class which
is called by the `getInitialProps` of the constructed document.
You can override this method to add custom props to the presentation.

```js
// pages/_document.js
import { makeDocument, Presentation } from '@godaddy/gasket-next/document';
import * as NextDocument from 'next/document';
import gasket from '@/gasket.js'

class CustomPresentation extends Presentation {
  static async getProps(gasket, req) {
    // Call the base getProps to get the default props
    const baseProps = await Presentation.getProps(gasket, req);
    return {
      ...baseProps,
      customProp: 'some-value'
    };
  }
}

export default makeDocument(gasket, NextDocument, CustomPresentation);
```

All the props returned from this method will be available to the presentation
render methods by accessing `this.props`.

#### Customize html and body attributes

To adjust attributes rendered to `html` and `body` tags the app's document
set `htmlProps` and/or `bodyProps` via a custom `getProps` wrapper.

```js
// pages/_document.js

import { makeDocument, Presentation } from '@godaddy/gasket-next/document';
import * as NextDocument from 'next/document';
import gasket from '@/gasket.js'

class CustomPresentation extends Presentation {
  static async getProps(gasket, req) {
    const baseProps = await Presentation.getProps(gasket, req)
    return {
      ...baseProps,
      htmlProps: {
        // custom attribute
        'data-details': 'something-special'
      },
      bodyProps: {
        // append another class to the body
        'className': 'my-app',
        // custom attribute
        'data-tracking-name': 'some-data-id'
      }
    }
  }
}

export default makeDocument(gasket, NextDocument, CustomPresentation);
```

#### Customize HTML-to-React parsing

To customize how the HTML is parsed, you can override the `htmlToReact` method
in the `Presentation` class. This is an advanced feature that allows you to
experiment with different ways have handle the header html which currently has
hydration issues when used with App Router layouts.

```js
// pages/_document.js
import { makeLayout, Presentation } from '@godaddy/gasket-next/layout';
import gasket from '@/gasket.js'

class CustomPresentation extends Presentation {
  htmlToReact(html) {
    // Custom parsing logic here
    return super.htmlToReact(html, { trim: true });
  }
}

export default makeLayout(gasket, CustomPresentation);
```

### Customizing your App

To replace the default App component, create a custom `/pages/_app.js` file.
There are three ways to customize the Gasket App component.

#### Using an App HOC

One way to customize your App is to use HOCs to wrap the base App component.
This is how many common Next.js add-ins are implemented.

```js
// pages/_app.js

import { App } from '@godaddy/gasket-next'

export default withSomeFeature()(App);
```

#### createApp

The second way to customize your App component is to use the `createApp` utility
function. This allows you to easily customize how the `Page` component is
rendered and any other components you want to be rendered across all pages:

```js
// pages/_app.js

import * as React from 'react';
import { createApp } from '@godaddy/gasket-next';

import SomeAppUtility from '../components/some-app-util';

const MyLayout = ({ Page, pageProps }) => (
  <React.Fragment>
    <SomeAppUtility/>
    <header>Common header</header>
    <Page { ...pageProps }/>
  </React.Fragment>
);

export default createApp({
  Layout: MyLayout,
  // Optional settings
  strictMode: false
});
```

##### createApp options

Additional configuration settings can be passed with the options.

- `Layout` - (Component) A custom page layout component.
- `strictMode` - (boolean) Use [StrictMode] for the app. Default is `true`.
  _Prefer to leave this enabled._
- `mainRole` - (boolean) Wrap app pages with [main role]. Default is `true`.
  _Only disable if you intend to place elsewhere in your pages._
- `intlProvider` - (boolean) Wrap the app with `IntlProvider` from `react-intl`.
  Default is `true`.
- `initialProps` - (boolean) Use to enable/disable adding `getInitialProps`
  for pages. Default is `true`. _Disable if you use static pages._

#### Custom Layout

The `createApp` function allows a custom `Layout` component and returns a new
component that's exportable in an `_app.js` file. The Layout component is
passed the following props:

| Prop        | Description                                                  |
|:------------|:-------------------------------------------------------------|
| `Page`      | The page component (from your `/pages` directory) to render. |
| `pageProps` | The props to pass to the `Page` component when rendering.    |

...and it can consume context established by Gasket and Next.js.

Your component may also define a static `getInitialProps` method to override the
default. See the [docs for custom apps][1] for more info about overriding this
function.

#### Main Role

For improved accessibility support in GoDaddy Gasket apps, a [main role] is
added by `createApp`. This helps identify the main content in the app
for screen readers and allows a _skip to main content_ link to be used in the
headers.

The added element is:

```html
<main id="main" role="main">
```

If a team wishes to place the main role a different part of their page, they can
choose to disable the main role added by `createApp`.

```js
export default createApp({ mainRole: false });
```

### reportWebVitals

To help with [measuring performance], be sure to export the the `reportWebVitals`
function from your `_app.js`. For more details, see the [Web Vitals Guide].

```
import { reportWebVitals } from '@godaddy/gasket-next';
```

You will then want to export this function.

```
export { reportWebVitals };
```

### withPageEnhancers

Sometimes you need to enhance the _page_ components that are rendered by your
app, not the app component itself. This is especially the case if your enhancer
needs to be located under the context providers provided by the App that are
wrapping the page. To do this, use the `withPageEnhancers` HOC:

```js
// pages/_app.js

import * as React from 'react';
import { App, withPageEnhancers } from '@godaddy/gasket-next';

export default withPageEnhancers([
  withLocaleRequired('app-name'),
  injectIntl,
  withHeaderNav([
    { caption: 'Home', href: '/' },
    { caption: 'Manage', href: '/manage' }
  ])
])(App);
```

Each HOC in the array will be applied in order to the page component loaded by
the `App`.


## App Router 🧪

**Experimental** — There are still issues to sort out with PresentationCentral
script loading and header mounting.
While it works with certain configurations, these are subject to change.

With App Router, the Next.js app can be developed use React Server Components.
Each app must have a Root Layout which provides the overall HTML structure for
the site.
Nested inside, you can have any number of subcomponents which you can read more
on in the Next.js [App Routing Docs].

### Using App Router

Typically, we use a shared React bundle from UXP across our GoDaddy apps to
reduce the download size for users.
However, with App Router, React must be bundled with your app code to allow
Next.js script loading strategies.

You can disable the UXP `externals` in the gasket config:

```diff
// gasket.js
export default makeGasket({
-- snip --
+ uxp: {
+   externals: false
+ }
});
```

By default, the PresentationCentral version `3.0` with `deferjs` enabled.
This is required for App Router to work correctly with UXP headers and scripts
If you are not using defaults, be sure to update your gasket config:

```diff
// gasket.js
export default makeGasket({
  -- snip --
  presentationCentral: {
+   version: '3.0',
    params: {
      app: 'canary.gasket',
-      header: 'language-header',
+      manifest: 'language-header',
+      deferjs: true
    }
  }
});
```

### makeLayout

To create an App Router Layout with the appropriate PresentationCentral
headers and script, you must use the `makeLayout` function in your layout file.

#### Mutli-brand Support

At a minimum, a plid parameter is required to ensure the correct header is loaded.
This can be done with a specific route parameter such as:

```jsx
// app/[plid]/layout.js
import { makeLayout } from '@godaddy/gasket-next/layout'
import gasket from '@/gasket.js';

export default makeLayout(gasket);
```

‼️ Be sure to view the [Static App Router Guide] for more details on setting up
your app with static params, and using Next.js middleware, especially if you need
to support additional params such as `market` and `currency`.

#### Passthrough Root Layout

Next.js requires that apps have root layout in the `/app` directory.
However, since the path params are not available to the root layout, it cannot
be used to render the header.

Therefore, the root layout can be a simple passthrough component:

```javascript
// app/layout.js
export default function RootLayout(props) {
  return props.children;
}
```

#### Single-brand Support

If your app is single-brand, you can instead use makeLayout with static params
in the root layout.

```jsx
// app/layout.js
import { makeLayout } from '@godaddy/gasket-next/layout'
import gasket from '@/gasket.js';

const StaticLayout = makeLayout(gasket);

const staticParams = {
  plid: '1', // required - this is a GoDaddy only app
  
  market: 'en-US', // optional - defaults to 'en-US'
  currency: 'USD' // optional - defaults to 'USD'
};

export default function RootLayout(props) {
  return (
    <StaticLayout { ...props } params={ staticParams }>
      {props.children}
    </StaticLayout>
  );
}
```

Single-brand static apps are by far the simplest to set up with App Router.
If your app needs to be multi-brand, please refer to the [Static App Router Guide]
or consider using Page Router instead.

### makeDynamicLayout

For static pages, using `makeLayout` requires evaluating the request context
to determine the path params. Another approach is to use `makeDynamicLayout` which
creates a layout component that receives the request context.

```jsx
// app/layout.js
import { makeDynamicLayout } from '@godaddy/gasket-next/layout'
import gasket from '@/gasket.js';

export default makeDynamicLayout(gasket);
```

This approach simplifies the app setup and more closely resembles server-side
rendering with Page Router (see [App Dynamic Rendering]).

### Customizing your Layouts

To customize the HTML content of your _layout_, you can subclass
`Presentation` used with `makeLayout` or `makeDynamicLayout`.

```jsx
// app/layout.js

import { makeDynamicLayout, Presentation } from '@godaddy/gasket-next/layout'
import gasket from '@/gasket.js';

class CustomPresentation extends Presentation {
  renderPreAppScriptContent() {
    return <script src='//some.url/additional/script'/>;
  }
}

export default makeDynamicLayout(gasket, CustomPresentation);
```

The same [Customizing Presentation](#customizing-presentation) principals apply
as when used with `makeDocument` for Page Router.

In fact, a Next.js can use App and Page Router pages simultaneously.
Therefore, a customized `Presentation` class be shared with both `makeDocument`
and `makeLayout` for consistency across your app.



## Components

### VisitorLink

**Experimental** This API is subject to change.

This is a helper component to ensure necessary query params are included in browser
routing page changes for apps on `secureserver.net`. This will ensure static params
for `plid`, `currency`, and the like are set included in page links. These are derived
from the `gasketData.visitor` which is determined and rendered to the page on first request.

```js
import { VisitorLink } from '@godaddy/gasket-next';
import Link from 'next/link';

export default function MyStaticPage() {
  return (
    <ul>
      <li>
        <VisitorLink href='/example'>Link to a static page</VisitorLink>
        <Link href='/items'>link to another page</Link>
      </li>
    </ul>
  )
}
```

Links to `/items` will remain the same. However, when the user clicks the
link for `/example`, it will take them to `/example?plid=1234` instead. This
will also be true for the JSON request and/or prefetching when linking to static
pages. For non-`secureserver.net` apps there will be no change.

If there are other critical params to be included from `gasketData.visitor`, the
keys can be specified in the link.

```tsx
import { VisitorLink } from '@godaddy/gasket-next';

export default function MyStaticPage() {
  return (
    <ul>
      <li>
        <VisitorLink href='/example' visitorKeys={['currency']}>
          Link to a static pricing page
        </VisitorLink>
      </li>
    </ul>
  )
}
```

In this example, the `currency` from `gasketData.visitor` will be including
in the query along with the `plid` such as `/example?plid=1234&currency=USD`.

[@godaddy/gasket-plugin-security]: /packages/gasket-plugin-security/README.md
[addCspHash]: /packages/gasket-plugin-security/README.md#addcsphash
[addCspNonce]: /packages/gasket-plugin-security/README.md#addcspnonce
[Web Vitals Guide]: /packages/gasket-plugin-uxp/docs/web-vitals-rum.md

[STGLS-469]: https://jira.godaddy.com/browse/STGLS-469

[1]: https://github.com/vercel/next.js#custom-app
[measuring performance]:https://nextjs.org/docs/advanced-features/measuring-performance
[StrictMode]: https://reactjs.org/docs/strict-mode.html
[main role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Main_role

[App Routing Docs]: https://nextjs.org/docs/app/building-your-application/routing
[App Dynamic Rendering]: https://nextjs.org/docs/14/app/building-your-application/rendering/server-components#dynamic-rendering

[Static Page Router Guide]:docs/static-page-routes.md
[Static App Router Guide]:docs/static-app-routes.md
