# Static Page Router Guide

This guide describes how to set up static pages in your Gasket app using
**Page Router** with Next.js.

If using **App Router**, please see the [Static App Router Pages Guide](./static-app-routes.md).

## Overview

Presentation Central has historically been used during server-side rendering of
pages. It retrieves the current UXCore2 asset urls and header content based on
params, some of which are determined from a request. So, to use
Presentation Central to render pages statically and at build time, these
parameters need to be provided.

The necessary params are:

- `plid` _
- `market` _
- `currency`

## Identify requirements

| Tenancy                  | Domain examples      | Static paths                     | Browser paths  | Param query |
|:-------------------------|:---------------------|:---------------------------------|:---------------|-------------|
| GoDaddy-only             | godaddy.com          | /page-name.tsx                   |                |             |
| Single-domain            | 123-reg.co.uk        | /page-name.tsx                   |                |             |
| Multi-plid               | secureserver.net     | /[plid]/page-name.tsx            | /page-name.tsx | required    |
| Multi-domain             | hosteurope.de, df.eu | /[plid]/page-name.tsx            | /page-name.tsx |             |
| Multi-plid + currency    | secureserver.net     | /[plid]/[currency]/page-name.tsx | /page-name.tsx | required    |
| Single-domain + currency | godaddy.com          | /[currency]/page-name.tsx        | /page-name.tsx |             |

## Set up app

