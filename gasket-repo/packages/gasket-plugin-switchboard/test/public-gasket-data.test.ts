import { vi, describe, expect, beforeEach, afterEach, it } from 'vitest';
import { Gasket, GasketEngine, makeGasket } from '@gasket/core';
import gasketDataPlugin from '@gasket/plugin-data';
import switchboardPlugin from '../src/index.js';
import { GasketRequest, RequestLike } from '@gasket/request';

describe('The publicGasketData lifecycle hook', () => {
  let gasket: Gasket;
  let engine: GasketEngine;
  let req: RequestLike;

  beforeEach(() => {
    gasket = makeGasket({
      plugins: [gasketDataPlugin, switchboardPlugin],
      switchboard: {
        enableGasketData: true
      }
    });
    engine = (gasket as any).engine as GasketEngine;
    vi
      .spyOn(engine.actions, 'getPublicSwitchboardConfig')
      .mockResolvedValue({
        featureFlags: {
          someFeature: true,
          anotherFeature: false
        }
      });
    req = new GasketRequest({
      headers: { 'x-example': 'example' },
      cookies: {},
      query: {},
      path: '/'
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('does nothing if `enableGasketData` is false', async () => {
    gasket.config.switchboard = {
      enableGasketData: false
    };

    await gasket.actions.getPublicGasketData(req);

    expect(engine.actions.getPublicSwitchboardConfig).not.toHaveBeenCalled();
  });

  it('Calls getPublicSwitchboardConfig if `enableGasketData` is true', async () => {
    gasket.config.switchboard = {
      enableGasketData: true
    };

    const data = await gasket.actions.getPublicGasketData(req);

    expect(engine.actions.getPublicSwitchboardConfig)
      .toHaveBeenCalledWith(expect.any(Object), expect.any(GasketRequest));
    expect(data).toEqual({
      switchboard: {
        featureFlags: {
          someFeature: true,
          anotherFeature: false
        }
      }
    });
  });
});
