/// <reference types="@gasket/plugin-command" />

import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME
} from '@opentelemetry/semantic-conventions';

/**
 * Apply configuration changes prior to local/start events.
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
export default function configure(gasket, config) {
  return {
    ...config,
    traceConfig: getTraceConfig()
  };
}

/**
 * Get the trace configuration
 * @returns {import('@opentelemetry/sdk-trace-base').TracerConfig}
 * traceConfig
 */
function getTraceConfig() {
  return {
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'gasket-traceid-middleware'
    })
  };
}
