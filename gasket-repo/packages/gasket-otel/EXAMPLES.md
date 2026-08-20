# @godaddy/gasket-otel Examples

This document provides working examples for the exported functionality in the `@godaddy/gasket-otel` package.

## Package Exports

The package exports two main functionalities:
- **`register()`** function for manual instrumentation setup
- **Auto-instrumentation** via the `/register` entry point

## Automatic Instrumentation (Recommended)

### Direct Auto-Instrumentation

Use this when you want zero-configuration setup with environment variables only.

```json
// package.json
{
  "scripts": {
    "start": "NODE_OPTIONS='--import @godaddy/gasket-otel/register' node server.js"
  }
}
```

```bash
# Environment variables (.env or shell)
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-ess-endpoint:4317
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer your-token"
OTEL_SERVICE_NAME=my-service
OTEL_SERVICE_VERSION=1.0.0
```

## Manual Instrumentation with Setup File

Use this approach when you need custom configuration options or conditional logic.

> **Best Practice**: Always use a separate `setup.js` file to keep instrumentation code separate from your application code.

### Basic Manual Setup

```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

// Basic registration with environment variables
register();
```

```json
// package.json
{
  "scripts": {
    "start": "NODE_OPTIONS='--import ./setup.js' node server.js"
  }
}
```

### Custom Configuration

```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

register({
  serviceName: 'my-custom-service',
  exporterOtlpEndpoint: 'https://my-ess-endpoint:4317',
  exporterOtlpHeaders: 'Authorization=Bearer my-token',
  serviceVersion: '2.1.0',
  nodeEnabledInstrumentations: 'http,express,fs',
  debug: 'true'
});
```

```json
// package.json
{
  "scripts": {
    "start": "NODE_OPTIONS='--import ./setup.js' node server.js"
  }
}
```

### Headers as Object

```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

register({
  serviceName: 'my-service',
  exporterOtlpEndpoint: 'https://my-ess-endpoint:4317',
  exporterOtlpHeaders: {
    'Authorization': 'Bearer my-token',
    'X-Custom-Header': 'my-value'
  },
  serviceVersion: '3.0.0'
});
```

### Advanced Configuration

```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

register({
  serviceName: 'my-advanced-service',
  exporterOtlpEndpoint: 'https://my-ess-endpoint:4317',
  exporterOtlpHeaders: 'Authorization=Bearer my-token',
  serviceVersion: '3.0.0',
  nodeEnabledInstrumentations: ['http', 'express', 'redis'],
  autoInstrumentationOptions: {
    '@opentelemetry/instrumentation-express': {
      ignoreLayersType: ['middleware']
    },
    '@opentelemetry/instrumentation-http': {
      requestHook: (span, request) => {
        span.setAttributes({
          'custom.request.id': request.headers['x-request-id']
        });
      }
    },
    '@opentelemetry/instrumentation-fs': {
      enabled: false
    }
  }
});
```

### Custom Span Processors

Use the `spanProcessors` option to inject custom processing logic (e.g., filtering, sampling, or transforming spans) before export. When provided, this replaces the default `OTLPTraceExporter` — you supply the full processor chain including the exporter.

```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

// Example: filter out noisy framework-internal spans
class SpanFilterProcessor {
  constructor(delegate, dropNames) {
    this.delegate = delegate;
    this.dropNames = dropNames;
  }
  onStart(span, ctx) { this.delegate.onStart(span, ctx); }
  onEnd(span) {
    if (this.dropNames.has(span.name)) return;
    this.delegate.onEnd(span);
  }
  shutdown() { return this.delegate.shutdown(); }
  forceFlush() { return this.delegate.forceFlush(); }
}

const exporter = new OTLPTraceExporter();
const batchProcessor = new BatchSpanProcessor(exporter);
const filterProcessor = new SpanFilterProcessor(
  batchProcessor,
  new Set(['resolve page components', 'start response'])
);

register({
  serviceName: 'my-service',
  spanProcessors: [filterProcessor]
});
```

### Conditional Setup

```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

// Only enable telemetry in production
if (process.env.NODE_ENV === 'production') {
  register({
    serviceName: process.env.npm_package_name,
    serviceVersion: process.env.npm_package_version
  });
  console.log('Production telemetry enabled');
} else {
  console.log('Telemetry disabled in development');
}
```

## Framework Integration Examples

**Setup file:**
```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

register({
  serviceName: 'my-express-app',
  exporterOtlpEndpoint: 'https://my-ess-endpoint:4317',
  exporterOtlpHeaders: 'Authorization=Bearer my-token',
  autoInstrumentationOptions: {
    '@opentelemetry/instrumentation-express': {
      ignoreLayersType: ['middleware']
    }
  }
});
```

### NextJS App

NextJS supports OpenTelemetry instrumentation through the standard `instrumentation.js` file (works with both Pages Router and App Router).

#### Using Vercel's OTel

```javascript
// instrumentation.js
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({ serviceName: process.env.OTEL_SERVICE_NAME || 'gasket-app' });
}
```

```javascript
// next.config.js
import gasket from './gasket.js';

export default gasket.actions.getNextConfig({
  experimental: {
    instrumentationHook: true
  }
});
```

```bash
# Environment variables
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-ess-endpoint:4317
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer your-token"
OTEL_SERVICE_NAME=my-nextjs-app
NEXT_OTEL_VERBOSE=1 # Need to expand the traces captured
```

### Gasket App

**Setup file:**
```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

register({
  serviceName: process.env.npm_package_name,
  serviceVersion: process.env.npm_package_version,
  exporterOtlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  exporterOtlpHeaders: process.env.OTEL_EXPORTER_OTLP_HEADERS
});
```

**Package.json:**
```json
{
  "scripts": {
    "start": "NODE_OPTIONS='--import ./setup.js' node server.js"
  }
}
```

## Configuration Options

### OtelRegisterOptions Interface

```typescript
interface OtelRegisterOptions {
  // Service identification
  serviceName?: string;
  serviceVersion?: string;

  // OTLP Exporter configuration
  exporterOtlpEndpoint?: string;
  exporterOtlpHeaders?: string | OutgoingHttpHeaders;

  // Instrumentation control
  nodeEnabledInstrumentations?: string | string[];
  nodeResourceDetectors?: string | string[];
  autoInstrumentationOptions?: InstrumentationConfigMap;

  // Custom span processors — replaces default OTLPTraceExporter when provided
  spanProcessors?: SpanProcessor[];

  // Debug mode
  debug?: string;
}
```

### Environment Variables

All options can be set via environment variables:

```bash
# Service identification
OTEL_SERVICE_NAME=my-service
OTEL_SERVICE_VERSION=1.0.0

# Required for exporting telemetry
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-ess-endpoint:4317
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer your-token"

# Optional instrumentation control
OTEL_NODE_ENABLED_INSTRUMENTATIONS=http,express,fs
OTEL_NODE_RESOURCE_DETECTORS=env,host,process

# Debug mode
OTEL_DEBUG=true
```

### Conditional Registration

```javascript
// setup.js
import { register } from '@godaddy/gasket-otel';

// Only enable telemetry in production
if (process.env.NODE_ENV === 'production') {
  register({
    serviceName: process.env.npm_package_name,
    serviceVersion: process.env.npm_package_version
  });
  console.log('Production telemetry enabled');
} else {
  console.log('Telemetry disabled in development');
}
```
