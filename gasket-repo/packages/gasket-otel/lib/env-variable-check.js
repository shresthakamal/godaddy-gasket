/* eslint-disable no-process-env */
/**
 * envVariableCheck - Check for required environment variables
 * @type {import('./internal').envVariableCheck}
 */
export function envVariableCheck() {
  const requiredEnvVars = [
    'OTEL_EXPORTER_OTLP_ENDPOINT',
    'OTEL_EXPORTER_OTLP_HEADERS'
  ];

  const missingEnvVariables = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingEnvVariables.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[WARNING] Missing required OTel environment variables: ${missingEnvVariables.join(', ')}.`
    );
  }
}
