/**
 * With `@godaddy/antares` shipping CSS in the JS build, we need to ensure that
 * Next.js transpiles the package so that the CSS is properly extracted and
 * applied.
 *
 * When `gasket.config.turbopack` is `true` (opt-in via
 * `makeGasket({ turbopack: true })`), the `webpackConfig` hook does not run,
 * so this hook also adds this plugin and `@ux/presentation-central` to
 * Next.js' `serverExternalPackages` — mirroring the externalization applied
 * on the Webpack side. When Turbopack is off, that branch is a no-op — the
 * default Webpack path is byte-identical.
 * @type {import('@gasket/core').HookHandler<'nextConfig'>}
 */
function nextConfigHook(gasket, config) {
  const nextConfig = {
    ...config,
    transpilePackages: [
      ...(config.transpilePackages ?? []),
      '@godaddy/antares'
    ]
  };

  if (!gasket?.config?.turbopack) return nextConfig;

  return {
    ...nextConfig,
    serverExternalPackages: Array.from(new Set([
      ...(nextConfig.serverExternalPackages ?? []),
      '@godaddy/gasket-plugin-uxp',
      '@ux/presentation-central'
    ]))
  };
}

export {
  nextConfigHook as nextConfig
};
