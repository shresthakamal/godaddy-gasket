# @godaddy/gasket-plugin-switchboard Examples

This document provides working examples for all exported functions, methods, types, and lifecycle hooks from the `@godaddy/gasket-plugin-switchboard` package.

## Plugin Installation

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginSwitchboard from '@godaddy/gasket-plugin-switchboard';

export default makeGasket({
  plugins: [
    pluginSwitchboard
  ],
  switchboard: {
    app: 'my-app',
    auth: {
      primaryRegion: 'us-west-2',
      secondaryRegion: 'us-east-1'
    },
    enableGasketData: true
  }
});
```

## Actions

### getSwitchboardClient

Get the Switchboard client instance.

```js
// In a plugin or middleware
export default {
  name: 'my-plugin',
  hooks: {
    async middleware(gasket) {
      return async (req, res, next) => {
        const client = await gasket.actions.getSwitchboardClient();

        if (client) {
          // Use the client directly
          const config = await client.getValuesTree('my-app', '', {
            locale: 'en-US',
            plid: 1
          });
          console.log('Raw config:', config);
        }

        next();
      };
    }
  }
};
```

### getSwitchboardConfig

Get the full switchboard configuration for a request.

```js
import gasket from '../gasket.js';

// In Next.js getServerSideProps
export async function getServerSideProps({ req }) {
  const switchboardConfig = await gasket.actions.getSwitchboardConfig(req);

  return {
    props: {
      featureFlags: switchboardConfig.featureFlags || {},
      userSettings: switchboardConfig.userSettings || {}
    }
  };
}
```

### getPublicSwitchboardConfig

Get the public (browser-safe) switchboard configuration.

```js
// In a plugin that exposes config to the browser
export default {
  name: 'config-plugin',
  hooks: {
    async middleware(gasket) {
      return async (req, res, next) => {
        const publicConfig = await gasket.actions.getPublicSwitchboardConfig(req);
        res.locals.browserConfig = publicConfig;
        next();
      };
    }
  }
};
```

### getExperimentCohorts

Get experiment cohort assignments for Hivemind experiments.

```js
import gasket from '../gasket.js';

// In a component for A/B testing
export async function getServerSideProps({ req }) {
  const cohorts = await gasket.actions.getExperimentCohorts(req);

  return {
    props: {
      experimentA: cohorts.experimentA || 'control',
      experimentB: cohorts.experimentB || 'control'
    }
  };
}
```

## Configuration

### Basic Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwitchboard],
  switchboard: {
    app: 'my-app',
    auth: {
      primaryRegion: 'us-west-2',
      secondaryRegion: 'us-east-1'
    },
    cacheRefreshMs: 120000
  }
});
```

### OAuth Authentication

Authenticate with an OAuth Bearer token by setting `auth.type`. The token is
obtained and refreshed automatically for every mode except `oauth_manual`.

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwitchboard],
  switchboard: {
    app: 'my-app',
    // Exchange the AWS IAM role for an OAuth token
    auth: {
      type: 'oauth_iam_exchange',
      primaryRegion: 'us-west-2',
      secondaryRegion: 'us-east-1'
    }
    // Other modes: 'oauth_client_credentials' (clientId/clientSecret),
    // 'oauth_cert_exchange' (cert/key), 'oauth_cert_path_exchange'
    // (certPath/keyPath), and 'oauth_manual' (initialToken).
  }
});
```

### Multi-App Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwitchboard],
  switchboard: {
    apps: ['app-a', 'app-b'],
    appSettings: {
      'app-a': ['setting1', 'setting2'],
      'app-b': ['setting3', 'setting4']
    },
    output: {
      multiApp: 'group'  // Keep apps separate instead of merging
    }
  }
});
```

### Conditional Enablement

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwitchboard],
  switchboard: {
    app: 'my-app',
    enable: ({ req }) => {
      // Only enable for specific routes
      return req.path.startsWith('/admin');
    }
  }
});
```

### Hivemind Experiments

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwitchboard],
  switchboard: {
    apps: ['my-app', '@hivemind'],
    appSettings: {
      '@hivemind': ['experiment1', 'experiment2']
    },
    appLabels: {
      '@hivemind': ['team1', 'team2']
    }
  }
});
```

### Redux Integration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwitchboard],
  switchboard: {
    app: 'my-app',
    enableRedux: true
  }
});

// In a React component
import { useSelector } from 'react-redux';

export function FeatureComponent() {
  const switchboardConfig = useSelector(state => state.config.switchboard);

  return (
    <div>
      {switchboardConfig.newFeature && (
        <div>New feature is enabled!</div>
      )}
    </div>
  );
}
```

### Gasket Data Integration

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwitchboard],
  switchboard: {
    app: 'my-app',
    enableGasketData: true
  }
});

// In a React component
import { useGasketData } from '@gasket/nextjs';

export function FeatureComponent() {
  const { switchboard } = useGasketData();

  return (
    <div>
      {switchboard.newFeature && (
        <div>New feature is enabled!</div>
      )}
    </div>
  );
}
```

## Lifecycle Hooks

### switchboardPerRequestParams

Add custom parameters for switchboard rule evaluation.

```js
// In a plugin
export default {
  name: 'custom-params-plugin',
  hooks: {
    async switchboardPerRequestParams(gasket, params, { req }) {
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

      return {
        ...params,
        isMobile,
        userAgent: userAgent.substring(0, 100), // Truncate for safety
        customerId: req.session?.customerId
      };
    }
  }
};
```

### switchboardConfigOverride

Override or modify the fetched switchboard configuration.

```js
// In a plugin for testing overrides
export default {
  name: 'config-override-plugin',
  hooks: {
    switchboardConfigOverride(gasket, config, { req }) {
      // Override config for integration tests
      if (req.headers['x-integration-test']) {
        return {
          ...config,
          testMode: true,
          featureFlags: {
            ...config.featureFlags,
            experimentalFeature: true
          }
        };
      }

      // Override for specific user types
      if (req.user?.role === 'beta-tester') {
        return {
          ...config,
          betaFeatures: true
        };
      }

      return config;
    }
  }
};
```

### switchboardBrowserState

Control what switchboard data is exposed to the browser.

```js
// In a plugin for client-side filtering
export default {
  name: 'browser-state-plugin',
  hooks: {
    switchboardBrowserState(gasket, config, { req }) {
      // Only expose safe configuration to the browser
      const {
        serverOnlySecrets,
        internalApiKeys,
        ...browserSafeConfig
      } = config;

      // Add user-specific client config
      return {
        ...browserSafeConfig,
        userId: req.user?.id,
        theme: req.user?.preferences?.theme || 'light'
      };
    }
  }
};
```
