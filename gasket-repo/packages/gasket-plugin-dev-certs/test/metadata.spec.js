import metadata from '../lib/metadata.js';

describe('metadata', () => {

  it('returns expected metadata', () => {
    const meta = metadata({}, {});
    expect(meta).toHaveProperty('actions');
  });

  it('returns expected actions', () => {
    const meta = metadata({}, {});
    expect(meta.actions).toHaveLength(2);
    expect(meta.actions.map(i => i.name)).toEqual([
      'getDevCert',
      'installDevCerts'
    ]);
  });
});
