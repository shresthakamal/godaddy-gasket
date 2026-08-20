# Examples

This document provides working examples for all exported functionality from `@godaddy/gasket-plugin-proxy`.

## Table of Contents

- [Plugin Configuration](#plugin-configuration)
- [Using getProxies Action](#using-getproxies-action)
- [Request Proxy Functions](#request-proxy-functions)
- [Custom Request Adapter](#custom-request-adapter)
- [Request Transforms](#request-transforms)
- [Response Transforms](#response-transforms)
- [Express Endpoints](#express-endpoints)
- [Caching](#caching)
- [Error Handling](#error-handling)

## Plugin Configuration

### Basic Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginProxy from '@godaddy/gasket-plugin-proxy';

export default makeGasket({
  plugins: [
    pluginProxy
  ],
  proxy: {
    proxies: {
      getUserData: {
        targetUrl: 'https://api.example.com/users/:id'
      }
    }
  }
});
```

### Multiple Proxies

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getUserData: {
        targetUrl: 'https://api.example.com/users/:id'
      },
      getOrderHistory: {
        targetUrl: 'https://api.example.com/orders',
        method: 'GET'
      },
      createOrder: {
        targetUrl: 'https://api.example.com/orders',
        method: 'POST'
      }
    }
  }
});
```

### Configuration with Dynamic Values

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getApiData: {
        targetUrl: ({ gasket }) => `${gasket.config.apiBaseUrl}/data`,
        options: ({ req }) => ({
          headers: {
            'Authorization': `Bearer ${req.headers.authorization}`
          }
        })
      }
    }
  },
  apiBaseUrl: 'https://api.example.com'
});
```

## Using getProxies Action

### In Plugin or Lifecycle

```js
// gasket-plugin-example.js
export default {
  name: 'example-plugin',
  hooks: {
    async express(gasket, app) {
      const proxies = gasket.actions.getProxies();

      app.get('/custom-endpoint', async (req, res) => {
        try {
          const result = await proxies.getUserData(req);
          res.json(result.body);
        } catch (error) {
          res.status(500).json({ error: 'Proxy failed' });
        }
      });
    }
  }
};
```

### In Middleware

```js
// plugins/custom-middleware.js
export default {
  name: 'custom-middleware',
  hooks: {
    middleware(gasket) {
      return async function customMiddleware(req, res, next) {
        const proxies = gasket.actions.getProxies();

        // Pre-fetch some data
        try {
          const userData = await proxies.getUserData(req);
          req.userData = userData.body;
        } catch (error) {
          req.userData = null;
        }

        next();
      };
    }
  }
};
```

## Request Proxy Functions

### Using Proxies in Middleware

Since proxy functions are not automatically attached to `req.proxies`, you need to manually access them via the `getProxies` action:

```js
// plugins/user-data-middleware.js
export default {
  name: 'user-data-middleware',
  hooks: {
    middleware(gasket) {
      return async function userDataMiddleware(req, res, next) {
        const proxies = gasket.actions.getProxies();

        // Attach proxy functions to request for easy access
        req.proxies = proxies;

        next();
      };
    }
  }
};
```

### Basic Usage in Server-side Code

```js
import gasket from './gasket.js';

// pages/user-profile.js
export async function getServerSideProps({ req, params }) {
  // Access proxies through gasket instance or attached to req by middleware
  const proxies = gasket.actions.getProxies();

  try {
    const userResponse = await proxies.getUserData(req);

    if (userResponse.status === 200) {
      return {
        props: {
          user: userResponse.body
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }

  return {
    props: {
      user: null
    }
  };
}

export default function UserProfile({ user }) {
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### With Path Parameters

```js
// gasket.js - Configuration
proxy: {
  proxies: {
    getUserData: {
      targetUrl: 'https://api.example.com/users/:id'
    }
  }
}

// pages/users/[id].js
export async function getServerSideProps({ req, params }) {
  const proxies = gasket.actions.getProxies();

  // req.params will contain { id: '123' } from the route
  const response = await proxies.getUserData(req);

  return {
    props: {
      user: response.body
    }
  };
}
```

### With Query Parameters

```js
// pages/api/search.js
import gasket from './gasket.js';

export default async function handler(req, res) {
  const proxies = gasket.actions.getProxies();

  // req.query contains query parameters
  const searchResponse = await proxies.searchUsers(req);

  res.status(searchResponse.status).json(searchResponse.body);
}
```

## Custom Request Adapter

### Basic Custom Adapter

```js
// lib/my-request-adapter.js
// Requires Node.js 18+ for native fetch support

export async function myRequestAdapter(adapterRequest, requestContext) {
  const { url, method, headers, body } = adapterRequest;
  const { originalReq } = requestContext;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const responseBody = await response.text();

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody
    };
  } catch (error) {
    return {
      status: 500,
      headers: {},
      body: JSON.stringify({ error: error.message })
    };
  }
}
```

### Using Custom Adapter

```js
// gasket.js
import { myRequestAdapter } from './lib/my-request-adapter.js';

export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    requestAdapter: myRequestAdapter, // Global adapter
    proxies: {
      getUserData: {
        targetUrl: 'https://api.example.com/users/:id'
      },
      getSpecialData: {
        targetUrl: 'https://special-api.com/data',
        requestAdapter: myRequestAdapter // Per-proxy adapter
      }
    }
  }
});
```

### Adapter with Authentication

```js
// lib/auth-request-adapter.js
import { defaultRequestAdapter } from '@godaddy/gasket-plugin-proxy';

export async function authRequestAdapter(adapterRequest, requestContext) {
  const { originalReq } = requestContext;

  // Add authentication headers
  const authHeaders = {
    ...adapterRequest.headers,
    'Authorization': `Bearer ${originalReq.cookies.auth_token}`,
    'X-API-Key': process.env.API_KEY
  };

  const enhancedRequest = {
    ...adapterRequest,
    headers: authHeaders
  };

  return defaultRequestAdapter(enhancedRequest, requestContext);
}
```

## Request Transforms

### Adding Authentication Headers

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getSecureData: {
        targetUrl: 'https://api.example.com/secure',
        requestTransform: ({ req }) => (request) => ({
          ...request,
          headers: {
            ...request.headers,
            'Authorization': `Bearer ${req.cookies.auth_token}`,
            'X-User-ID': req.user?.id
          }
        })
      }
    }
  }
});
```

### Filtering Headers

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getApiData: {
        targetUrl: 'https://api.example.com/data',
        requestTransform: ({ req }) => (request) => {
          const { cookie, host, ...safeHeaders } = request.headers;

          return {
            ...request,
            headers: {
              ...safeHeaders,
              'Content-Type': 'application/json'
            }
          };
        }
      }
    }
  }
});
```

### Dynamic Request Modification

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      postData: {
        targetUrl: 'https://api.example.com/data',
        method: 'POST',
        requestTransform: ({ req, gasket }) => (request) => {
          const timestamp = new Date().toISOString();

          return {
            ...request,
            body: {
              ...request.body,
              timestamp,
              source: gasket.config.appName,
              userId: req.user?.id
            }
          };
        }
      }
    }
  }
});
```

## Response Transforms

### Data Extraction

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getUserData: {
        targetUrl: 'https://api.example.com/users/:id',
        responseTransform: (response) => ({
          ...response,
          body: response.body.data || response.body
        })
      }
    }
  }
});
```

### Error Normalization

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getApiData: {
        targetUrl: 'https://api.example.com/data',
        responseTransform: (response) => {
          if (response.status >= 400) {
            return {
              ...response,
              body: {
                error: true,
                message: response.body.message || 'API Error',
                status: response.status
              }
            };
          }
          return response;
        }
      }
    }
  }
});
```

### Adding Metadata

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getProcessedData: {
        targetUrl: 'https://api.example.com/data',
        responseTransform: (response, { req, originalReq }) => ({
          ...response,
          body: {
            ...response.body,
            metadata: {
              timestamp: new Date().toISOString(),
              requestId: originalReq.id,
              processedAt: 'proxy-layer'
            }
          }
        })
      }
    }
  }
});
```

