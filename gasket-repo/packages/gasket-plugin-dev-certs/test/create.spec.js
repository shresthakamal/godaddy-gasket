import { vi } from 'vitest';
import create from '../lib/create.js';
import { readFileSync } from 'fs';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version } = packageJson;

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: vi.fn()
      },
      gasketConfig: {
        addPlugin: vi.fn()
      }
    };
  });

  it('adds plugin to gasketConfig', () => {
    create({}, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginDevCerts', '@godaddy/gasket-plugin-dev-certs');
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',  {
      [name]: `^${version}`
    });
  });
});
