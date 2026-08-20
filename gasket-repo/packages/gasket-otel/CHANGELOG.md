# `@godaddy/gasket-otel`

## 3.6.0

### Minor Changes

- c74c030: Add `spanProcessors` option to `register()`. When provided, the custom SpanProcessor chain replaces the default OTLPTraceExporter, enabling consumers to inject filtering or transformation logic (e.g., dropping noisy framework-internal spans) without replacing the gasket-otel pipeline. When omitted, behavior is unchanged.

## 3.5.5

### Patch Changes

- ba171a3: Default OTLP metrics to delta aggregation temporality. Elastic's OTLP ingestion silently drops Histogram data points sent with cumulative temporality (the OpenTelemetry SDK default), so histogram metrics previously never reached Elasticsearch. Delta is safe for the other instrument kinds (Sums are re-accumulated by the backend; Gauges carry no temporality). Setting `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` still overrides this default, so non-Elastic backends can opt back into cumulative.
- 0040b2b: Fall back to `GD_ENV` for `deployment.environment` in the OTel resource. Katana injects `GD_ENV` (the deployment environment) on every app, but `GASKET_ENV`/`NODE_ENV` are typically unset there — so deployed apps were being attributed to `production` in every environment. `GD_ENV` is now consulted after `OTEL_SERVICE_ENVIRONMENT` and `GASKET_ENV` (so an explicit `GASKET_ENV` still overrides it), and before `NODE_ENV`/`'production'`.

## 3.5.4

### Patch Changes

- 9a13185: Upgrade OTEL dependencies to get rid of a security vulnerability

## 3.5.3

### Patch Changes

- 34bf7db: Enable OTLP metrics export by configuring a `PeriodicExportingMetricReader` with `OTLPMetricExporter` in the OpenTelemetry SDK.

## 3.5.2

### Patch Changes

- e89ee8c: Make sure we have the telemetry.sdk.\* fields in the trace

## 3.5.1

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 3.5.0

### Minor Changes

- 653fc6a: Do not send traces for healthchecks

## 3.4.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.3.12

### Patch Changes

- fc8c8f5: Update OTel dependencies, add service environment env var, adjust docs to reference metrics lib

## 3.3.11

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.3.10

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.3.9

### Patch Changes

- 35ce873: Add examples

## 3.3.8

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.3.7

### Patch Changes

- fe92d45: Eslint9 upgrade

## 3.3.6

### Patch Changes

- 93541bd: Use standardized CJS output

## 3.3.5

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 3.3.4

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 3.3.3

### Patch Changes

- 25f18e6: Add CJS transpile to ESM-only packages
- f4686c8: Fix issues with NextJS and OTel

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.1.0

- Aligned version releases across all packages

## 3.0.2

- Warn for missing env vars with fallbacks ([#1614])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Initial release

[Upgrade Guide]: /docs/upgrade-to-7.md
[#1614]: https://github.com/gdcorp-uxp/gasket/pull/1614
