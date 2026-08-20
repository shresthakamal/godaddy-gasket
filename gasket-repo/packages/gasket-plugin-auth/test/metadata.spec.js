import metadata from '../lib/metadata.js';

describe('metadata', () => {

  function checkNames(meta) {
    return meta.map(i => i.name);
  }

  it('returns expected metadata', () => {
    const meta = metadata({}, {});
    expect(meta).toHaveProperty('actions');
    expect(meta).toHaveProperty('guides');
    expect(meta).toHaveProperty('modules');
    expect(meta).toHaveProperty('configurations');
  });

  it('returns expected actions', () => {
    const meta = metadata({}, {});
    expect(checkNames(meta.actions)).toEqual([
      'getCheckAuth',
      'checkAuth',
      'checkShopperAuth'
    ]);
  });

  it('returns expected guides', () => {
    const meta = metadata({}, {});
    expect(checkNames(meta.guides)).toEqual([
      'Authentication Guide',
      'Authenticated Fetch Guide'
    ]);
  });

  it('returns expected modules', () => {
    const meta = metadata({}, {});
    expect(checkNames(meta.modules)).toEqual([
      '@godaddy/gasket-auth'
    ]);
  });

  it('returns expected configurations', () => {
    const meta = metadata({}, {});
    expect(checkNames(meta.configurations)).toEqual([
      'auth',
      'auth.appName',
      'auth.basePath',
      'auth.realm',
      'auth.allowHeartbeat',
      'auth.use12HourExpiration',
      'auth.apiProxy',
      'auth.host'
    ]);
  });
});
