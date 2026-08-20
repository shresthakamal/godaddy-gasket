# Examples

This document provides working examples for all exported interfaces from `@godaddy/gasket-plugin-shared-header`.

## Configuration

### Basic Plugin Configuration

```javascript
// gasket.js
export default makeGasket({
  plugins: [
    pluginSharedHeader
  ],
  pcSharedHeader: {
    params: {
      app: 'my-app',
      options: [/* insert options here */]
    }
});
```

### Environment-Specific Configuration

```javascript
// gasket.js with environment-specific settings
export default makeGasket({
  plugins: [
    pluginSharedHeader
  ],
  pcSharedHeader: {
    params: {
      app: 'my-app'
    },
    prefetch: true,
    client: {
      options: {
        cache: (env) => env === 'local' ? memoryCache : redisCache,
        cacheOnError: false
      }
    }
  }
});
```

## Actions

### getSharedHeader

Get shared headers using the Shared Header Client. This action will also call the `sharedHeader` lifecycle.

```javascript
// In server-side props
export async function getServerSideProps({ req }) {
  const headerData = await gasket.actions.getSharedHeader(req);
  return {
    props: {
      headerData
    }
  };
}
```

## Lifecycle Hooks

### sharedHeader

This lifecycle enables apps to provide custom identifiers and options for shared header requests.

#### Basic Implementation

```javascript
// gasket.js plugin
export default {
  name: 'my-shared-header-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      return {
        websiteId: 'my-website-id'
      };
    }
  }
};
```

#### Website ID Example

```javascript
// path-to-your-plugin-hooks/shared-header.js
import fetch from '@gasket/fetch';

export default {
  name: 'website-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const { config: { blogApi }, params } = req;
      if (params.websiteId) {
        return {
          websiteId: req.params.websiteId
        };
      }
      try {
        const response = await fetch(`${blogApi.url}/blog`, {
          headers: {
            cookie: req.get('cookie')
          }
        });
        const blog = await response.json();
        return {
          websiteId: blog.websiteId
        };
      } catch (e) {
        throw new Error(e);
      }
    }
  }
};
```

#### Venture ID Example

```javascript
// path-to-your-plugin-hooks/shared-header.js
export default {
  name: 'venture-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const { params } = req;
      if (params.ventureId) {
        return {
          ventureId: req.params.ventureId
        };
      }
      try {
        const response = await fetch(`${req.config.blogApi.url}/blog`, {
          headers: {
            cookie: req.get('cookie')
          }
        });
        const blog = await response.json();
        return {
          ventureId: blog.ventureId
        };
      } catch (e) {
        throw new Error(e);
      }
    }
  }
};
```

#### Business/Store ID with Options

```javascript
// path-to-your-plugin-hooks/shared-header.js
export default {
  name: 'business-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const { query: { businessId, storeId } } = req;
      const { headers: { 'user-agent': userAgent } } = req;

      const result = { businessId };

      if (storeId) {
        result.storeId = storeId;
      }

      // Add mobile options if needed
      if (isRequestFromMobileApp(userAgent)) {
        result.options = {
          params: {
            'header_options[display]': 'mobile'
          }
        };
      }

      return result;
    }
  }
};
```

#### Independents Header Configuration

```javascript
// path-to-your-plugin-hooks/shared-header.js
export default {
  name: 'independents-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const { query: { businessId, storeId } } = req;
      return {
        options: {
          params: {
            'header_options[manifest]': 'independents-header'
          }
        },
        businessId,
        storeId // optional, for Store header
      };
    }
  }
};
```

#### Domain-Based Configuration

```javascript
// path-to-your-plugin-hooks/shared-header.js
export default {
  name: 'domain-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const domainName = req.hostname;

      return {
        domainName,
        options: {
          params: {
            'header_options[locale]': req.locale || 'en-US'
          }
        }
      };
    }
  }
};
```

#### Account ID Configuration

```javascript
// path-to-your-plugin-hooks/shared-header.js
export default {
  name: 'account-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      // Extract account ID from authenticated user
      const { user } = req;

      if (user && user.accountId) {
        return {
          accountId: user.accountId
        };
      }

      return {};
    }
  }
};
```

#### App ID Configuration

```javascript
// path-to-your-plugin-hooks/shared-header.js
export default {
  name: 'app-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const { query: { appId } } = req;

      return {
        appId: appId || 'default-app-id',
        options: {
          params: {
            'header_options[theme]': 'modern'
          }
        }
      };
    }
  }
};
```

