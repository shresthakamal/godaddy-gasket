# @godaddy/gasket-otel

Opentelemetry configuration and instrumentation for Gasket. This package offers automatic instrumentation for common Node.js libraries and frameworks, as well as a simple API for manual instrumentation with additional options.

## Installation

```bash
npm install @godaddy/gasket-otel
```

Configure OTel environment variables in your `.env` file:

```shell
# Required
OTEL_EXPORTER_OTLP_ENDPOINT=<your-ess-otel-endpoint>
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <ess-secret>"

# Optional
OTEL_SERVICE_NAME=<service-name> # Defaults to process.env.npm_package_name
OTEL_SERVICE_ENVIRONMENT=<service-environment> # Defaults to process.env.GASKET_ENV or process.env.NODE_ENV
OTEL_SERVICE_VERSION=<service-version> # Defaults to process.env.npm_package_version
OTEL_NODE_ENABLED_INSTRUMENTATIONS=<instrumentations>
OTEL_NODE_RESOURCE_DETECTORS=<resource-detectors>
```

Your AWS Secrets Manager account has values that can be passed directly into the `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` variables directly under the `elastic_otel_credentials` key.

```shell
CREDS=$(aws secretsmanager get-secret-value --secret-id elastic_otel_credentials --query SecretString --output text)
OTEL_EXPORTER_OTLP_ENDPOINT=$(echo $CREDS | jq -r '.ingestion_url')
OTEL_EXPORTER_OTLP_HEADERS=$(echo $CREDS | jq -r '.auth_header')
```

## Automatic Instrumentation

```diff
// package.json
{
  "scripts": {
-    "start": "node server.js"
+    "start": "NODE_OPTIONS='--import @godaddy/gasket-otel/register' node server.js"
  }
}
```

## Manual Instrumentation

```javascript
// <app-root>/setup.js
import { register } from '@godaddy/gasket-otel';

// Options passed will override the .env configuration
register({
  serviceName: 'my-service',
  exporterOtlpEndpoint: 'https://my-ess-endpoint:4317',
  serviceVersion: '1.0.0',
  nodeEnabledInstrumentations: 'http,express'
  // Additional instrumentation options
  autoInstrumentationOptions: {
    // Turn off tracing for express middleware
    '@opentelemetry/instrumentation-express': { ignoreLayersType: ['middleware'] }
  }
});
```

Update the `start` script in your `package.json` to include the setup file:

```diff
// package.json
{
  "scripts": {
-    "start": "node server.js"
+    "start": "NODE_OPTIONS='--import ./setup.js' node server.js"
  }
}
```

## NextJS

For NextJS apps, you'll need to install the `@vercel/otel` package:

```bash
npm install @vercel/otel
```

Update the `next.config.js` file to include the [NextJS OTel] configuration:

```javascript
// next.config.js
import gasket from './gasket.js';

export default gasket.actions.getNextConfig({
  // Add the experimental instrumentationHook option
  experimental: {
    instrumentationHook: true
  }
});
```

Create a `instrumentation.js` file to register the `@vercel/otel` SDK:

```javascript
// instrumentation.js
import { registerOTel } from '@vercel/otel';

registerOTel({ serviceName: process.env.OTEL_SERVICE_NAME || 'gasket-app' });
```

Update the `start` script in your `package.json` to include the `NEXT_OTEL_VERBOSE` [environment variable](https://nextjs.org/docs/14/app/building-your-application/optimizing/open-telemetry#testing-your-instrumentation):

```diff
// package.json
{
  "scripts": {
-    "start": "NODE_OPTIONS='--import @godaddy/gasket-otel/register' node server.js"
+    "start": "NODE_OPTIONS='--import @godaddy/gasket-otel/register' NEXT_OTEL_VERBOSE=1 node server.js"
  }
}
```

## Metrics

Metrics are exported automatically via `OTLPMetricExporter` over gRPC using the same `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` environment variables configured above. No additional packages or configuration are required.

## Documentation

- [Automatic Instrumentation Configuration](https://opentelemetry.io/docs/languages/js/automatic/configuration/)
- [SDK Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/)
- [OTLP Exporter Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/)
- [Express Manual Instrumentation](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
- [Http Manual Instrumentation](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
- [Fastify Manual Instrumentation](https://www.npmjs.com/package/@opentelemetry/instrumentation-fastify)

<!-- Links -->
[NextJS OTel]: https://nextjs.org/docs/14/app/building-your-application/optimizing/open-telemetry
