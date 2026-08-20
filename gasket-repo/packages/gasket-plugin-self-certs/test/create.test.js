import { vi } from 'vitest';
import create from '../lib/create.js';

const name = '@godaddy/gasket-plugin-self-certs';

describe('create', function () {
  let mockContext, mockGasket;

  beforeEach(function () {
    mockGasket = { config: {} };
    mockContext = {
      pkg: {
        add: vi.fn()
      },
      gasketConfig: {
        addPlugin: vi.fn()
      }
    };
  });

  it('adds plugin to gasketConfig', function () {
    create(mockGasket, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith(
      'pluginSelfCerts',
      name
    );
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: expect.stringMatching(/[\d.]+/)
    });
  });
});
