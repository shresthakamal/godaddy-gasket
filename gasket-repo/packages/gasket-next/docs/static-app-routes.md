# Static App Router Guide

This guide describes how to set up static pages in your Gasket app using
**App Router** with Next.js.

If using **Page Router**, please see
the [Static Pages Guide](./static-page-routes.md).

## Overview

The App Router is a new way to build applications in Next.js. It allows you to
create static pages using the `app` directory. This guide will walk you through
setting up static pages in your Gasket app using the App Router.

The necessary parameters for Presentation Central (PC) are:

- `plid`
- `market`
- `currency`

While some apps may be able to hard-code these values, this guide will focus on
apps requiring multi-brand and multi-market support.

## Set up app

Creating a new Gasket app using the Webapp preset and choosing **App Router**
as the Next.js routing method, will automatically be pre-wired to support static
pages with multi-brand and multi-market support.
These next steps are only for documenting the requirements or for following
if you need to refit an existing app.

1. Set up pages with static path and browser path ([jump](#static-page-paths))
2. Wire up page rewrites ([jump](#rewrites))

### Static page paths

All the necessary PC parameters will need to be set up as path parameters
directories nested under the `app` directory.

This should look something like:

```
app
├── [plid]
│   ├── [market]
│   │   ├── [currency]
│   │   │   ├── layout.js
│   │   │   └── page.js
├── layout.js
└── page.js
```

The layout and page in the root of the `app` directory are required by Next.js,
but will not be used by our app and can effectively be empty components.

#### Root layout and page

```javascript
// app/layout.js

export default function RootLayout(props) {
  return props.children;
}
```

```javascript
// app/page.js

export default function IndexPage() {
  return 'Root page - Path params are expected. i.e. /:plid/:market/:currency';
}
```

#### Index layout and page

```javascript
// app/[plid]/[market]/[currency]/layout.js
import { makeLayout } from '@godaddy/gasket-next/layout';
import gasket from '../../../../gasket.js';

export default makeLayout(gasket);

export const revalidate = 600;
```

It is important to note that the `layout.js` file must export a `revalidate`
constant. This constant is used by Next.js to determine how often the page
should be revalidated.
Periodically revalidating the page will ensure that the PC header is up to date.

```javascript
// app/[plid]/[market]/[currency]/page.js
import React from 'react';

export default function IndexPage() {
  return <>
    <h1>Welcome to Gasket!</h1>
    <p>To get started, edit a page and save to reload.</p>
  </>;
}
```

### Setting Up Static Pages

New requests to a page route will create a static render of the page.
If you wish to pre-render a page, you can use the `generateStaticParams`
function to specify the parameters for the static page.

```javascript
// app/[plid]/[market]/[currency]/page.js
export default function IndexPage() { /* ... */ }

export async function generateStaticParams() {
  return [
    { plid: '1', market: 'en-US', currency: 'USD' },
    { plid: '1', market: 'fr-FR', currency: 'EUR' }
  ];
}
```

### Rewrites

Now, we do not want customers to have to see these `plid`, `market`, and
`currency` path params in their URL.
As such, we will need to set up rewrites from expected paths, to the static
pages we have set up.
We can achieve this using Next.js middleware.

```javascript
// middleware.js
import { NextResponse } from 'next/server';
import gasket from './gasket.edge.js';

export const config = {
  matcher: [
    '/',
    // Match other paths EXCEPT /api, /_next, etc.
    '/((?!api|_next|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}

/** @type {import('next/server').NextMiddleware} */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const visitor = await gasket.actions.getVisitor(request);
  const { plid = 1, market, currency } = visitor;

  const targetPathname = [plid, market, currency, pathname.slice(1)].filter(Boolean).join('/');
  return NextResponse.rewrite(new URL(targetPathname, request.url));
}
```

Notice that we are using the getVisitor action from a different gasket.edge file.
At this time, in Next.js 14, the middleware file does not allow for the use
of Node APIs.
Many of our Gasket plugins use the Node APIs, so we will need to pick only
the selected few necessary for the middleware and configure them in a
separate `gasket.edge.js` file.

In our above example, only the `@godaddy/gasket-plugin-visitor` plugin is
needed.

```javascript
import { makeGasket } from '@gasket/core';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';

export default makeGasket({
  plugins: [
    pluginVisitor
  ],
  root: '.'
});
```
