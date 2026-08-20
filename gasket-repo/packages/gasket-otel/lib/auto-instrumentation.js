import 'dotenv/config';
import { envVariableCheck } from './env-variable-check.js';
import { handleDebug } from './handle-debug.js';
import { createSdk } from './create-sdk.js';

/**
 * register - Automatic registration of OpenTelemetry instrumentation
 * Used directly in npm script
 * "start": "node --import '@godaddy/gasket-otel/register' server.js"
 */
envVariableCheck();
handleDebug();
createSdk();
