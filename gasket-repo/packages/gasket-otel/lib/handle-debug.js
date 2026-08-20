/* eslint-disable no-process-env */
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';

/**
 * handleDebug - handle debug logging
 * @type {import('./internal').handleDebug}
 */
export function handleDebug() {
  if (process.env.OTEL_DEBUG) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }
}
