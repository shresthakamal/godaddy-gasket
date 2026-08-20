/**
 * Get the Gasket env from Katana's GD_ENV and GD_REGION.
 * The `dev-private` env will be normalized to `dev`.
 * Regions are appended as sub-environments such as `dev.us-west-2`.
 */
export function gdEnv(): string | undefined;
