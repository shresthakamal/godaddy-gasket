/// <reference types="@gasket/plugin-metadata" />

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getTraceId',
        description: 'Get the trace ID',
        link: 'README.md#getTraceId'
      },
      {
        name: 'getOtelMeter',
        description: 'Get an OpenTelemetry Meter for recording custom metrics',
        link: 'README.md#getOtelMeter'
      }
    ]
  };
}
