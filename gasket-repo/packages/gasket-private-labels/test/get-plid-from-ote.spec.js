import { getProdPlidFromOte } from '../lib/env-plid.js';

describe('getPlidFromHost', () => {
  it('receives the correct plid for ote', () => {
    // domainbox
    const results = getProdPlidFromOte(1002768);
    expect(results).toEqual(525850);
  });

  it('returns passed plid if ote not found in map', () => {
    const results = getProdPlidFromOte(500);
    expect(results).toEqual(500);
  });
});

