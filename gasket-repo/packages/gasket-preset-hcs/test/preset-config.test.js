import preset from '../lib/index.js';

describe('presetConfig', function () {
  let mockContext, presetConfig, mockGasket;

  beforeEach(function () {
    mockGasket = { config: {} };
    mockContext = {};
    presetConfig = preset.hooks.presetConfig;
  });

  it('returns expected plugins in order', async function () {
    const config = await presetConfig(mockGasket, mockContext);
    const expected = [
      expect.objectContaining({ name: '@gasket/plugin-command' }),
      expect.objectContaining({ name: '@gasket/plugin-dynamic-plugins' }),
      expect.objectContaining({ name: '@gasket/plugin-git' }),
      expect.objectContaining({ name: '@gasket/plugin-logger' }),
      expect.objectContaining({ name: '@gasket/plugin-metadata' }),
      expect.objectContaining({ name: '@gasket/plugin-intl' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-hcs' }),
      expect.objectContaining({ name: '@gasket/plugin-express' }),
      expect.objectContaining({ name: '@gasket/plugin-https' }),
      expect.objectContaining({ name: '@gasket/plugin-docs' }),
      expect.objectContaining({ name: '@gasket/plugin-docusaurus' }),
      expect.objectContaining({ name: '@gasket/plugin-data' }),
      expect.objectContaining({ name: '@gasket/plugin-winston' }),
      expect.objectContaining({ name: '@gasket/plugin-swagger' }),
      expect.objectContaining({ name: '@gasket/plugin-lint' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-security' }),
      expect.objectContaining({ name: '@godaddy/gasket-plugin-visitor' }),
      expect.objectContaining({ name: '@gasket/plugin-webpack' })
    ];

    expect(config.plugins).toEqual(expected);
  });

  it('adds test plugins when provided', async function () {
    mockContext.testPlugins = ['@gasket/plugin-jest', '@gasket/plugin-mocha'];
    const config = await presetConfig(mockGasket, mockContext);

    expect(config.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '@gasket/plugin-jest' }),
        expect.objectContaining({ name: '@gasket/plugin-mocha' })
      ])
    );
  });

  it('adds typescript plugin when enabled', async function () {
    mockContext.typescript = true;
    const config = await presetConfig(mockGasket, mockContext);

    expect(config.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '@gasket/plugin-typescript' })
      ])
    );
  });

  it('does not add typescript plugin when not enabled', async function () {
    const config = await presetConfig(mockGasket, mockContext);
    const hasTypescript = config.plugins.some(function (p) {
      return p.name === '@gasket/plugin-typescript';
    });

    expect(hasTypescript).toBe(false);
  });
});
