import gasketData from '../lib/gasket-data.js';

describe('publicGasketData', () => {
  let mockGasket, mockData;

  beforeEach(() => {
    mockGasket = {
      config: {
        auth: {
          basePath: '/my/app/path'
        }
      }
    };
    mockData = {
      some: 'data',
      public: {
        somePublicData: 'value'
      }
    };
  });

  it('returns an object', async () => {
    const results = await gasketData(mockGasket, mockData);
    expect(results).toBeInstanceOf(Object);
  });

  it('returns expected auth data from gasket config', async () => {
    const results = await gasketData(mockGasket, mockData);
    expect(results.public).toHaveProperty('auth');
    expect(results.public.auth).toHaveProperty('basePath', '/my/app/path');
  });

  it('includes appName in public auth data when configured', async () => {
    mockGasket.config.auth.appName = 'auctions';
    const results = await gasketData(mockGasket, mockData);
    expect(results.public.auth).toHaveProperty('appName', 'auctions');
  });

  it('includes both basePath and appName when both are configured', async () => {
    mockGasket.config.auth.appName = 'auctions';
    const results = await gasketData(mockGasket, mockData);
    expect(results.public.auth).toHaveProperty('basePath', '/my/app/path');
    expect(results.public.auth).toHaveProperty('appName', 'auctions');
  });

  it('exposes appName even when basePath is absent', async () => {
    mockGasket.config.auth = { appName: 'auctions' };
    const results = await gasketData(mockGasket, mockData);
    expect(results.public.auth).toHaveProperty('appName', 'auctions');
    expect(results.public.auth).not.toHaveProperty('basePath');
  });

  it('preserves existing auth keys already set on data.public.auth', async () => {
    mockData.public.auth = { someExisting: 'value' };
    const results = await gasketData(mockGasket, mockData);
    expect(results.public.auth).toHaveProperty('someExisting', 'value');
    expect(results.public.auth).toHaveProperty('basePath', '/my/app/path');
  });

  it('ignores if no auth basePath or appName', async () => {
    delete mockGasket.config.auth;
    const results = await gasketData(mockGasket, mockData);
    expect(results.public).not.toHaveProperty('auth');
  });

  it('preserves other data', async () => {
    const results = await gasketData(mockGasket, mockData);
    expect(results).toHaveProperty('some', 'data');
    expect(results.public).toHaveProperty('somePublicData', 'value');
  });

  it('adds public data if not yet set', async () => {
    delete mockData.public;
    const results = await gasketData(mockGasket, mockData);
    expect(results).toHaveProperty('some', 'data');
    expect(results.public).not.toHaveProperty('somePublicData');
    expect(results.public).toHaveProperty('auth');
    expect(results.public.auth).toHaveProperty('basePath', '/my/app/path');
  });
});
