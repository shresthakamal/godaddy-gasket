/* eslint-disable max-statements */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import create from '../lib/create.js';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version, devDependencies } = packageJson;

const mockPkgAdd = vi.fn();
const mockPkgHas = vi.fn();
const mockPkgRemove = vi.fn();
const mockFilesAdd = vi.fn();
const mockCfgAdd = vi.fn();
const mockCfgExtend = vi.fn();
const mockAddPlugin = vi.fn();
const mockNextStepsPush = vi.fn();
const mockMessagesPush = vi.fn();

vi.mock('@gasket/utils', () => ({
  getPackageLatestVersion: vi.fn().mockReturnValue('2001.2.13')
}));

describe('create', function () {
  let mockGasket, mockContext;

  beforeEach(async () => {
    mockGasket = {};
    mockContext = {
      hasGasketIntl: false,
      pkg: {
        add: mockPkgAdd,
        has: mockPkgHas,
        remove: mockPkgRemove
      },
      files: {
        add: mockFilesAdd
      },
      gasketConfig: {
        add: mockCfgAdd,
        extend: mockCfgExtend,
        addPlugin: mockAddPlugin
      },
      uxp: {
        app: 'bogus',
        header: 'internal-header'
      },
      nextSteps: {
        push: mockNextStepsPush
      },
      messages: {
        push: mockMessagesPush
      },
      useAppRouter: false,
      nextServerType: 'customServer'
    };
  });

  afterEach(function () {
    vi.clearAllMocks();
  });

  it('runs after nextjs and @gasket/plugin-nextjs', function () {
    expect(create.timing).toHaveProperty('after');
    expect(create.timing.after).toEqual(['@gasket/plugin-nextjs']);
  });

  it('runs on the create lifecycle event', function () {
    expect(typeof create.handler).toBe('function');
  });

  it('adds the expected package.json dependencies', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgAdd.mock.calls[0]).toEqual([
      'dependencies',
      {
        '@godaddy/gasket-next': devDependencies['@godaddy/gasket-next'],
        '@godaddy/browserslist-config': devDependencies['@godaddy/browserslist-config'],
        '@ux/pivot': '^2001.2.13',
        '@ux/box': '^2001.2.13',
        '@ux/card': '^2001.2.13',
        [name]: `^${version}`,
        '@ux/icon': '^2001.2.13',
        '@ux/intents': '^2001.2.13',
        '@ux/text': '^2001.2.13',
        'react-transition-group': devDependencies['react-transition-group'],
        '@godaddy/react-mintl': devDependencies['@godaddy/react-mintl']
      }]);
  });

  it('sets reactIntlPkg to @godaddy/react-mintl when hasGasketIntl is true', async function () {
    mockContext.hasGasketIntl = true;
    await create.handler(mockGasket, mockContext);
    expect(mockContext.reactIntlPkg).toBe('@godaddy/react-mintl');
  });

  it('does not set reactIntlPkg when hasGasketIntl is false', async function () {
    mockContext.hasGasketIntl = false;
    await create.handler(mockGasket, mockContext);
    expect(mockContext.reactIntlPkg).toBeUndefined();
  });

  it('adds nextRouting: false to intl config when hasGasketIntl is true', async function () {
    mockContext.hasGasketIntl = true;
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd).toHaveBeenCalledWith('intl', {
      nextRouting: false
    });
  });

  it('sets useMintl to true', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[0][1]).toEqual({
      useMintl: true
    });
  });

  it('removes react-intl from dependencies', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgRemove).toHaveBeenCalledWith(['dependencies', 'react-intl']);
  });

  it('force adds the correct react and react-dom', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgAdd.mock.calls[1]).toEqual([
      'dependencies',
      {
        'react': devDependencies.react,
        'react-dom': devDependencies['react-dom']
      },
      {
        force: true
      }
    ]);
  });

  it('force adds the correct @testing-library/react', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgAdd.mock.calls[2]).toEqual([
      'devDependencies',
      {
        '@testing-library/react': '^14.0.0'
      },
      {
        force: true
      }
    ]);
  });

  it('adds the correct browserslist config', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgAdd.mock.calls[3]).toEqual([
      'browserslist',
      [
        'extends @godaddy/browserslist-config'
      ]
    ]);
  });

  it('adds the expected package.json devDependencies', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgAdd.mock.calls[4]).toEqual([
      'devDependencies',
      {
        'url-loader': devDependencies['url-loader'],
        'file-loader': devDependencies['file-loader'],
        'sass': devDependencies.sass,
        'postcss': devDependencies.postcss
      }]);
  });

  it('adds the expected postcss devDependencies', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgAdd.mock.calls[5]).toEqual([
      'devDependencies',
      {
        '@godaddy/postcss-merge-selectors': devDependencies['@godaddy/postcss-merge-selectors'],
        'postcss-flexbugs-fixes': devDependencies['postcss-flexbugs-fixes'],
        'postcss-preset-env': devDependencies['postcss-preset-env']
      }]);
  });

  it('adds the expected pages generated files', async function () {
    mockPkgHas.mockReturnValueOnce(true);
    await create.handler(mockGasket, mockContext);
    expect(mockFilesAdd).toHaveBeenCalled();

    const root = path.join(__dirname, '..');
    expect(mockFilesAdd.mock.calls[0]).toEqual([
      `${root}/generator/shared/**/*`,
      `${root}/generator/shared/.*`
    ]);
    expect(mockFilesAdd.mock.calls[1]).toEqual([
      `${root}/generator/pages-router/**/*.{js,jsx}`
    ]);
  });

  it('adds the expected pages default server generated files', async function () {
    mockPkgHas.mockReturnValueOnce(true);
    mockContext.nextServerType = 'defaultServer';
    await create.handler(mockGasket, mockContext);
    expect(mockFilesAdd).toHaveBeenCalled();

    const root = path.join(__dirname, '..');
    expect(mockFilesAdd.mock.calls[0]).toEqual([
      `${root}/generator/shared/**/*`,
      `${root}/generator/shared/.*`
    ]);
    expect(mockFilesAdd.mock.calls[1]).toEqual([
      `${root}/generator/pages-router/**/*.{js,jsx}`
    ]);
    expect(mockFilesAdd.mock.calls[2]).toEqual([
      `${root}/generator/pages-router-default-server/**/*.{js,jsx}`
    ]);
  });

  it('adds the expected app router generated files', async function () {
    mockPkgHas.mockReturnValueOnce(true);
    mockContext.useAppRouter = true;
    await create.handler(mockGasket, mockContext);
    expect(mockFilesAdd).toHaveBeenCalled();

    const root = path.join(__dirname, '..');
    expect(mockFilesAdd.mock.calls[0]).toEqual([
      `${root}/generator/shared/**/*`,
      `${root}/generator/shared/.*`
    ]);
    expect(mockFilesAdd.mock.calls[1]).toEqual([
      `${root}/generator/app-router/**/*.{js,jsx}`
    ]);
  });

  it('adds the expected generated files for vitest tests', async function () {
    mockPkgHas.mockReturnValueOnce(true);
    await create.handler(mockGasket, mockContext);
    expect(mockFilesAdd).toHaveBeenCalled();

    const root = path.join(__dirname, '..');
    expect(mockFilesAdd.mock.calls[2]).toEqual([
      `${root}/generator/vitest/pages-router/**/*.{js,jsx}`
    ]);
  });

  it('adds the expected generated files for intl', async function () {
    mockContext.hasGasketIntl = true;
    mockPkgHas.mockReturnValueOnce(true);
    await create.handler(mockGasket, mockContext);
    expect(mockFilesAdd).toHaveBeenCalled();

    const root = path.join(__dirname, '..');
    expect(mockFilesAdd.mock.calls[3]).toEqual([
      `${root}/generator/intl/**/*`
    ]);
  });

  it('adds generated files when using TypeScript', async function () {
    mockPkgHas.mockReturnValueOnce(true);
    mockContext.nextServerType = 'defaultServer';
    mockContext.typescript = true;
    await create.handler(mockGasket, mockContext);
    expect(mockFilesAdd).toHaveBeenCalled();

    const root = path.join(__dirname, '..');
    expect(mockFilesAdd.mock.calls[0]).toEqual([
      `${root}/generator/shared/**/*`,
      `${root}/generator/shared/.*`
    ]);
    expect(mockFilesAdd.mock.calls[1]).toEqual([
      `${root}/generator/pages-router/**/*.{ts,tsx}`
    ]);
    expect(mockFilesAdd.mock.calls[2]).toEqual([
      `${root}/generator/pages-router-default-server/**/*.{ts,tsx}`
    ]);
  });

  it('does not adds generated files if not using Next.js', async function () {
    mockPkgHas.mockReturnValueOnce(false);
    await create.handler(mockGasket, mockContext);
    expect(mockFilesAdd).not.toHaveBeenCalled();
  });

  it('adds `presentationCentral` to gasket.config', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[1][0]).toEqual('presentationCentral');
  });

  it('adds `presentationCentral` to gasket.config with correct config when useAppRouter is true', async function () {
    mockContext.useAppRouter = true;
    await create.handler(mockGasket, mockContext);


    expect(mockCfgAdd.mock.calls[0][0]).toEqual('uxp');
    expect(mockCfgAdd.mock.calls[1][1]).toEqual({
      externals: false
    });
    expect(mockCfgAdd.mock.calls[2][0]).toEqual('presentationCentral');
    expect(mockCfgAdd.mock.calls[1][1]).toMatchObject({});
  });

  it('adds `app` to PC gasket.config', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[1][1].params).toHaveProperty('app', 'bogus');
  });

  it('does not add `uxcore` to PC gasket.config', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[1][1].params).not.toHaveProperty('uxcore');
  });

  it('adds `appName` as `app` to PC gasket.config if `app` is not specified in createContext', async function () {
    mockContext = { ...mockContext, uxp: { header: 'internal-header' }, appName: 'my-app' };
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[1][1].params).toHaveProperty('app', 'my-app');
  });

  it('adds full header name to PC gasket.config', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[1][1].params).toHaveProperty('manifest', 'internal-header');
  });

  it('does not set theme', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[1][1].params).not.toHaveProperty('theme');
  });

  it('set theme if isGoDark', async function () {
    mockContext.uxp.isGoDark = true;
    await create.handler(mockGasket, mockContext);
    expect(mockCfgAdd.mock.calls[1][1].params).toHaveProperty('theme', 'go-dark:brand');
  });

  it('adds nextSteps about hosts config', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockNextStepsPush.mock.calls[0][0]).toContain('Configure your /etc/hosts');
  });

  it('extends devProxy config if nextDevProxy is true', async function () {
    mockContext.nextDevProxy = true;
    mockContext.nextServerType = 'defaultServer';
    await create.handler(mockGasket, mockContext);
    expect(mockCfgExtend).toHaveBeenCalledWith(expect.any(Function));
  });

  it('adds postcss config to package.json', async function () {
    await create.handler(mockGasket, mockContext);
    expect(mockPkgAdd.mock.calls[6]).toEqual([
      'postcss',
      {
        plugins: {
          'postcss-flexbugs-fixes': {},
          'postcss-preset-env': {
            autoprefixer: {
              flexbox: 'no-2009'
            },
            stage: 3,
            features: {
              'custom-properties': false
            }
          },
          '@godaddy/postcss-merge-selectors': {
            matchers: [
              '^\\*$'
            ]
          }
        }
      }
    ]);
  });

  describe('when RTL selected', function () {
    it('adds the expected postcss devDependencies', async function () {
      mockContext.uxp.useRtl = true;
      await create.handler(mockGasket, mockContext);
      expect(mockPkgAdd.mock.calls[6]).toEqual([
        'devDependencies',
        {
          'postcss-rtlcss': devDependencies['postcss-rtlcss']
        }
      ]);
    });

    it('adds postcss-rtlcss config to postcss config in the package.json', async function () {
      mockContext.uxp.useRtl = true;
      await create.handler(mockGasket, mockContext);
      expect(mockPkgAdd.mock.calls[7]).toEqual([
        'postcss',
        {
          plugins: {
            'postcss-flexbugs-fixes': {},
            'postcss-preset-env': {
              autoprefixer: {
                flexbox: 'no-2009'
              },
              stage: 3,
              features: {
                'custom-properties': false
              }
            },
            '@godaddy/postcss-merge-selectors': {
              matchers: [
                '^\\*$'
              ]
            },
            'postcss-rtlcss': {}
          }
        }
      ]);
    });
  });
});
