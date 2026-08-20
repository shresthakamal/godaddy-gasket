# Gasket and Next.js Features

This document outlines the server options available with Gasket and Next.js.
Some features are yet to be investigated, and others currently in development.
Refer to the [Support Matrix](#support-matrix) for a quick overview of the
supported features and their status.

## Server options

### App Router

App Router is the latest approach to web application development with Next.js
and enables using React Server Components.

_🧪 While Gasket can now work with App Router nicely, there are still some
things we are learning and investigating about using it with GoDaddy apps.
If you want to get involved, reach out to [#gasket-dev] on Slack._

### Page Router

Page Router is the traditional approach to developing web applications with
server-side rendered initial document and client-side (SPA) transitions.
A streamlined setup for routing around GoDaddy markets and PLIDs is still being
investigated, though consider it partially supported.

### Custom Server

Page Router can be used with a Custom Server.
Up to now, this is how Gasket has been used with Next.js, and it is still a
viable option if you need certain server abilities.

## Supported Feature

- 🟢 Supported
- 🟡 Under Development
- 🔵 Partially Supported
- 🔴 Not Supported
- 🟣 Requires Investigation

| Feature               | App Router | Page Router | Custom Server |
|-----------------------|------------|-------------|---------------|
| [Express Middleware]  |            |             | 🟢            |
| [Next Middleware]     | 🟢         | 🟢          |               |
| [Server Components]   | 🟢         |             |               |
| [Static Rendering]    | 🟢         | 🟢          | 🟢            |
| [Streaming]           | 🟣         |             |               |
| [Origin HTTPS]        |            |             | 🟢            |
| — _client + server_ — | —          | —           | —             |
| [GasketData]          | 🟢         | 🟢          | 🟢            |
| [Redux]               | 🔴         | 🔵          | 🟢            |
| [GasketIntl]          | 🟢         | 🟢          | 🟢            |
| [GD Auth]             | 🔵         | 🟢          | 🟢            |
| — _bundling_ —        | —          | —           | —             |
| [React Externals]     | 🔴         | 🟢          | 🟢            |
|                       |            |             |               |

### Express Middleware

In previous iterations of Gasket plugins, Express middleware was commonly used
gather information about a request.
While this has been common practice with Node-based apps,
there are several drawbacks.
Further, using Express-like middleware, and attaching properties to the `req`
is _not recommended_ with Fastify, and is _not possible_ with the Next.js
default server.

In this major version, Gasket is moving away from its heavy reliance on Express
and middleware by introducing GasketActions.

GasketActions allow request-based logic and lookups to occur without the need
for serial Express middleware and enables usage with the Next.js default server.
GasketActions also help us break away from the practice of attaching properties
to the `req` object.

However, if your app requires Express middleware, using [Custom Server] will be
necessary.

### Next Middleware

[Next.js Middleware] is a feature that works with both Page and App Router when
using the Next.js built-in server.
When using a custom server, the Next.js Middleware is not available.
Instead, Express-like middleware can be used,
enabled with [@gasket/plugin-middleware].

Next.js Middleware works with the [Next.js Edge Runtime] which allows middleware
to run in edge locations, such as the Vercel platform.
Edge runtime is not helpful for our GoDaddy apps, and has the unfortunate 
limitation of not being able to use Node.js APIs.
At this time, to use Gasket feature in Next.js Middleware, you will need a 
separate gasket file with only plugins that don't use Node.js APIs.

_ Experimental support for Node.js APIs is coming future Next.js versions,
so this guidance will be revisited in the future._

### Server Components

[React Server Components] are a new way to build web applications with React.
The Next.js App Router was developed in collaboration with the React team
to support fully React Server Components, making it [bleeding-edge technology].

### Origin HTTPS

Commonly, SSL termination is done at the load balancer. However, if there is a
need for apps to support HTTPS down to the origin, there are two options.
The first is to use Custom Server which supports HTTPS and HTTP/2 easily.

If, however, you wish to use Next.js default server with either Page or App
Router the second option is to implement a side-car server to handle SSL
termination and proxy the request to the origin's local Next.js server.

For local development, Gasket comes with a proxy side-car server to allow app
development and testing with HTTPS. 

### Static Rendering

Static pages with Gasket + Next.js can be achieved by following the
[Static Page Routes Guide] for Page Router, or the [Static App Routes Guide] 
when using App Router.

### Streaming

[App Router Streaming] enables you to progressively render UI from the server.
This feature is not yet supported with Gasket, but will be investigated in the
future.

### GasketData

GasketData allows server-side data to be passed to the client. This allows for
configurations and settings based on environment and/or user request details to
be available in the browser.

### Redux

While Redux has been popular in the past, it is not as critical for modern
React applications since state and context have been improved.
Many of our GoDaddy apps have used it to transfer data from the server to the
client, but this can be done more optimally with GasketData.

However, if you need to use Redux, it is possible with Page Router apps using
[next-redux-wrapper].

⚠️ The [@gasket/plugin-redux] has been deprecated and will be removed in a future version.
and its lifecycles are only supported with Custom Server apps.
It is not supported with App Router apps.

### React Externals

With Page Router, the HTML document is rendered with deferred scripts allowing
the React bundle to be loaded asynchronously and executed in an ordered manner.
The React bundle can be externalized and shared across multiple apps.

However, with App Router, the document and script loading are optimized in an
much different way making it currently not possible for React to be externalized.
As a result, users will miss out on a slight performance boost since they will
need to download a bundled React again as they move across App Router apps. 

### GasketIntl

GasketIntl is supported in all app types.

### GD Auth

GoDaddy Auth is supported in all app types.
However, App Router apps are limited to browser-side authentication checks.
Page Router apps can opt into getInitialProps or getServerSideProps to perform
server-side authentication checks.

## Tickets

- [PFX-675] — Docs: GasketActions Guide
- [PFX-676] — SPIKE: PC Header with App Router
- [PFX-677] — SPIKE: Gasket in Next.js Middleware
- [PFX-678] — SPIKE: Origin Proxy as Next.js Sidecar
- [PFX-679] — SPIKE: Param-based Presentation Central
- [PFX-680] — withGasketData for App Layout
- [PFX-681] — Auth with GasketActions
- [PFX-668] — Intl for App Router

<!-- LINKS -->

[Custom Server]: #custom-server
[Express middleware]: #express-middleware
[Next middleware]: #next-middleware
[Server Components]: #server-components
[Origin HTTPS]: #origin-https
[Static Rendering]: #static-rendering
[Streaming]: #streaming
[GasketData]: #gasketdata
[Redux]: #redux
[GasketIntl]: #gasketintl
[GD Auth]: #gd-auth
[React Externals]: #react-externals

[Next.js Middleware]: https://nextjs.org/docs/app/building-your-application/routing/middleware
[Next.js Edge Runtime]: https://nextjs.org/docs/app/api-reference/edge
[React Server Components]: https://nextjs.org/docs/app/building-your-application/rendering/server-components
[bleeding-edge technology]: https://react.dev/learn/start-a-new-react-project#bleeding-edge-react-frameworks
[App Router Static Rendering]: https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default
[App Router Streaming]: https://nextjs.org/docs/app/building-your-application/rendering/server-components#streaming
[next-redux-wrapper]: https://github.com/kirill-konshin/next-redux-wrapper

[#gasket-dev]: https://godaddy.enterprise.slack.com/archives/C9PEPF709
[@gasket/plugin-middleware]: /packages/gasket-plugin-middleware/README.md
[@gasket/plugin-redux]: /packages/gasket-plugin-redux/README.md
[@gasket/plugin-nextjs]: /packages/gasket-plugin-nextjs/README.md
[@gasket/nextjs]: /packages/gasket-nextjs/README.md
[Edge Front Door]: https://github.com/gdcorp-uxp/frontdoor-infrastructure/blob/main/docs/README.md
[Static Page Routes Guide]: /packages/gasket-next/docs/static-page-routes.md
[Static App Routes Guide]: /packages/gasket-next/docs/static-app-routes.md

[PFX-668]: https://godaddy-corp.atlassian.net/browse/PFX-668
[PFX-675]: https://godaddy-corp.atlassian.net/browse/PFX-675
[PFX-676]: https://godaddy-corp.atlassian.net/browse/PFX-676
[PFX-677]: https://godaddy-corp.atlassian.net/browse/PFX-677
[PFX-678]: https://godaddy-corp.atlassian.net/browse/PFX-678
[PFX-679]: https://godaddy-corp.atlassian.net/browse/PFX-679
[PFX-680]: https://godaddy-corp.atlassian.net/browse/PFX-680
[PFX-681]: https://godaddy-corp.atlassian.net/browse/PFX-681
