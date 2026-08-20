import 'dotenv/config';
import { registerOptions } from './register-options.js';
import { envVariableCheck } from './env-variable-check.js';
import { handleDebug } from './handle-debug.js';
import { createSdk } from './create-sdk.js';

/**
 * register - Manual registration of OpenTelemetry instrumentation
 * @type {import('./index').register}
 */
export function register(options = {}) {
  const autoInstrumentationOptions = registerOptions(options);
  envVariableCheck();
  handleDebug();
  createSdk(autoInstrumentationOptions);
}
