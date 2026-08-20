# @godaddy/gasket-plugin-uxp Examples

This document provides working examples for all exported interfaces from the `@godaddy/gasket-plugin-uxp` package.

## Plugin Configuration

### Basic Plugin Setup

```js
// gasket.js
import pluginUxp from '@godaddy/gasket-plugin-uxp';

export default makeGasket({
  plugins: [
    pluginUxp
  ],
  presentationCentral: {
    params: {
      app: 'my-app',
      manifest: 'application-header'
    }
  }
});
```

### Advanced Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginUxp
  ],
  presentationCentral: {
    version: '3.0',
    env: 'prod',
    maxAge: '30 minutes',
    maxStaleness: '5 minutes',
    timeout: '10 seconds',
    fsCachePath: '/tmp/pc-cache',
    params: {
      app: 'my-app',
      manifest: 'internal-header',
      theme: 'go-dark:brand',
      uxcore: false,
      deferjs: true
    },
    enablePartnersHeaderOverride: true
  },
  uxp: {
    externals: false
  }
});
```

## Actions

### getPresentationCentral

```js
// middleware/presentation-central.js
export default {
  name: 'pc-middleware',
  hooks: {
    middleware(gasket) {
      return async function (req, res, next) {
        try {
          const pcContent = await gasket.actions.getPresentationCentral(req);

          // Access the data
          const { data, meta, error } = pcContent;
          console.log('PC CSS:', data.assets?.css);
          console.log('PC Header:', data.header);

          // Make available to templates
          next();
        } catch (err) {
          next(err);
        }
      };
    }
  }
};
```

```js
// pages/api/pc.js
import gasket from '../../gasket.js';

export default async function handler(req, res) {
  const pcContent = await gasket.actions.getPresentationCentral(req);
  res.json(pcContent);
}
```

## Lifecycle Hooks

### presentationCentral

```js
// plugins/pc-params.js
export default {
  name: 'pc-params',
  hooks: {
    async presentationCentral(gasket, params, { req }) {
      // Add custom parameters to PC request
      const visitor = await gasket.actions.getVisitor(req);

      params.navigation = { activeSection: req.url.split('/')[1] };
      params.customerId = visitor.customerId;
      params.split = 'sidebar';

      // Conditional theme based on user type
      if (req.user?.isPremium) {
        params.theme = 'premium-theme';
      }
    }
  }
};
```

### headerContent

```js
// plugins/header-content.js
export default {
  name: 'header-content',
  hooks: {
    async headerContent(gasket, content, { req }) {
      const { data, meta } = content;

      // Modify the header content
      const modifiedContent = {
        ...content,
        data: {
          ...data,
          // Add custom CSS
          assets: {
            ...data.assets,
            css: data.assets?.css + '\n<link rel="stylesheet" href="/custom.css">'
          },
          // Inject custom scripts
          header: data.header + '\n<script>window.customApp = true;</script>'
        }
      };

      return modifiedContent;
    }
  }
};
```

## Common Patterns

### Custom Header Based on Environment

```js
export default {
  name: 'env-header',
  hooks: {
    configure(gasket, config) {
      const { env } = gasket.config;

      return {
        ...config,
        presentationCentral: {
          ...config.presentationCentral,
          params: {
            ...config.presentationCentral?.params,
            manifest: env.includes('local') || env.includes('dev')
              ? 'internal-header'
              : 'application-header'
          }
        }
      };
    }
  }
};
```
