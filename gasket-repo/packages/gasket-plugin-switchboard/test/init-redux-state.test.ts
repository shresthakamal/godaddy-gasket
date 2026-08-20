import { vi, describe, expect, beforeEach, afterEach, it } from 'vitest';
import type { Request, Response } from 'express';
import { Gasket, makeGasket, GasketEngine } from '@gasket/core';
import gasketReduxPlugin from '@gasket/plugin-redux';
import switchboardPlugin from '../src/index.js';
import gasketMiddlewarePlugin from '@gasket/plugin-middleware';
import gasketLoggerPlugin from '@gasket/plugin-logger';

describe('The initReduxState lifecycle hook', () => {
  let gasket: Gasket;
  let engine: GasketEngine;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    gasket = makeGasket({
      plugins: [gasketReduxPlugin, switchboardPlugin, gasketMiddlewarePlugin, gasketLoggerPlugin],
      switchboard: {
        enableRedux: true
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
    req = { mock: 'request' } as any;
    res = { mock: 'response' } as any;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('does nothing if `enableRedux` is false', async () => {
    gasket.config.switchboard = { enableRedux: false };

    await gasket.execWaterfall('initReduxState', {}, { req, res });

    expect(engine.actions.getPublicSwitchboardConfig).not.toHaveBeenCalled();
  });

  it('Calls getPublicSwitchboardConfig if `enableGasketData` is true', async () => {
    gasket.config.switchboard = { enableRedux: true };

    const state = await gasket.execWaterfall('initReduxState', {}, { req, res });

    expect(engine.actions.getPublicSwitchboardConfig)
      .toHaveBeenCalledWith(expect.any(Object), req);
    expect(state).toEqual({
      switchboard: {
        featureFlags: {
          someFeature: true,
          anotherFeature: false
        }
      }
    });
  });
});
