import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createHook from '../lib/create.js';

describe('Create Hook', () => {

  let mockGasket, mockMethods;

  beforeEach(() => {
    mockGasket = {
      config: {}
    };

    mockMethods = {
      files: {
        add: vi.fn()
      },
      pkg: {
        add: vi.fn()
      },
      gasketConfig: {
        add: vi.fn(),
        addPlugin: vi.fn(),
        extend: vi.fn((fn) => {
          mockGasket.config = {
            ...mockGasket.config,
            ...fn(mockGasket.config)
          };
        })
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Generates and adds files', async () => {
    await createHook(mockGasket, mockMethods);
    const lastFilesAddCall = mockMethods.files.add.mock.calls[mockMethods.files.add.mock.calls.length - 1];

    expect(lastFilesAddCall).toEqual([
      expect.stringMatching(/\/generator\/\.\*$/),
      expect.stringMatching(/\/generator\/\*$/),
      expect.stringMatching(/\/generator\/!\(mocha\|jest\|vitest\)\/\**$/)
    ]);
  });

  it('generates test files', async () => {
    await createHook(mockGasket, { ...mockMethods, testPlugins: ['@gasket/jest'] });
    const lastFilesAddCall = mockMethods.files.add.mock.calls[mockMethods.files.add.mock.calls.length - 1];

    expect(lastFilesAddCall).toEqual([
      expect.stringMatching(/\/generator\/jest\/\*$/),
      expect.stringMatching(/\/generator\/jest\/\*\*\/\*$/)
    ]);
  });

  it('Adds dependencies to package.json', async () => {
    await createHook(mockGasket, mockMethods);
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('dependencies', { '@godaddy/gasket-plugin-hcs': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('devDependencies', { '@testing-library/react': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('devDependencies', { 'eslint-config-godaddy-react': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('devDependencies', { 'babel-eslint': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('devDependencies', { 'babel-loader': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('devDependencies', { '@babel/preset-env': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('devDependencies', { '@babel/preset-react': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('dependencies', { '@godaddy/gasket-hcs': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('dependencies', { react: expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('dependencies', { 'react-dom': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('dependencies', { 'react-intl': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('dependencies', { 'babel-loader': expect.any(String) });
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('eslintConfig', { extends: ['godaddy-react'] });
  });

  it('Adds dependencies to package.json: second', async () => {
    await createHook(mockGasket, mockMethods);
    expect(mockMethods.gasketConfig.add.mock.calls).toEqual([
      [
        'environments',
        {
          local: {
            hcs: {
              pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1',
              pcsOverrideQuery: {},
              defaultCacheMaxAge: 600
            }
          }
        }
      ],
      [
        'environments',
        {
          development: {
            hcs: {
              pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1',
              pcsOverrideQuery: {},
              defaultCacheMaxAge: 600
            }
          }
        }
      ],
      [
        'environments',
        {
          test: {
            hcs: {
              pcsUrl: 'https://uxp-platform-content-service-test.uxp-test.prod.onkatana.net/v1',
              pcsOverrideQuery: {},
              defaultCacheMaxAge: 600
            }
          }
        }
      ],
      [
        'environments',
        {
          production: {
            hcs: {
              pcsUrl: 'https://uxp-platform-content-service-prod.uxp-prod.prod.onkatana.net/v1',
              pcsOverrideQuery: {},
              defaultCacheMaxAge: 600
            }
          }
        }
      ]
    ]);
  });

  it('Adds HCS configs to the Gasket file', async () => {
    await createHook(mockGasket, mockMethods);
    expect(mockMethods.gasketConfig.add).toHaveBeenCalledTimes(4);
  });

  it('Adds plugin import to Gasket file', async () => {
    await createHook(mockGasket, mockMethods);
    expect(mockMethods.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginHcs', '@godaddy/gasket-plugin-hcs');
  });

  it('Extends intl config to add experimentalImportAttributes', async () => {
    await createHook(mockGasket, mockMethods);
    expect(mockMethods.gasketConfig.extend).toHaveBeenCalled();
    expect(mockGasket.config.intl.experimentalImportAttributes).toBe(true);
  });

  it('Adds build:watch script', async () => {
    await createHook(mockGasket, mockMethods);
    expect(mockMethods.pkg.add).toHaveBeenCalledWith('scripts', {
      'build:watch': 'nodemon --exec "npm run build" --ignore ./build/* --ignore intl.js --ignore swagger.json'
    });
  });
});
