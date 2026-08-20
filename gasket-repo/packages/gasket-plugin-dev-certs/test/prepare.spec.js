import { vi } from 'vitest';
import prepareHook from '../lib/prepare.js';

describe('prepare hook', () => {
  let mockGasket, mockInstallDevCerts;
  beforeEach(() => {
    mockInstallDevCerts = vi.fn();
    mockGasket = {
      config: {
        env: 'local'
      },
      actions: {
        installDevCerts: mockInstallDevCerts
      }
    };
  });

  it('should install dev certs when env is local', async () => {
    const result = await prepareHook(mockGasket, mockGasket.config);
    expect(mockInstallDevCerts).toHaveBeenCalled();
    expect(result).toEqual(mockGasket.config);
  });

  it('should not install dev certs when env is not local', async () => {
    mockGasket.config.env = 'production';
    const result = await prepareHook(mockGasket, mockGasket.config);
    expect(mockInstallDevCerts).not.toHaveBeenCalled();
    expect(result).toEqual(mockGasket.config);
  });
});
