import preset from '../lib/index.js';

const JEST_PLUGIN = '@gasket/plugin-jest';

describe('presetConfig', function () {
  let mockContext, presetConfig;

  beforeEach(function () {
    mockContext = {};
    ({ presetConfig } = preset.hooks);
  });

  it('returns expected plugins in order', async function () {
    const config = await presetConfig({}, mockContext);
    const expected = [
      expect.objectContaining({ name: '@gasket/plugin-analyze' }),
      expect.objectContaining({ name: '@gasket/plugin-command' }),
      expect.objectContaining({ name: '@gasket/plugin-dynamic-plugins' }),
      expect.objectContaining({ name: '@gasket/plugin-git' }),
      expect.objectContaining({ name: '@gasket/plugin-logger' }),
      expect.objectContaining({ name: '@gasket/plugin-metadata' }),
      expect.objectContaining({ name: '@gasket/plugin-data' }),
      expect.objectContaining({ name: '@gasket/plugin-docs' }),
      expect.objectContaining({ name: '@gasket/plugin-docusaurus' }),
      expect.objectContaining({ name: '@gasket/plugin-intl' }),
      expect.objectContaining({ name: '@gasket/plugin-lint' }),
      expect.objectContaining({ name: '@gasket/plugin-nextjs' }),
      expect.objectContaining({ name: '@gasket/plugin-webpack' }),
      expect.objectContaining({ name: '@gasket/plugin-winston' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-auth' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-security' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-traffic' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-uxp' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-visitor' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-dev-certs' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-otel' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-self-certs' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-atlas' })
    ];

    expect(config.plugins).toEqual(expected);
  });

  it('adds multiple test plugins when provided', async function () {
    mockContext.testPlugins = [JEST_PLUGIN, '@gasket/plugin-mocha'];
    const config = await presetConfig({}, mockContext);

    expect(config.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: JEST_PLUGIN }),
        expect.objectContaining({ name: '@gasket/plugin-mocha' })
      ])
    );
  });

  it('adds test plugin when provided', async function () {
    mockContext.testPlugins = [JEST_PLUGIN];
    const config = await presetConfig({}, mockContext);

    expect(config.plugins).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: JEST_PLUGIN })])
    );
  });

  it('does not add typescript plugin when not enabled', async function () {
    const config = await presetConfig({}, mockContext);
    const hasTypescript = config.plugins.some(function (p) {
      return p.name === '@gasket/plugin-typescript';
    });

    expect(hasTypescript).toBe(false);
  });

  it('adds typescript plugin when enabled', async function () {
    mockContext.typescript = true;
    const config = await presetConfig({}, mockContext);

    expect(config.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '@gasket/plugin-typescript' })
      ])
    );
  });

  describe('adds server framework plugin for custom server', function () {
    it('express', async function () {
      mockContext.nextServerType = 'customServer';
      const config = await presetConfig({}, mockContext);

      expect(config.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: '@gasket/plugin-express' })
        ])
      );
    });
  });

  describe('adds http plugin for custom server', function () {
    it('express', async function () {
      mockContext.nextServerType = 'customServer';
      const config = await presetConfig({}, mockContext);

      expect(config.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: '@gasket/plugin-https' })
        ])
      );

      // should NOT have https proxy plugin
      expect(config.plugins).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: '@gasket/plugin-https-proxy' })
        ])
      );
    });
  });

  describe('adds https-proxy plugin', function () {
    it('when nextDevProxy is true', async function () {
      mockContext.nextDevProxy = true;
      const config = await presetConfig({}, mockContext);

      expect(config.plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: '@gasket/plugin-https-proxy' })
        ])
      );

      // should NOT have https plugin
      expect(config.plugins).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: '@gasket/plugin-https' })
        ])
      );
    });
  });
});
