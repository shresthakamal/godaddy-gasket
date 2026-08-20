import { vi } from 'vitest';
import preboot from '../lib/preboot.js';

describe('preboot', () => {
  it('calls gasket.actions.getAtlas', async () => {
    const gasket = {
      actions: {
        getAtlas: vi.fn().mockResolvedValue({})
      }
    };

    await expect(preboot(gasket)).resolves.toBeUndefined();
    expect(gasket.actions.getAtlas).toHaveBeenCalledTimes(1);
    expect(gasket.actions.getAtlas).toHaveBeenCalledWith();
  });

  it('awaits gasket.actions.getAtlas before resolving', async () => {
    let resolveAtlas;
    let settled = false;
    const getAtlas = vi.fn().mockImplementation(() => new Promise((resolve) => {
      resolveAtlas = resolve;
    }));
    const gasket = {
      actions: {
        getAtlas
      }
    };

    const prebootPromise = preboot(gasket).then(() => {
      settled = true;
    });

    await Promise.resolve();
    expect(getAtlas).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);

    resolveAtlas({ version: '1.0.0' });
    await prebootPromise;

    expect(settled).toBe(true);
  });

  it('propagates errors from gasket.actions.getAtlas', async () => {
    const error = new Error('atlas unavailable');
    const gasket = {
      actions: {
        getAtlas: vi.fn().mockRejectedValue(error)
      }
    };

    await expect(preboot(gasket)).rejects.toThrow(error);
  });
});


