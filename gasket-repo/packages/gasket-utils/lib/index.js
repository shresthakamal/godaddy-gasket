/**
 * Get the Gasket env from Katana's GD_ENV and GD_REGION.
 * @type {import('./index').gdEnv}
 */
export function gdEnv() {
  const { GD_ENV, GD_REGION } = process.env; // eslint-disable-line no-process-env

  if (!GD_ENV) return void 0;

  return [
    GD_ENV.replace('-private', ''),
    GD_REGION
  ].filter(Boolean).join('.');
}
