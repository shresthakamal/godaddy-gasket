import type { OtelRegisterOptions } from './index.ts';
import type { InstrumentationConfigMap } from '@opentelemetry/api';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';

export interface OtelEnvVariableMap {
  serviceName: 'OTEL_SERVICE_NAME';
  exporterOtlpEndpoint: 'OTEL_EXPORTER_OTLP_ENDPOINT';
  exporterOtlpHeaders: 'OTEL_EXPORTER_OTLP_HEADERS';
  serviceVersion: 'OTEL_SERVICE_VERSION';
  nodeEnabledInstrumentations: 'OTEL_NODE_ENABLED_INSTRUMENTATIONS';
  nodeResourceDetectors: 'OTEL_NODE_RESOURCE_DETECTORS';
  debug: 'OTEL_DEBUG';
}

export function setEnvVar(
  /* key of the OtelRegisterOptions */
  key: keyof OtelRegisterOptions | string,

  /* value of the OtelRegisterOptions */
  value: OtelRegisterOptions[keyof OtelRegisterOptions]
): void;

export function envVariableCheck(): void;

export function handleDebug(): void;

export function registerOptions(options: OtelRegisterOptions): InstrumentationConfigMap & { spanProcessors?: SpanProcessor[] };

export function createSdk(options?: OtelRegisterOptions): void;
