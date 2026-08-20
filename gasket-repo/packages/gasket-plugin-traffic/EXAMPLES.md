# @godaddy/gasket-plugin-traffic Examples

This document provides working examples for all exported interfaces, actions, and lifecycle hooks from the `@godaddy/gasket-plugin-traffic` package.

## Plugin Installation

```js
// gasket.js
import pluginTraffic from '@godaddy/gasket-plugin-traffic';

export default makeGasket({
  plugins: [
    pluginTraffic
  ]
});
```

## Lifecycle Hooks

### trafficDataLayer

> ⚠️ **DEPRECATED:** Use [tccData](#tccData) instead.

Customize the data layer for Traffic by adding custom properties to the traffic configuration.

```js
// In a plugin
export default {
  name: 'traffic-customization',
  hooks: {
    trafficDataLayer: async (gasket, context) => {
      const { req } = context;

      return {
        app: 'my-application',
        dcenter: process.env.DATACENTER || 'US-West-2',
        'tcc.pageId': req.path,
        'tcc.realm': 'idp',
        'tcc.gaContentGroup': 'ecommerce'
      };
    }
  }
};
```

```js
// Adding dynamic data based on request
export default {
  name: 'dynamic-traffic-data',
  hooks: {
    trafficDataLayer: async (gasket, context) => {
      const { req } = context;
      const { plid, market } = await gasket.actions.getVisitor?.(req) ?? {};

      return {
        app: `my-app-${plid}`,
        isc: `${market}-homepage`,
        'tcc.eventDelayMs': 2000,
        'tcc.manualPagePerf': false
      };
    }
  }
};
```

### tccData

Customize the data layer for Traffic by adding, modifying, or removing properties from the traffic configuration.

```js
// In a plugin
export default {
  name: 'traffic-customization',
  hooks: {
    tccData: async (gasket, data, context) => {
      const { req } = context;

      return {
        ...data,
        app: 'my-application',
        dcenter: process.env.DATACENTER || 'us-west-2',
        'tcc.pageId': req.path,
        'tcc.realm': 'idp',
        'tcc.gaContentGroup': 'ecommerce'
      };
    }
  }
};
```

```js
// Removing a property from the data layer
export default {
  name: 'remove-traffic-data',
  hooks: {
    tccData: async (gasket, data) => {
      const { loadSource, ...rest } = data;
      return rest;
    }
  }
};
```

### signalsConfig

Customize the Signals configuration for experiment tracking by modifying or adding experiments.

```js
// In a plugin
export default {
  name: 'signals-customization',
  hooks: {
    signalsConfig: async (gasket, config, context) => {
      const { req } = context;

      // Add custom experiments
      return {
        config: {
          experiments: [
            ...config.config?.experiments || [],
            {
              id: 'my-custom-experiment',
              variant: 'control'
            }
          ]
        }
      };
    }
  }
};
```

```js
// Conditional experiment configuration
export default {
  name: 'conditional-signals',
  hooks: {
    signalsConfig: async (gasket, config, context) => {
      const { req } = context;
      const userAgent = req.headers['user-agent'] || '';

      // Add mobile-specific experiments
      if (userAgent.includes('Mobile')) {
        return {
          config: {
            experiments: [
              ...config.config?.experiments || [],
              {
                id: 'mobile-checkout-flow',
                variant: 'optimized'
              }
            ]
          }
        };
      }

      return config;
    }
  }
};
```
