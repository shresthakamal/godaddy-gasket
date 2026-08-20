import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getTrafficData } from '../lib/actions.js';

describe('actions', () => {
  /** @type {import('@gasket/core').Gasket} */
  let gasket;
  /** @type {import('@gasket/request').RequestLike} */
  let req;

  beforeEach(() => {
    gasket = /** @type {any} */ ({
      exec: vi.fn().mockReturnValue(Promise.resolve([])),
      execWaterfall: vi.fn().mockImplementation((name, data) => Promise.resolve(data))
    });
    req = { headers: { 'x-example': 'example' } };
  });

  it('sets the `loadSource` tcc value to `gasket`', async () => {
    const data = await getTrafficData(gasket, req);
    expect(data).toHaveProperty('loadSource', 'gasket');
  });

  it('sets the `tcc.spa` tcc value to `true`', async () => {
    const data = await getTrafficData(gasket, req);
    expect(data?.['tcc.spa']).toEqual(true);
  });

  it('merges in values injected via `trafficDataLayer` hooks', async () => {
    gasket.exec = vi.fn().mockReturnValue(Promise.resolve([
      { dcenter: 'a2' }
    ]));

    const data = await getTrafficData(gasket, req);
    expect(data).toHaveProperty('dcenter', 'a2');
  });

  it('runs the data through the `tccData` execWaterfall lifecycle', async () => {
    await getTrafficData(gasket, req);
    expect(gasket.execWaterfall).toHaveBeenCalledWith('tccData', expect.objectContaining({
      'loadSource': 'gasket',
      'tcc.spa': true
    }), expect.objectContaining({ req: expect.anything() }));
  });

  it('returns the value from the `tccData` lifecycle, allowing properties to be removed', async () => {
    gasket.execWaterfall = vi.fn().mockImplementation(async (name, data) => {
      const rest = { ...data };
      delete rest.loadSource;
      return rest;
    });

    const data = await getTrafficData(gasket, req);
    expect(data).not.toHaveProperty('loadSource');
  });
});
