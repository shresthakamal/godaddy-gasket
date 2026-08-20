/**
 * Handles the `switchboardPerRequestParams` lifecycle event to inject the
 * app name as a targeting rule, enabling per-app experiment eligibility
 * without requiring app teams to coordinate.
 * @type {import('@gasket/core').HookHandler<'switchboardPerRequestParams'>}
 */
export default function switchboardPerRequestParams(gasket, params) {
  if (!gasket.config.uxp?.features?.['header-experiment-beta']) return params;

  const app = gasket.config.presentationCentral?.params?.app;
  if (!app) return params;
  // app is the base default; caller-provided params.app takes precedence
  return { app, ...params };
}
