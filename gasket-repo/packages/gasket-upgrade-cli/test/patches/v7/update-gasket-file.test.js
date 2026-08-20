const mockRunShellCommand = jest.fn().mockResolvedValue({
  stdout: `{
    '@gasket/plugin-uxp': '1.0.0',
    '@gasket/create-only': '1.0.0',
    '@gasket/plugin-config': '1.0.0',
    '@gasket/plugin-log': '1.0.0'
  }`
});

jest.mock('@gasket/utils', () => ({
  runShellCommand: mockRunShellCommand
}));
jest.mock('../../../lib/utils/create-only-plugins.js', () => ({
  '@gasket/create-only': true
}));
jest.mock('../../../lib/utils/short-name-map.js', () => ({
  '@gasket/cool-stuff': '@gasket/plugin-cool-stuff',
  '@godaddy/webapp': '@godaddy/gasket-preset-webapp'
}));
jest.mock('../../../lib/utils/removed-plugins.js', () => ({
  '@gasket/plugin-docsify': true,
  '@godaddy/gasket-plugin-rigor': true,
  '@godaddy/gasket-plugin-linaria': true,
  '@godaddy/gasket-plugin-hivemind': true
}));
jest.mock('../../../lib/utils/renamed-plugins.js', () => ({
  '@gasket/plugin-config': '@gasket/plugin-data',
  '@gasket/plugin-log': '@gasket/plugin-logger'
}));

const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-gasket-file');
const { gasketVersion } = require('../../../lib/patches/v7/update-dependencies');
const patch = wrapper.wrapped;

