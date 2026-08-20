import metadata from '../lib/metadata.js';

describe('metadata', () => {

  it('has the expected actions', () => {
    const meta = metadata({}, {});
    expect(meta.actions.map(i => i.name)).toEqual([
      'getTraceId',
      'getOtelMeter'
    ]);
  });
});