## Express Endpoints

### Basic GET Endpoint

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getUserData: {
        url: '/api/users/:id',
        targetUrl: 'https://api.example.com/users/:id',
        method: 'GET'
      }
    }
  }
});

// Now accessible at: GET /api/users/123
```

### POST Endpoint with Body

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      createUser: {
        url: '/api/users',
        targetUrl: 'https://api.example.com/users',
        method: 'POST'
      }
    }
  }
});

// Usage:
// POST /api/users
// Body: { "name": "John", "email": "john@example.com" }
```

### Endpoint with Custom Middleware

```js
// middleware/auth-check.js
export function requireAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  next();
}

// gasket.js
import { requireAuth } from './middleware/auth-check.js';

export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    middleware: [requireAuth], // Global middleware
    proxies: {
      getSecureData: {
        url: '/api/secure-data',
        targetUrl: 'https://api.example.com/secure',
        middleware: [(req, res, next) => {
          console.log('Accessing secure endpoint');
          next();
        }]
      }
    }
  }
});
```

## Caching

### Basic Cache Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    cache: {
      max: 100,        // Maximum cache entries
      maxAge: 300000   // 5 minutes in milliseconds
    },
    proxies: {
      getUserData: {
        targetUrl: 'https://api.example.com/users/:id',
        cache: true  // Enable caching for this proxy
      }
    }
  }
});
```

### Per-Proxy Cache Settings

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getFastData: {
        targetUrl: 'https://api.example.com/fast',
        cache: {
          max: 50,
          maxAge: 60000  // 1 minute
        }
      },
      getSlowData: {
        targetUrl: 'https://api.example.com/slow',
        cache: {
          max: 10,
          maxAge: 600000  // 10 minutes
        }
      }
    }
  }
});
```

### Dynamic Cache Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginProxy],
  proxy: {
    proxies: {
      getConditionalData: {
        targetUrl: 'https://api.example.com/data',
        cache: ({ req }) => {
          // Only cache for GET requests with specific headers
          if (req.method === 'GET' && req.headers['x-cache-enabled']) {
            return {
              max: 25,
              maxAge: 180000  // 3 minutes
            };
          }
          return false;
        }
      }
    }
  }
});
```
