import configure from '../lib/configure.js';

describe('configure', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        env: 'local'
      }
    };
  });

  it('adds HTTPS defaults if no listener settings are configured', () => {
    const config = {};

    const newConfig = configure(mockGasket, config);

    expect(newConfig).toHaveProperty('https');
  });

  it('does not alter config for non-local environments', async () => {
    mockGasket.config.env = 'production';
    const config = {};

    const newConfig = configure(mockGasket, config);

    expect(newConfig).toBe(config);
    expect(newConfig).not.toHaveProperty('https');
  });

  it('does not add HTTPS settings if already configured', () => {
    const config = {
      https: {
        port: 3000,
        cert: 'Some Cert',
        key: 'Some Key'
      }
    };

    const newConfig = configure(mockGasket, config);

    expect(newConfig.https).toHaveProperty('key', 'Some Key');
    expect(newConfig.https).toHaveProperty('cert', 'Some Cert');
    expect(newConfig.https).toHaveProperty('port', 3000);
  });

  it('does not add HTTPS settings for HTTP-only sites', () => {
    const config = { http: 8080 };

    const newConfig = configure(mockGasket, config);

    expect(newConfig).not.toHaveProperty('https');
  });

  it('defaults hostname to local.gasket.dev-godaddy.com', () => {
    const config = {};

    const newConfig = configure(mockGasket, config);

    expect(newConfig).toHaveProperty('hostname', 'local.gasket.dev-godaddy.com');
  });

  it('preserves hostname if specified', () => {
    const config = {
      hostname: 'myapp.godaddy.com'
    };

    const newConfig = configure(mockGasket, config);

    expect(newConfig).toHaveProperty('hostname', 'myapp.godaddy.com');
  });
});
