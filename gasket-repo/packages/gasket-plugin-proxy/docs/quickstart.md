# Quick Start

This guide is meant to help cover the basics along with common scenarios you may encounter when adding proxies to avoid CORS, normalize routing, or simplify an API call for your application.

## Configuration

Proxies are configured by the `proxy.proxies` property in your `gasket.js`. For example, let's assume that we want to dynamically proxy `GET` requests for these two URLs to a value specified by the incoming HTTP request:

* `/products/api/free-credit`
* `/api/free-credit`

To do this we would put the following in our `gasket.js` file:

```js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      freeCredits: {
        url: '(/products)?/api/free-credit',
        targetUrl: ({ req }) => `${req.config.classicMyaApiUrl}/free-credit`
      }
    }
  }
  // ...
});
```

See full [ProxyPluginConfig] API Documentation for additional information.

Each entry within the `proxy.proxies` configuration has several properties to configure the proxy target. Here are the most commonly used properties:

### `url` - the proxy Source

Specifies the HTTP URL your application will accept and proxy from. Can be either a string like `/api/free-credit` or RegEx like `(/products)?/api/free-credit`.

### `targetUrl` - the proxy Destination

Specifies the HTTP URL requests will be directed to. Can be either a string `https://mya.godaddy.com/WebApi/free-credit` or Function ``({ req }) => `${req.config.classicMyaApiUrl}/free-credit` ``

Most likely use case for string would be if the URL pattern changes per environment that doesn't lend well to a simple function or trying a new endpoint, in that case adding the `proxy/proxies/<this_proxy>` value into specific environment may be preferable.

### `method` - the proxy source HTTP Method

Specifies the HTTP verb the proxy will listen to. `GET` is the defacto standard method for a proxy. If you need anything else (`POST`, `DELETE` or `PATCH`), you need to specify it. Each method requires it's own proxy.

### `responseTransform` - Transforming the proxied response

Specifies a function to modify the response returned through the proxy. May come in handy to convert XML to JSON or to append or replace headers.

For example, if we wanted a method to append no-cache headers to the response coming from the proxied destination we could use this function:

```js
const noCacheResponseTransform = ({ headers, ...response }) => ({
  ...response,
  headers: {
    ...headers,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Surrogate-Control': 'no-store',
    'Expires': 0
  }
});
```

For additional examples of `responseTransform`, see [Recipes].

### `options` - Configuring proxy options

This property is an object or function returning an object that affects the proxy's configuration.

Most likely option to be used:

* `rejectUnauthorized`: Set to `false` to allow self-signed certs or resolve TLS issues

<!-- Links -->
[ProxyPluginConfig]:api.md#ProxyPluginConfig
[Recipes]:recipes.md
