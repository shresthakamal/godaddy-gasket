# CDE Plugin Examples

## Plugin Configuration

### Basic Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginCde
  ],
  cde: {
    enable: true,
    options: {
      sidecarUrl: 'http://localhost:8080',
      bucketingIdType: 'shopperId',
      samplingRate: 0.5
    }
  }
});
```

### Advanced Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginCde
  ],
  cde: {
    enable: true,
    options: {
      sidecarUrl: 'http://localhost:8080',
      dxEnabled: false,
      bucketingIdType: 'visitorId',
      samplingRate: 0.3,
      maxRetries: 5,
      retryDelayMs: 500,
      samplingMethod: 'HashBasedSticky',
      cdeAppId: 'my-app',
      commitHash: 'abc123',
      cdeAppVersion: '1.0.0',
      katanaArtifactVersion: '2.0.0',
      additionalExcludedPaths: ['/health', '/status'],
      includedPaths: ['/api/*', '/shop/*']
    }
  }
});
```

## Action Usage

### Manual Event Sending

```js
// In a middleware or route handler
export default function myMiddleware(gasket) {
  return async (req, res, next) => {
    // Send evaluation event via gasket actions
    await gasket.actions.sendAppEvaluationEvent(req);
    next();
  };
}
```

### Alternative Usage Pattern

```js
// In any async function with access to gasket and req
async function handleRequest(gasket, req) {
  // Send app evaluation event via gasket actions
  await gasket.actions.sendAppEvaluationEvent(req);
}
```

## Lifecycle Hook Implementation

### Basic Lifecycle Hook

```js
export default {
  name: 'my-cde-plugin',
  hooks: {
    async appEvaluationEvent(gasket, eventDetails, context) {
      const { req } = context;
      // Override params with custom values for the request/evaluation
      return {
        ...eventDetails,
        customerId: 'override-customer-123',
        careConversationId: 'custom-care-id'
      };
    }
  }
};
```

### Advanced Lifecycle Hook

```js
export default {
  name: 'my-advanced-cde-plugin',
  hooks: {
    async appEvaluationEvent(gasket, eventDetails, context) {
      const { req } = context;
      const userAgent = req.headers['user-agent'];
      const isMobile = /mobile/i.test(userAgent);

      // Add custom properties based on request context
      return {
        ...eventDetails,
        deviceType: isMobile ? 'mobile' : 'desktop',
        userAgent: userAgent?.substring(0, 100), // Truncate for privacy
        requestTimestamp: Date.now(),
        customAttributes: {
          feature: 'experiment-A',
          cohort: req.query.cohort || 'control'
        }
      };
    }
  }
};
```

## Express Integration

### Custom Express Route

```js
export default {
  name: 'routes-plugin',
  hooks: {
    express: {
      handler: (gasket, app) => {
        app.get('/api/trigger-evaluation', async (req, res) => {
          try {
            // Manually trigger evaluation
            await gasket.actions.sendAppEvaluationEvent(req);
            res.json({ success: true });
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        });
      }
    }
  }
};
```

## TypeScript Usage

### Typed Configuration

```ts
import type { CDEConfig } from '@godaddy/gasket-plugin-cde';

const cdeConfig: CDEConfig = {
  enable: true,
  options: {
    sidecarUrl: 'http://localhost:8080',
    bucketingIdType: 'customerId',
    samplingRate: 0.1
  }
};

export default makeGasket({
  plugins: [pluginCde],
  cde: cdeConfig
});
```

### Typed Lifecycle Hook

```ts
import type {
  CdeAppEvaluationEvent,
  HttpContext
} from '@godaddy/gasket-plugin-cde';
import type { Gasket } from '@gasket/core';

export default {
  name: 'typed-cde-plugin',
  hooks: {
    async appEvaluationEvent(
      gasket: Gasket,
      eventDetails: CdeAppEvaluationEvent,
      context: HttpContext
    ): Promise<CdeAppEvaluationEvent> {
      const { req } = context;

      return {
        ...eventDetails,
        customerId: req.user?.customerId || eventDetails.customerId,
        careConversationId: req.query.conversationId as string
      };
    }
  }
};
```
