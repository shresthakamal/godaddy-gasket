import { vi } from 'vitest';
import create from '../lib/create.js';

const name = '@godaddy/gasket-plugin-atlas';

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

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginAtlas', name);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: expect.stringMatching(/[\d.]+/)
    });
  });

  it('should handle gasket with different configs', () => {
    const mockGasket = {
      config: {
        env: 'prod',
        plugins: ['other-plugin']
      }
    };

    expect(() => {
      create(mockGasket, mockContext);
    }).not.toThrow();

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginAtlas', name);
  });

  it('should return undefined', () => {
    const result = create({}, mockContext);
    expect(result).toBeUndefined();
  });
});
