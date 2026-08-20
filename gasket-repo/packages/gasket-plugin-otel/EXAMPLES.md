# @godaddy/gasket-plugin-otel Examples

This document provides working examples for all available actions, middleware functionality, and type definitions from the `@godaddy/gasket-plugin-otel` package.

## Overview

The plugin provides:
- **Actions**: `getTraceId` and `setTraceIdCookie` available via `gasket.actions`
- **Middleware**: Automatically sets up trace information in `res.locals`
- **Type Definitions**: TypeScript types for trace data structures

## Prerequisites

To use the actions, you need access to the Gasket instance. This is typically available in:
- Plugin hooks via the `gasket` parameter
- Custom middleware where you pass the gasket instance
- Route handlers where gasket is made available

## Actions

### getTraceId

Get the current trace ID from the OpenTelemetry context for a request.

```js
// In a plugin hook
export default {
  name: 'my-plugin',
  hooks: {
    middleware(gasket) {
      return async function myMiddleware(req, res, next) {
        const traceId = await gasket.actions.getTraceId(req);

        if (traceId) {
          console.log('Current trace ID:', traceId);
          res.setHeader('X-Trace-ID', traceId);
        } else {
          console.log('No trace ID available');
        }

        next();
      };
    }
  }
};
```

```js
// In an Express route (assuming gasket is available)
function createRoutes(gasket) {
  const router = express.Router();

  router.get('/api/debug', async (req, res) => {
    const traceId = await gasket.actions.getTraceId(req);

    res.json({
      traceId: traceId || 'No trace ID available',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
```

### setTraceIdCookie

Set a trace ID cookie on the response with a 2-minute expiration.

```js
// In a plugin hook
export default {
  name: 'tracking-plugin',
  hooks: {
    middleware(gasket) {
      return async function trackingMiddleware(req, res, next) {
        // Set the trace ID cookie for client-side tracking
        const traceId = await gasket.actions.setTraceIdCookie(req, res);

        if (traceId) {
          console.log('Set trace ID cookie:', traceId);
        }

        next();
      };
    }
  }
};
```

```js
// In an API route (assuming gasket is available)
function createApiRoutes(gasket) {
  const router = express.Router();

  router.post('/api/track', async (req, res) => {
    const traceId = await gasket.actions.setTraceIdCookie(req, res);

    res.json({
      success: true,
      traceId,
      message: 'Tracking cookie set'
    });
  });

  return router;
}
```

## Middleware Integration

The plugin automatically sets up middleware that enhances the response object with trace information.

### Accessing Trace Data from res.locals

```js
// The middleware automatically populates res.locals.trace
function createInfoRoutes() {
  const router = express.Router();

  router.get('/api/trace-info', (req, res) => {
    const { traceId } = res.locals.trace || {};

    res.json({
      traceId: traceId || 'No trace available',
      gasketData: res.locals.gasketData?.trace
    });
  });

  return router;
}
```

### Using res.setTraceIdCookie()

The middleware adds a convenient method to set the trace ID cookie.

```js
// The middleware provides res.setTraceIdCookie() method
function createCookieRoutes() {
  const router = express.Router();

  router.get('/api/set-cookie', (req, res) => {
    // Set the trace ID cookie using the middleware-provided method
    if (res.setTraceIdCookie) {
      res.setTraceIdCookie();
    }

    res.json({
      message: 'Trace ID cookie set',
      traceId: res.locals.trace?.traceId
    });
  });

  return router;
}
```
