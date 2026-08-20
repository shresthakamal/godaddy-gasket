/* eslint-disable no-console, no-process-env */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import * as resources from '@opentelemetry/resources';
import { PeriodicExportingMetricReader, AggregationTemporality } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from '@opentelemetry/semantic-conventions';
import { withHttpDefaults } from './util.js';

/**
 * createSdk - Create an OpenTelemetry SDK instance
 * @type {import('./internal').createSdk}
 */
export function createSdk(options = {}) {
  // Use the env variables or fallback to npm package metadata
  const customResource = resources.resourceFromAttributes({
    [ATTR_SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME ||
      process.env.npm_package_name,
    [ATTR_SERVICE_VERSION]:
      process.env.OTEL_SERVICE_VERSION ||
      process.env.npm_package_version ||
      '0.0.0',
    'deployment.environment':
      process.env.OTEL_SERVICE_ENVIRONMENT ||
      process.env.GASKET_ENV ||
      // Katana injects GD_ENV (the deployment environment; the source @godaddy/gasket-utils'
      // gdEnv() reads) on every app, and GASKET_ENV/NODE_ENV are typically unset there — so
      // without this the resource falls through to 'production' in every deployed environment.
      // Ordered after GASKET_ENV so an explicit GASKET_ENV still overrides the Katana-provided GD_ENV.
      process.env.GD_ENV ||
      process.env.NODE_ENV ||
      'production'
  });
  const resource = resources.defaultResource().merge(customResource);

  // Default to delta temporality, but respect an explicit
  // OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE so non-Elastic backends can opt out.
  // Elastic's OTLP ingestion silently drops Histogram data points sent with cumulative
  // temporality (the OTel SDK default), so histogram metrics never reach Elasticsearch
  // without this. Delta is safe for the other instrument kinds: Sums are re-accumulated by
  // the backend and Gauges carry no temporality. Passing no preference lets the exporter read
  // the env var itself (cumulative | delta | lowmemory); passing DELTA overrides that default.
  const metricExporter = process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE
    ? new OTLPMetricExporter()
    : new OTLPMetricExporter({ temporalityPreference: AggregationTemporality.DELTA });

  const { spanProcessors, ...instrumentationOptions } = options;

  const traceConfig = spanProcessors?.length
    ? { spanProcessors }
    : { traceExporter: new OTLPTraceExporter() };

  const sdk = new NodeSDK({
    resource,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60_000
    }),
    logRecordProcessor: new SimpleLogRecordProcessor(new OTLPLogExporter()),
    ...traceConfig,
    instrumentations: [getNodeAutoInstrumentations({
      // Future support for both frameworks
      // '@opentelemetry/instrumentation-express': { ignoreLayersType: ['middleware'] },
      // '@opentelemetry/instrumentation-fastify': { ignoreLayersType: ['middleware'] },
      ...withHttpDefaults(instrumentationOptions),
      '@opentelemetry/instrumentation-fs': { enabled: false }
    })]
  });

  sdk.start();

  console.log(`Instrumentation started for '${resource.attributes[ATTR_SERVICE_NAME]}' version '${resource.attributes[ATTR_SERVICE_VERSION]}'`);

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => {
        console.log('Tracing terminated');
      })
      .catch((error) => {
        console.log('Error terminating tracing', error);
      })
      .finally(() => process.exit(0));
  });
}