1. Set up pages with static path and browser path ([jump](#static-page-paths))
2. Configure pages with `getStaticProps` and `getStaticPaths` ([jump](#getstaticprops-and-paths))
3. Add `withStaticReq` to Document ([jump](#withstaticreq))
4. Wire up page rewrites ([jump](#rewrites))
5. Build for environment ([jump](#build-for-environment))

### Static page paths

Next.js will render static pages unique to the path params. As such, for multi-tenant
apps that share the same page structure but with different branding or other information,
the parameters that drive the variants need to be in the path.

To keep the URL paths clean, you can configure rewrites to direct a request to the correct
static rendered content (see [step 4]). For Next.js to handle clean page routes in the browser,
you will need to also add a "browser path" page. This can simply be a re-export of the static
page, at a location without the path params (more in [step 2]).

#### Single-tenant example

For **GoDaddy-only** and **Single-domain** apps, you most likely will not need to
adjust your static paths. The exception would be if you need to also statically render
anything related to a shopper's select currency.

```
./pages/example.tsx
```

#### Multi-tenant example

In order for Next.js to statically render pages with the different params required
for Presentation Central, they need to be provided as path props to your page.
To accomplish this, you must move the pages you intended to be statically rendered
under dynamic routes.

```
./pages/example.tsx -> ./pages/[plid]/example.tsx
```

#### Multi-currency example

If you need to provide currency, or use any other props for static pages, add
additional path props.

```
./pages/example.tsx -> ./pages/[plid]/[currency]/example.tsx
```

💡 There is another option when it comes to currency. Instead of statically rendering
currency content in the page, you can use tokens in your page and defer those parts
to be rendered in the browser. This is an advanced topic which we be described in a
separate guide to come.

#### Multiple pages example

To keep your rendering and redirection simple, it's easiest to use a consistent
base dynamic route for multiple static pages.

```
./pages
    /[plid]
        /[currency]
            /example.tsx
            /another.tsx
            /[...slug].tsx
    /item
        [id].tsx
```

Be sure to NOT include pages with user-specific path params in your static
pages. You can still include pages which utilize `getInitialProps` or
`getServerSideProps` for more individual shopper-specific or utility type pages.

### getStaticProps and Paths

For your static pages, you will need to configure [getStaticProps] in your app
in order to configure the [revalidate] property. This can be adjustable per-page,
but should be less than or equal to the out-of-band cache `maxAge`
[Presentation Central params], which defaults to 10 minutes.

Setting the `revalidate` property is necessary even if you do not have changing static
props in you page. It tells Next.js to incrementally regenerate the static HTML which
will keep your app current with UXCore2 bundles and headers using Presentation Central.

Multi-tenant apps, or any pages with dynamic paths, will want to utilize [getStaticPaths]
in order to configure the [fallback] property, setting it to `blocking`. The `paths`
param can be configured to generate static pages at build time, otherwise, with blocking
any first page requests will be server-side rendered, with subsequent requests served the
static content.

[getStaticProps]: https://nextjs.org/docs/api-reference/data-fetching/get-static-props
[revalidate]: https://nextjs.org/docs/api-reference/data-fetching/get-static-props#revalidate
[getStaticPaths]: https://nextjs.org/docs/basic-features/data-fetching/get-static-paths
[fallback]: https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking
[Presentation Central params]:https://github.com/gdcorp-uxp/presentation-central#version-20-api

#### Single domain fixed path example

Even though the page content itself does not change, you need to set the `revalidate`
option in `getStaticProps` to enable incremental static regeneration of the page to
stay current with UXCore2 and header updates.

```tsx
// pages/example.tsx

export default function ExamplePage() {
  return (
    <h1>Example page</h1>
  )
}

export async function getStaticProps(context) {
  return {
    props: {},
    revalidate: 10 * 60 // every 10 minutes as seconds
  };
}
```

#### Single domain dynamic path example

This example shows how to set up a static page which is backed by CMS content.
By using `getStaticPaths`, you can pre-render certain static pages at
build time. By setting `fallback: 'blocking'`, any other pages that may use
CMS content can be rendered during runtime on first request.

```tsx
// pages/[slug].tsx

export default function ExampleCMSPage({ content }) {
  return <>
    <h1>{ content.title }</h1>
    <p>{ content.body }</p>
  </>
}

export async function getStaticProps(context) {
  const { slug } = context.params;
  const content = await fetchCMSContent(slug);

  return {
    props: {
      content
    },
    revalidate: 5 * 60 // every 5 minutes as seconds
  };
}

export function getStaticPaths() {
  return {
    paths: [
      { params: { slug: 'example' }, locale: 'en-US' },
      { params: { slug: 'example' }, locale: 'fr-FR' },
      { params: { slug: 'another-example' }, locale: 'en-US' },
      { params: { slug: 'another-example' }, locale: 'fr-FR' }
    ],
    fallback: 'blocking'
  };
}
```

#### Multi-tenant fixed path example

For multi-tenant, the params needed for Presentation Central need to be
in the dynamic path params. You can use `getStaticPaths` here as well to
pre-render pages for certain private label ids at build-time,
with `fallback: 'blocking'` allowing for other labels to be rendered on
first request.

```tsx
// pages/[plid]/example.tsx

export default function ExamplePage() {
  return (
    <h1>Example page</h1>
  )
}

export async function getStaticProps(context) {
  return {
    props: {},
    revalidate: 10 * 60 // every 10 minutes as seconds
  };
}

export function getStaticPaths() {
  return {
    paths: [
      { params: { plid: '1234' }, locale: 'en-US' },
      { params: { plid: '1234' }, locale: 'fr-FR' },
      { params: { plid: '4567' }, locale: 'en-US' },
      { params: { plid: '4567' }, locale: 'fr-FR' }
    ],
    fallback: 'blocking'
  };
}
```

To allow clean URLs for the app when routing to pages in the browser, you
will need a "browser path" page which can just be a re-export of the static
page content. Since this is only intended to render the page/route in the
browser, you can avoid unnecessary pre-rendering by setting the static `paths`
to an empty array.

```ts
// pages/example.tsx

import ExamplePage, { getStaticProps } from './[plid]/example.tsx'

export default ExamplePage
export { getStaticProps }

export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}
```

#### Multi-tenant dynamic path example

These need to be set up much like the fixed path examples for multi-tenants.

```tsx
// pages/[plid]/[slug].tsx

export default function ExampleCMSPage({ content }) {
  return <>
    <h1>{ content.title }</h1>
    <p>{ content.body }</p>
  </>
}

export async function getStaticProps(context) {
  const { slug } = context.params;
  const content = await fetchCMSContent(slug);

  return {
    props: {
      content
    },
    revalidate: 5 * 60 // every 5 minutes as seconds
  };
}

export function getStaticPaths() {
  return {
    paths: [
      { params: { plid: '1234', slug: 'example' }, locale: 'en-US' },
      { params: { plid: '1234', slug: 'example' }, locale: 'fr-FR' },
      { params: { plid: '1234', slug: 'another-example' }, locale: 'en-US' },
      { params: { plid: '1234', slug: 'another-example' }, locale: 'fr-FR' },
      { params: { plid: '4567', slug: 'example' }, locale: 'en-US' },
      { params: { plid: '4567', slug: 'example' }, locale: 'fr-FR' },
      { params: { plid: '4567', slug: 'another-example' }, locale: 'en-US' },
      { params: { plid: '4567', slug: 'another-example' }, locale: 'fr-FR' }
    ],
    fallback: 'blocking'
  };
}
```

And again, have a "browser path" page that re-exports the page component and
Next.js page functions.

```ts
// pages/[slug].tsx

import ExampleCMSPage, { getStaticProps } from './[plid]/[slug].tsx'

export default ExampleCMSPage
export { getStaticProps }

export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}
```

### withStaticReq

#### Basic example

For **GoDaddy-only** and most **multi-tenant** apps, the default configure
should be sufficient.

```ts
// pages/_document.ts
import Document, { withStaticReq } from '@godaddy/gasket-next/document';

export default withStaticReq()(GasketDocument);
```

#### withGasketData

There may be times you also want to use `withGasketData`. To do so, `withStaticReq` needs to wrap
`withGasketData` to allow for the proper parameters to be added to the request query.

```ts
// pages/_document.ts
import Document, { withStaticReq } from '@godaddy/gasket-next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '@/gasket';


export default withStaticReq()(withGasketData(gasket)(GasketDocument));
```

#### makeDocument

This is an example of using `makeDocument` with `withStaticReq`.

```ts
// pages/_document.ts
import Document, { makeDocument, withStaticReq } from '@godaddy/gasket-next/document';
import * as NextDocument from 'next/document';
import gasket from '@/gasket';


export default withStaticReq()(makeDocument(gasket, NextDocument));
```

#### makeDocument and withGasketData

Both `makeDocument` and `withGasketData` can be used simultaneously with `withStaticReq`.

```ts
// pages/_document.ts
import { makeDocument, withStaticReq } from '@godaddy/gasket-next/document';
import { withGasketData } from '@gasket/nextjs/document';
import * as NextDocument from 'next/document';
import gasket from '@/gasket';

export default withStaticReq()(withGasketData(gasket)(makeDocument(gasket, NextDocument)));
```


### Rewrites

⚠ This section is subject to change with streamlining solutions to come in
followup tickets.

When a static page is re-rendered in the revalidate period, or is for a
first-time request, you need to be sure that any visitor-specific data does not
contaminate the new page render. This can be handled by setting
`req.staticPage = true` which will let `withStaticContent` know to prepare the
Document for static rendering and to sanitize `res.locals`. This can be handled
in the [nextPreHandling] lifecycle as demonstrated in the rewrite examples
below, regardless of tenancy.

#### Single-tenant example

For **GoDaddy-only** and **Single-domain** apps, there should not be rewrites
required for static pages. The exception of course, is if currency or
another request specific param is needed.

#### Multi-domain example

If you have a multi-tenant app supporting multiple domain names, you need to
map those requests to the correct plid to get the correct static content.

For Custom Server apps, you can hook the [nextPreHandling] lifecycle:

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import { nextPreHandling } from '@godaddy/gasket-next';

const rePages = /^\/(example|other-page|etc)/;

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        async nextPreHandling(gasket, context) {
          const { req, res } = context;
          const { plid, locale, currency } = await gasket.getVisitor(req);

          // rewrite the static hmtl request for initial page loads
          if(rePages.test(req.url)) {
            const root = [plid, locale, currency].filter(Boolean).join('/');
            req.url = `/${root}${req.url}`
            return
          }
        }
      }
    }
  ]
})
```

_This is a brief example with a simple single static page path._

#### Multi-plid example

For multi-tenant apps on `secureserver.net`, the `plid` will already have been
determined and be made available on the `visitor` object. As such, the
previous `nextPreHandling` setup would work without any additional changes in
most circumstances.

The additional challenge for static pages in these apps is that it is necessary
for page links to pass the path params

### Visitor links

After the first page request, which returns static rendered HTML, other links
should use [next/link] to keep your app fast and avoid full page reloads.
For any links to other static pages, Next.js will fetch the static rendered
props as JSON.

However, for multi-tenant apps on `secureserver.net`, there are some cases when
the JSON request is made, that the current plid for the app is not available.
To ensure that it and any other path params are passed with the JSON request,
it is recommended to include them as query params on the links.

We have a helper component to simplify this, which will ensure static params
for the initial `gasketData.visitor` are set in the query for links.

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

Links to `/items` will remain the same. However, when the user clicks to the
link for `/example`, it will take them to `/example?plid=1234` instead. This
will also be true for the JSON request and/or prefetching.

### Build for environment

When generating static pages at build-time, utilize `getStaticPaths`, it is
important to specific the Gasket env to use to ensure Presentation Central and
related Gasket lifecycles are using the expected configurations.

```shell
GASKET_ENV=<env name> next build
```

<!-- LINKS -->

[nextPreHandling]:https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-nextjs#nextprehandling
[get-static-paths]:https://nextjs.org/docs/basic-features/data-fetching/get-static-paths
[next/link]:https://nextjs.org/docs/api-reference/next/link