describe('v7 patch - update-gasket-file', () => {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.files.set('package.json', {
      type: 'commonjs',
      dependencies: {}
    });
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('adds dependencies for presets', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).toMatch(/@gasket\/plugin-uxp/);
    expect(updated).toContain('import pluginUxp from \'@gasket/plugin-uxp\';');
  });

  it('does not add create-only plugins to gasket file', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).not.toMatch(/@gasket\/create-only/);
  });

  it('captures plugins from add array', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ],
          add: [
            '@gasket/plugin-foo'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).toContain('import pluginFoo from \'@gasket/plugin-foo\';');
  });

  it('captures additional configs', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ],
          add: [
            '@gasket/plugin-foo'
          ]
        },
        helmet: {
          contentSecurityPolicy: false
        },
        presentationCentral: {
          params: {
            app: 'zzz-v6-2',
            header: 'internal-header',
            uxcore: '2400'
          }
        }
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).toContain('contentSecurityPolicy: false');
    expect(updated).toContain('app: \'zzz-v6-2\'');
    expect(updated).toContain('header: \'internal-header\'');
    expect(updated).toContain('uxcore: \'2400\'');
  });

  it('uses .js ext when app type is module', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.files.set('package.json', {
      type: 'module',
      dependencies: {}
    });

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.js');
    expect(updated).not.toBeUndefined();
  });

  it('uses .mjs ext when app type is commonjs', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).not.toBeUndefined();
  });

  it('handles shorthand names', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ],
          add: [
            '@gasket/cool-stuff'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).toMatch(/@gasket\/plugin-cool-stuff/);
    expect(updated).toContain('import pluginCoolStuff from \'@gasket/plugin-cool-stuff\';');
    expect(updated).toMatch(/@gasket\/plugin-uxp/);
    expect(updated).toContain('import pluginUxp from \'@gasket/plugin-uxp\';');
  });

  it('adds the new gasket file to git', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.git.add = jest.fn();

    await patch(mockContext);

    expect(mockContext.git.add).toHaveBeenCalledWith(expect.stringContaining('gasket.mjs'));
  });

  it('removes old gasket file from git', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.git.rm = jest.fn();

    await patch(mockContext);

    expect(mockContext.git.rm).toHaveBeenCalledWith(expect.stringContaining('gasket.config.js'));
  });

  it('deletes the old gasket file from the set', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    expect(mockContext.files.has('gasket.config.js')).toBe(false);
  });

  it('handles renamed packages', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp',
          ],
          add: [
            '@gasket/plugin-config',
            '@gasket/plugin-log'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).not.toContain('@gasket/plugin-config');
    expect(updated).toContain('@gasket/plugin-data');

    expect(updated).not.toContain('@gasket/plugin-log\';');
    expect(updated).toContain('@gasket/plugin-logger');
  });

  it('handles removed packages', async () => {
    const content = `
      module.exports = {
        plugins: {
          presets: [
            '@godaddy/webapp',
          ],
          add: [
            '@gasket/plugin-docsify',
            '@godaddy/gasket-plugin-rigor',
            '@godaddy/gasket-plugin-linaria'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).not.toContain('@gasket/plugin-docsify');
    expect(updated).not.toContain('@godaddy/gasket-plugin-rigor');
    expect(updated).not.toContain('@godaddy/gasket-plugin-linaria');
  });

  it('renames dependencies in package.json', async () => {
    const content = `
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-config',
            '@gasket/plugin-log'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.files.set('package.json', {
      dependencies: {
        '@gasket/plugin-config': '^6.0.0',
        '@gasket/plugin-log': '^6.0.0'
      }
    });

    await patch(mockContext);

    const updated = mockContext.files.get('package.json');
    expect(updated.dependencies).not.toContain(expect.objectContaining({
      '@gasket/plugin-config': '^6.0.0',
      '@gasket/plugin-log': '^6.0.0'
    }));
    expect(updated.dependencies).toEqual({
      '@gasket/core': gasketVersion,
      '@gasket/data': gasketVersion,
      '@gasket/plugin-data': gasketVersion,
      '@gasket/plugin-logger': gasketVersion
    });
  });

  it('removes dependencies from package.json', async () => {
    const content = `
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-docsify',
            '@godaddy/gasket-plugin-rigor',
            '@godaddy/gasket-plugin-linaria',
            '@godaddy/gasket-plugin-hivemind'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.files.set('package.json', {
      dependencies: {
        '@gasket/plugin-docsify': '^6.0.0',
        '@godaddy/gasket-plugin-rigor': '^6.0.0',
        '@godaddy/gasket-plugin-linaria': '^6.0.0',
        '@godaddy/gasket-plugin-hivemind': '^6.0.0'
      }
    });

    await patch(mockContext);

    const updated = mockContext.files.get('package.json');
    expect(updated.dependencies).not.toContain(expect.objectContaining({
      '@gasket/plugin-docsify': '^6.0.0',
      '@godaddy/gasket-plugin-rigor': '^6.0.0',
      '@godaddy/gasket-plugin-linaria': '^6.0.0',
      '@godaddy/gasket-plugin-hivemind': '^6.0.0'
    }));
  });

  it('adds @gasket/core to package.json', async () => {
    const content = `
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-foo'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);

    await patch(mockContext);

    const updated = mockContext.files.get('package.json');
    expect(updated.dependencies).toEqual({
      '@gasket/core': gasketVersion
    });
  });

  it('adds @gasket/data to package.json when @gasket/plugin-data is present', async () => {
    const content = `
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-data'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.files.set('package.json', {
      dependencies: {
        '@gasket/plugin-data': gasketVersion
      }
    });

    await patch(mockContext);

    const updated = mockContext.files.get('package.json');
    expect(updated.dependencies).toEqual({
      '@gasket/core': gasketVersion,
      '@gasket/data': gasketVersion,
      '@gasket/plugin-data': gasketVersion
    });
  });

  it('adds intl packages to package.json when @gasket/plugin-intl is present', async () => {
    const content = `
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-intl'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.files.set('package.json', {
      dependencies: {
        '@gasket/plugin-intl': gasketVersion
      }
    });

    await patch(mockContext);

    const updated = mockContext.files.get('package.json');
    expect(updated.dependencies).toEqual({
      '@gasket/core': gasketVersion,
      '@gasket/intl': gasketVersion,
      '@gasket/react-intl': gasketVersion,
      '@gasket/plugin-intl': gasketVersion
    });
  });

  it('removes @gasket/log and @gasket/cli from package.json', async () => {
    const content = `
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-foo'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    mockContext.files.set('package.json', {
      dependencies: {
        '@gasket/log': '^6.0.0',
        '@gasket/cli': '^6.0.0'
      }
    });

    await patch(mockContext);

    const updated = mockContext.files.get('package.json');
    expect(updated.dependencies).not.toContain(expect.objectContaining({
      '@gasket/log': '^6.0.0',
      '@gasket/cli': '^6.0.0'
    }));
  });

  it('adds require if used', async () => {
    const content = `
      const somePackage = require('some-package');
      
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-foo'
          ]
        },
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).toContain('import { createRequire } from \'module\'');
    expect(updated).toContain('const require = createRequire(import.meta.url);');
  });

  it('keeps setup content above exported config', async () => {
    const content = `
      const aboveSetup = {
        position: 'top'
      }
      
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-foo'
          ]
        },
        belowConfig: {
          position: 'bottom'
        }
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated.indexOf('aboveSetup')).toBeLessThan(
      updated.indexOf('export default')
    );
    expect(updated.indexOf('belowConfig')).toBeGreaterThan(
      updated.indexOf('export default')
    );
  });

  it('strips comments but not urls', async () => {
    const content = `
      // some comment here
      const url = 'https://example.com';
      
      module.exports = {
        plugins: {
          add: [
            '@gasket/plugin-foo'
          ]
        },
        belowConfig: {
          position: 'bottom'
        }
      };
    `;
    mockContext.files.set('gasket.config.js', content);
    await patch(mockContext);

    const updated = mockContext.files.get('gasket.mjs');
    expect(updated).not.toContain('some comment');
    expect(updated).toContain('const url = \'https://example.com\';');
  });
});
