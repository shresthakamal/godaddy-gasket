# @godaddy/gasket-plugin-proxy

Set up functions to make requests to APIs from the server, and surface them
as proxy endpoints to the browser.

## Guides

- [Quick Start]
- [Recipes]

## Installation

#### Existing apps

```
npm i @godaddy/gasket-plugin-proxy
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginProxy from '@godaddy/gasket-plugin-proxy';

export default makeGasket({
  plugins: [
+   pluginProxy
  ]
});
```

## Requirements

This plugin currently only works with Custom Server apps or APIs (Express)
and requires the following plugins:
- [@gasket/plugin-express]

## Configuration

There are several configuration options available for setting up your proxies.
For more direct implementation examples, see the [Recipes].

### Configure the plugin

In `gasket.js`, add a `proxy` object which will let you set the
[ProxyPluginConfig]. In it's simplest form, you would then add a `proxies`
property to define your proxy methods with [ProxyDescription] objects.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // webapp preset plugins
  ],
  proxy: {
    proxies: {
      getDoodadList: {
        targetUrl: 'https://api.my-service.com/doodads'
      }
    }
  }
});
```

As your proxy descriptions grow, you may consider organizing them to a separate
file(s) and import into your gasket.config.

### Using the proxy function

Now, when a request is sent to the app, you will have a `proxies` property
available from the `req` object, which contains async [methods][ProxyFn] to
issue requests to the `targetUrl` in the ProxyDescriptions.

```js
// example-page.js

export async function getServerSideProps({ req }) {
  const proxyResponse = await req.proxies.getDoodadList();

  if(proxyResponse.status >= 400) {
    // handle some erroneous response
  }
  // Do stuff

  const doodadList = proxyResponse.json()

  return {
    // will be passed to the page component as props
    props: {
      doodadList
    }
  }
}
```

Proxy functions will always resolve with a [ProxyResponse] which normalizes
successful and erroneous response structures. If you need to handle an error
response differently, check the status of the response to do so.

Proxy functions can be used for SSR or some more advanced cases like coalescing
data from multiple proxies for a single browser request. However, the most
common use case is to set up endpoints for the browser to make proxy requests.

### Setting up endpoints

In the ProxyDescription, simply add a `url` property with the path your and the
endpoint to be available as. The `method` can also be set here, but by default
is `GET`.

```diff
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // webapp preset plugins
  ],
  proxy: {
    proxies: {
      getDoodadList: {
+       url: '/api/proxies/doodads',
        targetUrl: 'https://api.my-service.com/doodads'
      }
    }
  }
});
```

Now in your browser code, you can fetch data from this proxy endpoint.

```jsx harmony
// example-page.js
import fetch from '@gasket/fetch';

export default class ExamplePage {
  async componentDidMount() {
    // return early if already fetched with getServerSideProps
    if(this.props.doodadList) return;

    const response = await fetch('/api/proxies/doodads');
    if(!response.ok) {
      // handle some erroneous response
    }
    // Do stuff
    const doodadList = proxyResponse.json()
  }

  render() {
    // return page contents
  }
}
```

Working with responses from a proxy endpoint will be like any another
endpoint the app may be fetching. If you have several endpoints and would like
to manage those with Redux state, consider using [Reduxful] to simplify those
configurations.

### Config based on environment

You can use the `gasket.js` to setup configs based on environment.
Reference the [Gasket Configuration Guide] for more details.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  proxy: {
    proxies: {
      getDoodadList: {
        url: '/api/proxies/doodads',
        targetUrl: 'https://api.my-service.com/doodads'
      }
    }
  },
  environments: {
    test: {
      proxy: {
        proxies: {
          getDoodadList: {
            targetUrl: 'https://test.api.my-service.com/doodads'
          }
        }
      }
    }
  }
});
```

In this case, we change the `targetUrl` for the proxy description in the test
environment, but the endpoint URL will remain the same.

### Config based on context

For most config options, it is possible to provide a [ConfigCallback] which
accepts a [ConfigContext], allowing configuration details to change during
runtime.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getDoodadList: {
        url: '/api/proxies/doodads',
        targetUrl: ({ gasket }) => `${gasket.config.myServiceApi}/doodads`
      }
    }
  },
  
  myServiceApi: 'https://dev.some-servce.com',
  environments: {
    test: {
      myServiceApi: 'https://test.some-service.com'
    },
    production: {
      myServiceApi: 'https://api.my-service.com'
    }
  }
});
```

In this example, we change the `targetUrl` from environment-based config.

### Path and query params

Endpoints can accept query params which will get passed along with the proxy
targetUrl. Additionally, endpoints can require path params, which can also
be applied to a targetUrl.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getDoodad: {
        url: '/api/proxies/doodads/:id',
        targetUrl: 'https://api.my-service.com/doodads/:id'
      }
    }
  }
});
```

In this example, the doodad `:id` in a fetch URL to our endpoint, will get
passed along as the `:id` path param in the proxy target.

A ProxyFn will use options from the original request (headers, query, params,
etc.) by default. However, this can be overridden as the argument to the proxy
function.

```js
const proxyResponse = await req.proxies.getDoodad({ query: { id: '123' }});
```

You can see query params were set in the custom request object here.
Query params passed to an endpoint, can be translated to path params in the
targetUrl. Likewise, any endpoint path params not described in a targetUrl
will be applied as query params.

### Configure proxy options

Beside query and path params, headers are also passed along from the original
request with the proxy call. Proxy requests also will use the HTTP method
set for the endpoint, or otherwise default to GET. This can also be changed in
the [proxy description options][OptionsConfig].

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getDoodad: {
        url: '/api/proxies/doodads/:id',
        targetUrl: 'https://api.my-service.com/doodads/:id',
        options: {
          method: 'POST',
          headers: {
            'X-Extra-Data': 'some extra value'
          }
        }
      }
    }
  }
});
```

In this case, the endpoint will be set up as `GET`, but make a `POST` request to
the targetUrl with an additional header argument.
In addition to method and headers, the options config can also be used to pass
those specific to the [RequestAdapter].

### Request adapter

The proxy plugin provides a [default adapter] which uses [@gasket/fetch].
This should give you all the tools you need for setting up an API proxy,
however other modules could be used instead by setting up a [RequestAdapter]
for them and assigning it for the proxy plugin config or a proxy description.

### From here

See the [Recipes] for advance configurations using examples using
request options.


<!-- Links -->
[ProxyPluginConfig]:lib/index.d.ts#L40
[ProxyDescription]:lib/index.d.ts#L63
[ProxyResponse]:lib/index.d.ts#L174
[ProxyFn]:lib/index.d.ts#L199
[OptionsConfig]:lib/index.d.ts#L145
[ConfigCallback]:lib/index.d.ts#L126
[ConfigContext]:lib/index.d.ts#L131
[RequestAdapter]:lib/index.d.ts#L192
[default adapter]:lib/index.d.ts#L207
[Recipes]:docs/recipes.md
[Quick Start]:docs/quickstart.md

<!-- External Links -->
[Gasket Configuration Guide]:https://github.com/godaddy/gasket/blob/main/packages/gasket-cli/docs/configuration.md#environments
[Reduxful]:https://github.com/godaddy/reduxful
[@gasket/fetch]:https://github.com/godaddy/gasket/tree/main/packages/gasket-fetch
[@gasket/plugin-express]: https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-express
[@gasket/plugin-middleware]: https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-middleware
