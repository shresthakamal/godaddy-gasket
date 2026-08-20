# @godaddy/gasket-plugin-shared-header

Gasket plugin to connect with the Shared Header client/service

## Installation

### New apps

```bash
gasket create <app-name> --plugins @godaddy/gasket-plugin-shared-header
```

### Existing apps

```bash
npm i @godaddy/gasket-plugin-shared-header
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginSharedHeader from '@godaddy/gasket-plugin-shared-header';

export default makeGasket({
  plugins: [
+   pluginSharedHeader
  ]
});
```

### Shared Header API

Since the shared header service is a proxy to the Presentation Central API we can allow additional options to be passed into the request url to hydra. An example of this config in your `gasket.js` is:

```javascript
export default makeGasket({
  pcSharedHeader: {
    params: {
      app: 'somename',
      options: [/* insert options here*/]
    },
    client: {
      options: {
        cache: (env) => {
          /* returns cache option based on env */
          return env === 'local' ? OneCacheOption : SecondCacheOption
        }
        /* insert other options from shared-header-client here https://github.com/gdcorp-uxp/shared-header-client?tab=readme-ov-file#options */
      }
    }
  }
})
```

- `params`: Any of these parameters to complete the request
  - `app`: **Required** The name of your P&C app.
  - `options`: These are additional options that will be passed to the hydra request
- `client`: Shared Header Client configuration
  - `options`: Options passed to Shared Header Client, check [PC/shared-header-client#options](https://github.com/gdcorp-uxp/shared-header-client?tab=readme-ov-file#options) for available options.

## Actions

### getSharedHeader

Get shared headers using the [Shared Header Client](https://github.com/gdcorp-uxp/shared-header-client). This action will also call the `shareHeader` lifecycle.

```javascript
 const data = await gasket.actions.getSharedHeader(req);
```

## Lifecycles

### sharedHeader

You will also need to create a lifecycle file for getting the `websiteId` or `ventureId` and [`options` (optional)]. The `websiteId or ventureId` and `options` will be used in the request to shared header service. The lifecycle method must return an object that contain the `websiteId or ventureId` and optionally `options` properties. Please note that the `options` returned by the lifecycle will override the `options` in the `pcSharedHeader` configuration. Below are some examples. (NOTE: websiteId will take precedence over ventureId but ventureId will be the default implementation)

Parameters:

- `gasket`: Gasket object
- `context`: Context object
  - req`: Request object
- `data`: object containing the following properties:
  - jwt: string;
  - app: string;
  - locale: string;
  - plid: number;
  - options: From the Gasket Config pcSharedHeader.params.options;

```javascript
// path-to-your-plugin-hooks/shared-header.js
import fetch from '@gasket/fetch';

// Example returning the website ID only

export default {
  name: 'example-plugin',
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
        }
      } catch (e) {
        throw new Error(e);
      }
    }
  }
};
```

```javascript
// path-to-your-plugin-hooks/shared-header.js
import fetch from '@gasket/fetch';

// Example returning the venture ID only

export default {
  name: 'example-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const { config: { blogApi }, params } = req;
      if (params.params) {
        return {
          ventureId: req.params.ventureId
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
          ventureId: blog.ventureId
        }
      } catch (e) {
        throw new Error(e);
      }
    }
  }
};
```

```javascript
// path-to-your-plugin-hooks/shared-header.js
import fetch from '@gasket/fetch';

// Example returning the website ID and options

export default {
  name: 'example-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const websiteId = req.path.split('/').slice(1, 2);
      const { headers: { 'user-agent': userAgent } } = req;

      try {
        let data = { websiteId };
        if (isRequestFromMobileApp(userAgent)) {
          data.options = {
            params: {
              'header_options[display]': 'mobile'
            }
          };
        }

        return data;
      } catch (e) {
        throw new Error(e);
      }
    }
  }
};
```

Commerce Home fetches the header using a Business ID and, optionally, Store ID.

Either option will always return the `independents-header` (a.k.a. Left Nav)
but we recommend adding `'header_options[manifest]': 'independents-header'` anyway.

```javascript
// path-to-your-plugin-hooks/shared-header.js
import fetch from '@gasket/fetch';

// Example returning the business ID and/or store ID

export default {
  name: 'example-plugin',
  hooks: {
    async sharedHeader(gasket, { req }, data) {
      const { query: { businessId, storeId } } = req;
      return {
        options: {
          params: {
            'header_options[manifest]': 'independents-header' // optional, defaults to independents-header
          }
        },
        businessId,
        storeId, // optional, for Store header
      }
    }
  }
};
```

## Runtime

It is possible to override the UXCore version on rendered pages by setting the URL param `shared-header.uxcore` to the desired UXCore version.  This is intended to make testing UXCore upgrades easier.
