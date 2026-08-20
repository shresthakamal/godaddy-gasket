# Proxy configuration recipes

While the proxy plugin simplifies proxy endpoint configurations for your gasket
apps, it also provides quite a few tools for various situations or requirements
in working with with difference api services.

This guide provides some example for more advanced configuration needs.

### Use auth header with proxy

Additional headers, including auth headers, can be added as part of the
[OptionsConfig], or applied in a [RequestTransformFn]. In example below, the
request headers are replaced with the `Authorization` header, passing the auth
token from the parsed cookies on the original req.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeUserData: {
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        requestTransform: ({ req }) => request => ({
          ...request,
          headers: {
            Authorization: 'sso-jwt ' + req.cookies['auth_idp']
          }
        })
      }
    }
  }
});
```

The `requestTransform` can be a thunk, as in this example, which allows
access to the [ConfigContext] when setting up your transforms. This allows you
to access data set by middleware on the original req, such as parsed cookies.

### Reusable transformers

If you find yourself doing a lot of the same things more than once for your
proxies, consider moving those out to be resuable functions. This example
creates a transformer that moves the jwt from cookies to auth header as the
previous example, but with options to change realms.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

const withAuthHeader = realm => ({ req }) => request => {
  // strip out cookie from original headers
  const { cookie, ...headers } = req.headers; // eslint-ignore-line no-unused-vars

  return {
    ...request,
    headers: {
      // spread remaining original headers
      ...headers,
      // add auth header with jwt from the parsed cookies
      Authorization: 'sso-jwt ' + req.cookies[`auth_${realm}`]
    }
  };
};


export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeInternalData: {
        url: '/api/path/to/internal/users/:user',
        targetUrl: 'https://some.internal-api.com/api/v1/path/users/:user',
        requestTransform: withAuthHeader('jomax')
      },
      getSomeUserData: {
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        requestTransform: withAuthHeader('idp')
      }
    }
  }
});
```

### Using client SSL certs

If the target endpoint uses a client ssl certificate for security, you can pass
the cert data with the `options` config to the RequestAdapter. The plugin uses `@gasket/fetch`, so all the [node-fetch options] are available.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeUserData: {
        method: 'GET',
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        options: ({ req }) => ({
          cert: req.config['/my-site/certs/cert'],
          key: req.config['/my-site/certs/key'],
          ca: req.config['/my-site/certs/ca']
        })
      }
    }
  }
});
```

Also note in this example, `options` to set to a [ConfigCallback], making the
[ConfigContext] available to pull provide access to the app-level config in
`req.config`.

### Switching HTTP method in proxy

Its possible to surface a endpoint with a different HTTP method from the one
being proxied by setting `options.method` to a different HTTP verb.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeUserData: {
        method: 'GET',
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        options: {
          method: 'POST'
        }
      }
    }
  }
});
```

In this example, a GET endpoint will make a POST request to the proxy target
url.


### Control cookies

It may be required to control which cookies should be passed to the proxy
target. You can do that by explicitly transforming the cookie header.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeUserData: {
        method: 'GET',
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        requestTransform: ({ req }) => request => ({
          ...request,
          headers: {
            ...req.headers,
            cookie: {
              market: req.cookies.market
            }
          }
        })
      }
    }
  }
});
```

In this example, all the original request headers will be passed, however only
market will be passed along from the cookie.

### Enable proxy response caching

Cache settings can be provided for all the endpoint, but they need to be
explicitly enabled for each endpoint by setting `cache` to ether `true` or a
[CacheConfig] object. Caches are instantiated separately for each endpoint.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeUserData: {
        method: 'GET',
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        // No cache settings here, so data for this endpoint won't be cached.
      },
      getSomeReportData1: {
        method: 'GET',
        url: '/api/path/to/report1',
        targetUrl: 'https://some.api.com/api/v1/path/report1',
        cache: true     // This will be cached with the settings specified for the proxy.
      },
      getSomeReportData2: {
        method: 'GET',
        url: '/api/path/to/report2',
        targetUrl: 'https://some.api.com/api/v1/path/report2',
        cache: {
          max: 1       // This will cache only one key for this endpoint.
        }
      }
    },
    cache: {
      max: 50,
      maxAge: 360000
    }
  }
});
```

If `max` is set to 10, it will keep up to 10 keys in that cache. Any more
additions will force it to drop the older keys off the cache.

Endpoints with user specific data should not be cached, as the cache keys are
based on targetUrl, and not anything specific to the user or agent requesting.


### Modifying proxy response

You can check the proxy response data and modify it as needed, before it is
returned back to the adapter. You can do that in a [ResponseTransformFn].

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeUserData: {
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        //
        // change the response body to be an attribute of proxy response
        //
        responseTransform: (response) => {
          return {
            ...response,
            body: response.body.value
          };
        }
      },
      getSomeCustomerData: {
        method: 'GET',
        url: '/api/path/to/customers/:customer',
        targetUrl: 'https://some.api.com/api/v1/path/customer/:customer',
        //
        // Change status code based on proxy response body
        //
        responseTransform: (response) => {
          let { status } = response;
          if( status === 500 && response.body.indexOf('not found') ) {
            status = 404
          }
          return {
            ...response,
            status
          };
        }
      },
      getJsonData: {
        method: 'GET',
        url: '/api/path/to/common/data',
        targetUrl: 'https://some.dev-api.com/api/path/to/common/data',
        //
        // Convert an XML proxy response to JSON
        //
        responseTransform: (response) => {
          const { headers, body } = response;
          if(/xml/.test(headers.contentType)) {
            const json = someXmlParser(body);
            return {
              ...response,
              headers: {
                ...headers,
                contentType: 'application/json',
              },
              body: json
            }
          }
          return response;
        }
      }
    }
  }
});
```

### Managing log Levels

Use the [LogLevelsConfig] to control what log levels of responses based on
response status codes. This can be configured at the [ProxyPluginConfig] or each
individual [ProxyDescription].

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // plugins
  ],
  proxy: {
    proxies: {
      getSomeUserData: {
        method: 'GET',
        url: '/api/path/to/users/:user',
        targetUrl: 'https://some.api.com/api/v1/path/users/:user',
        responseTransform: (targetRes) => {
          return {
            data: {
              not: 'good',
              ...targetRes.data
            }
          };
        },
        //
        // This overrides the setting for this endpoint.
        // So any status code from 404 to 499, will be logged as error.
        //
        logLevels: {
          404: 'error'

        }
      }
    },
    //
    // This overrides the default 200 setting.
    // So any status codes from 200 to 399 will now be logged as debug
    //
    logLevels: {
      200: 'debug'
    }
  }
});
```


<!-- Links -->
[API docs]:./api.md
[ProxyPluginConfig]:./api.md#ProxyPluginConfig
[ProxyDescription]:./api.md#ProxyDescription
[ProxyResponse]:./api.md#ProxyResponse
[ConfigCallback]:./api.md#ConfigCallback
[ConfigContext]:./api.md#ConfigContext
[RequestAdapter]:./api.md#RequestAdapter
[LogLevelsConfig]:./api.md#LogLevelsConfig
[OptionsConfig]:./api.md#OptionsConfig
[RequestTransformFn]:./api.md#RequestTransformFn
[ResponseTransformFn]:./api.md#ResponseTransformFn
[AdapterRequest]:./api.md#AdapterRequest
[CacheConfig]:./api.md#CacheConfig
[default adapter]:./api.md#defaultRequestAdapter
[Recipes]:./recipes.md

<!-- External Links -->
[node-fetch options]:https://github.com/node-fetch/node-fetch?tab=readme-ov-file#options
