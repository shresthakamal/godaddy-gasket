# `@godaddy/gasket-plugin-cde`

A Gasket plugin for integrating business and operational metrics with the Continuous Deployment & Experimentation (CDE) platform. This plugin automatically captures contextual user information (visitor, shopper, etc.) and sends events to the Event Bus, enabling advanced deployment tracking and analytics.

**What is CDE?**  
The Continuous Deployment & Experimentation (CDE) platform tracks deployments and links them to corporate, business, and operational metrics. This empowers teams to monitor, analyze, and experiment with deployments for continuous improvement and operational excellence.

> **Note:**  
> All deployments are tracked against corporate metrics by default. Use this plugin only if your app/service needs to track deployments against **business and operational metrics** (e.g., by user, shopper, or visitor). If you don't need this level of detail, you can skip this plugin.

For more details, see the [CDE Platform Overview (Atlassian Wiki)](https://godaddy-corp.atlassian.net/wiki/spaces/CTOPLAT/pages/3687063914/Overview).

## Next.js Compatibility

- If your Next.js app uses a custom Express or Fastify server, you can use this plugin and its lifecycles as described below.
- If your Next.js app uses the App Router or Page Router (without a custom server), you should use the [CDE Next.js Middleware from the CDE SDKs](https://github.com/gdcorp-dna/cde-node-sdk/tree/main/packages/nextjs-middleware) instead.

## Installation

#### New apps

```sh
gasket create <app-name> --plugins @godaddy/gasket-plugin-cde
```

#### Existing apps

```sh
npm i @godaddy/gasket-plugin-cde
```

Update your `gasket` file plugin configuration:

```js
// gasket.js
import pluginCde from '@godaddy/gasket-plugin-cde';

export default makeGasket({
  plugins: [
    pluginCde
  ]
});
```

## Configuration

The configuration object for this plugin should be placed under a `cde` property in `gasket.config.js`. It has the following properties:

| Option      | Description                                 | Type     | Required/Default |
|-------------|---------------------------------------------|----------|-----------------|
| `enable`    | Enable or disable CDE integration           | boolean  | Optional, default: `true` |
| `options`   | Options passed to the CDE middleware        | object   | **Required**     |

## Required Configuration and Environment Variables

To ensure proper tracking and reporting in the CDE platform, you must provide the following configuration options or environment variables:

- **Environment Routing:**
  - You must set either the `NODE_ENV` or `GD_ENV` environment variable to properly route your events to the correct environment (dev, test, or prod). **By default, if neither is set, all events are routed to dev.**
    - Accepted values for `NODE_ENV`: `development`, `test`, or `production`.
    - Accepted values for `GD_ENV`: `dev-private`, `dev`, `test`, `stage`, `ote`, or `prod`.
  - Set these variables in your environment configuration to ensure events are sent to the intended environment.

- **CDE App ID:**
  - Set either the `cde.options.cdeAppId` option in your `gasket.config.js` or the `CDE_APP_ID` environment variable. This uniquely identifies your application or service in the CDE platform.
- **Application Version Tracking:**
  - You must provide **either**:
    - The `cde.options.commitHash` option or the `COMMIT_HASH` environment variable (recommended for most deployments), **or**
    - The `cde.options.cdeAppVersion` option or the `CDE_APP_VERSION` environment variable (if you prefer to track by version string).
  - This enables the CDE platform to associate events with the correct version of your application.
- **Katana Deployments:**
  - The `CDE_APP_ID` environment will soon be configurable for Katana apps via the Katana UI.
  - The commit hash and version do not need to be provided as CDE will pull from Katana's `KATANA_ARTIFACT_VERSION` environment variable.

> **Note:**
> If both a configuration option and an environment variable are provided for the same field, the configuration option in `gasket.config.js` takes precedence.

For a full list of parameters which can be overridden via environment variables, see the [cde-node-sdk environment variables documentation](https://github.com/gdcorp-dna/cde-node-sdk/tree/main/packages/node-sdk#environment-variables).

### Options fields

The `options` object supports the following fields:

| Field                  | Description                                                                 | Type     | Possible Values | Required/Default |
|------------------------|-----------------------------------------------------------------------------|----------|----------------|-----------------|
| `sidecarUrl`           | Sidecar URL for event bus                                                   | string   |                | Optional        |
| `loggingEnabled`       | Enable or disable logging                                                   | boolean  |                | Optional, default: `true` |
| `dxEnabled`            | Use DX Eventbus URL                                                         | boolean  |                | Optional, default: `true` |
| `maxRetries`           | Maximum number of retries                                                   | number   |                | Optional, default: `3`    |
| `retryDelayMs`         | Delay between retries in milliseconds                                       | number   |                | Optional, default: `250`  |
| `samplingMethod`       | Sampling method for events                                                  | string   | `None`, `Simple`, `HashBasedSticky` | Optional, default: `'Simple'` |
| `samplingRate`         | Sampling rate as a proportion (0-1)                                        | number   |                | Optional, default: `0.1`  |
| `cdeAppId`             | CDE App ID                                                                  | string   |                | Optional        |
| `commitHash`           | Commit hash                                                                 | string   |                | Optional        |
| `cdeAppVersion`        | CDE App Version                                                             | string   |                | Optional        |
| `katanaArtifactVersion`| Katana Artifact Version                                                     | string   |                | Optional        |
| `bucketingIdType`      | Type of bucketing ID used for events                                        | string   | `shopperId`, `visitorId`, `customerId`, `careConversationId`, `careUcidJomaxId` | Optional, default: `'visitorId'` |
| `additionalExcludedPaths` | Array of regex patterns for paths to exclude from sending CDE events      | string[] |                | Optional        |
| `includedPaths`        | Array of regex patterns for paths to include for sending CDE events         | string[] |                | Optional        |

> **Note:**  
> All configuration options in the `options` object can also be overridden on a per-request basis using the `appEvaluationEvent` lifecycle hook. This allows you to dynamically adjust CDE behavior or event parameters for individual requests.

### Example configuration

```js
// gasket.config.js
export default {
  cde: {
    enable: true,
    options: {
      dxEnabled: false,
      bucketingIdType: 'shopperId',
      samplingRate: .5
      // ...other CDE middleware options
    }
  }
};
```

## Usage

By default, the plugin will automatically post app evaluation events to CDE for a sampled subset of requests in Express and Fastify apps. The sampling rate defaults to 10% (`samplingRate: 0.1`), but can be configured as needed. **Only use this plugin if your app/service needs to track deployments against business and operational metrics.**

### Manual event posting

You can manually trigger an app evaluation event using the `sendAppEvaluationEvent` action:

```js
import { sendAppEvaluationEvent } from '@godaddy/gasket-plugin-cde';

await sendAppEvaluationEvent(gasket, req);
```

## Lifecycle Hooks

### appEvaluationEvent

A waterfall lifecycle hook that allows you to override or add CDE parameters per request / evaluation.

#### Example:

```js
export default {
  hooks: {
    appEvaluationEvent: {
      handler: async (gasket, eventDetails) => {
        // Override params w/ custom values for the request / evaluation
        return {
          ...eventDetails,
          visitorId: 'override-visitor',
          careConversationId: 'custom-care-id'
        };
      }
    }
  }
};
```

#### Parameters available for override:
- Any field from the `options` object in your configuration (e.g., `bucketingIdType`, `samplingRate`, etc.)
- `visitorId`
- `sessionId`
- `customerId`
- `shopperId`
- `careConversationId`
- `careUcidJomaxId`

## Express & Fastify Integration

- **Express:** The plugin adds middleware to automatically post events for each request.
- **Fastify:** The plugin registers a preHandler hook to do the same.

> **Note for Next.js Users:**
> - If your Next.js app uses a custom Express or Fastify server, you can use this plugin as described.
> - If your Next.js app uses the App Router or Page Router (without a custom server), use the [CDE Next.js Middleware](https://github.com/gdcorp-dna/cde-node-sdk/tree/main/packages/nextjs-middleware) from the CDE SDKs instead.

**Fastify Example:**
```js
export const defaultHandler = async (req, res) => {
  if (res.statusCode === 200) {
    res.send({ message: 'Welcome to your default route...' });
  }
};

export default {
  name: 'routes-plugin',
  hooks: {
    fastify: {
      handler: (gasket, app) => {
        app.get('/default', defaultHandler);
      }
    }
  }
};
```

**Express Example:**
```js
export default {
  name: 'routes-plugin',
  hooks: {
    express: {
      handler: (gasket, app) => {
        app.get('/default', (req, res) => {
          res.send('Hello from Express!');
        });
      }
    }
  }
};
```

## Performance & Best Practices

To ensure the CDE middleware is performant and does not impact your application's responsiveness, follow these guidelines:

### 1. Use Action/Middlewares Asynchronously

The CDE plugin is designed to send events asynchronously, so requests are not blocked by network calls to the Event Bus. If you add custom logic or manual event posting, always ensure these operations are performed asynchronously and do not block the main request/response cycle.

**Example:**
```js
// Good: Await outside the request/response cycle, or fire-and-forget
sendAppEvaluationEvent(gasket, req).catch(err => {
  // Optionally log errors, but do not block the response
});
```

### 2. Monitor Service Health & Resource Usage

After enabling the CDE plugin, especially in production, monitor your service's:
- Response times and throughput
- Memory and CPU usage
- Error rates

This helps ensure that event reporting does not introduce bottlenecks or resource issues. Adjust configuration as needed based on observed metrics.

### 3. Set the Event Bus Sidecar URL

If your deployment uses an Event Bus sidecar (recommended for production), set the `sidecarUrl` option in your configuration. This offloads event delivery to a local sidecar container, reducing latency and batching events more efficiently.

**Example:**
```js
// gasket.config.js
export default {
  cde: {
    enable: true,
    options: {
      sidecarUrl: 'http://localhost:8080', // Local Event Bus sidecar URL
      bucketingIdType: 'shopperId',
      // ...other CDE middleware options
    }
  }
};
```