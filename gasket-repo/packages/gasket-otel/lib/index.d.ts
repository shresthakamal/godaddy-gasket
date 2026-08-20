import type { OutgoingHttpHeaders } from 'http';
import type { InstrumentationConfigMap } from '@opentelemetry/api';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';

export interface OtelRegisterOptions {
  /* service name */
  serviceName?: string;

  /* otlp exporter endpoint */
  exporterOtlpEndpoint?: string;

  /* otlp exporter headers */
  exporterOtlpHeaders?: string | OutgoingHttpHeaders;

  /* service version */
  serviceVersion?: string;

  /* enabled instrumentations */
  nodeEnabledInstrumentations?: string | string[];

  /* resource detectors */
  nodeResourceDetectors?: string | string[];

  /* auto instrumentation options */
  autoInstrumentationOptions?: InstrumentationConfigMap

  /* custom span processors — when provided, replaces the default OTLPTraceExporter */
  spanProcessors?: SpanProcessor[];

  /* debug mode */
  debug?: string;
}

export function register(options: OtelRegisterOptions): void;
