import { describe, it, expect } from 'vitest';
import { nextConfig } from '../lib/next-config.js';

describe('nextConfig', function () {

  it('is a function', function () {
    expect(typeof nextConfig).toBe('function');
  });

  it('adds @godaddy/antares to transpilePackages', function () {
    const config = { };
    const result = nextConfig({ config: {} }, config);
    expect(result.transpilePackages).toEqual(['@godaddy/antares']);
  });

  it('preserves existing transpilePackages', function () {
    const config = { transpilePackages: ['existing-package'] };
    const result = nextConfig({ config: {} }, config);
    expect(result.transpilePackages).toEqual(['existing-package', '@godaddy/antares']);
  });

  it('handles null or undefined transpilePackages', function () {
    const config = { transpilePackages: null };
    const result = nextConfig({ config: {} }, config);
    expect(result.transpilePackages).toEqual(['@godaddy/antares']);
  });

  it('preserves other config properties', function () {
    const config = { reactStrictMode: true, swcMinify: true };
    const result = nextConfig({ config: {} }, config);
    expect(result.reactStrictMode).toBe(true);
    expect(result.swcMinify).toBe(true);
    expect(result.transpilePackages).toEqual(['@godaddy/antares']);
  });

  describe('with Turbopack', function () {

    it('externalizes this plugin and @ux/presentation-central under gasket.config.turbopack', function () {
      const result = nextConfig({ config: { turbopack: true } }, {});
      expect(result.serverExternalPackages).toEqual([
        '@godaddy/gasket-plugin-uxp',
        '@ux/presentation-central'
      ]);
    });

    it('does not add server externals when gasket.config.turbopack is false', function () {
      const result = nextConfig({ config: { turbopack: false } }, {});
      expect(result.serverExternalPackages).toBeUndefined();
    });

    it('does not add server externals when gasket.config.turbopack is unset', function () {
      const result = nextConfig({ config: {} }, {});
      expect(result.serverExternalPackages).toBeUndefined();
    });

    it('preserves existing server externals', function () {
      const result = nextConfig(
        { config: { turbopack: true } },
        { serverExternalPackages: ['existing-package'] }
      );
      expect(result.serverExternalPackages).toEqual([
        'existing-package',
        '@godaddy/gasket-plugin-uxp',
        '@ux/presentation-central'
      ]);
    });

    it('does not duplicate presentation-central', function () {
      const result = nextConfig(
        { config: { turbopack: true } },
        { serverExternalPackages: ['@ux/presentation-central'] }
      );
      expect(result.serverExternalPackages).toEqual([
        '@ux/presentation-central',
        '@godaddy/gasket-plugin-uxp'
      ]);
    });
  });
});
