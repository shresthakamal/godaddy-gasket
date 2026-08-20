/* eslint-disable no-process-env, */

/**
 * Environment variable map
 * @type {import('./internal').OtelEnvVariableMap}
 */
const envVarMap = {
  serviceName: 'OTEL_SERVICE_NAME',
  exporterOtlpEndpoint: 'OTEL_EXPORTER_OTLP_ENDPOINT',
  exporterOtlpHeaders: 'OTEL_EXPORTER_OTLP_HEADERS',
  serviceVersion: 'OTEL_SERVICE_VERSION',
  nodeEnabledInstrumentations: 'OTEL_NODE_ENABLED_INSTRUMENTATIONS',
  nodeResourceDetectors: 'OTEL_NODE_RESOURCE_DETECTORS',
  debug: 'OTEL_DEBUG'
};

/**
 * setEnvVar - set environment variables
 * @type {import('./internal').setEnvVar}
 */
function setEnvVar(key, value) {
  const envVar = envVarMap[key];
  if (!envVar) return;
  if (Array.isArray(value)) {
    process.env[envVar] = value.join(',');
  } else if (typeof value === 'object') {
    process.env[envVar] = Object.entries(value).map(([k, v]) => `${k}=${v}`).join(',');
  } else if (typeof value === 'string') {
    process.env[envVar] = value;
  }
}

/**
 * registerOptions - set environment variables based on options
 * @type {import('./internal').registerOptions}
 */
export function registerOptions(options) {
  const {
    autoInstrumentationOptions,
    spanProcessors
  } = options;

  for (const key in options) {
    if (key === 'autoInstrumentationOptions' || key === 'spanProcessors') continue;
    setEnvVar(key, options[key]);
  }

  const result = autoInstrumentationOptions ? { ...autoInstrumentationOptions } : {};
  if (spanProcessors) result.spanProcessors = spanProcessors;

  return result;
}
