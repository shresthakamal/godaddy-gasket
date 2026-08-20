import { vi } from 'vitest';

const mockContext = vi.fn();
const mockCreateSecureContext = vi.fn().mockReturnValue(mockContext);

vi.mock('tls', () => {
  return {
    default: {
      createSecureContext: mockCreateSecureContext
    }
  };
});

const httpsProxy = (await import('../lib/https-proxy.js')).default;


describe('httpsProxy', () => {
  let mockGasket, mockHttpsProxyConfig, mockSniCallback;

  beforeEach(() => {
    mockSniCallback = vi.fn();
    mockHttpsProxyConfig = {};
    mockGasket = {
      actions: {
        getDevCert: vi.fn().mockImplementation(hostname => {
          return {
            cert: `${hostname}.crt`,
            key: `${hostname}.key`
          };
        })
      },
      config: {
        hostname: 'local.gasket.dev-godaddy.com',
        env: 'local',
        https: {}
      },
      branch: vi.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('provides default hostname if not provided', async () => {
    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);
    expect(config).toHaveProperty('hostname', 'local.gasket.dev-godaddy.com');
  });

  it('provides default port if not provided', async () => {
    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);
    expect(config).toHaveProperty('port', 8443);
  });

  it('provides default protocol if not provided', async () => {
    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);
    expect(config).toHaveProperty('protocol', 'https');
  });

  it('does not modify existing protocol, hostname, or port', async () => {
    mockHttpsProxyConfig = {
      protocol: 'http',
      hostname: 'local.gasket.dev-secureserver.net',
      port: 8080
    };

    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    expect(config).toHaveProperty('protocol', 'http');
    expect(config).toHaveProperty('hostname', 'local.gasket.dev-secureserver.net');
    expect(config).toHaveProperty('port', 8080);
  });

  it('does not modify existing SNICallback', async () => {
    mockHttpsProxyConfig.ssl = {
      SNICallback: function foo() {}
    };

    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);
    expect(config.ssl).toHaveProperty('SNICallback', mockHttpsProxyConfig.ssl.SNICallback);
    expect(config.ssl.SNICallback).toEqual(mockHttpsProxyConfig.ssl.SNICallback);
  });

  it('adds SNICallback', async () => {
    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    expect(config).toHaveProperty('ssl');
    expect(config.ssl).toHaveProperty('SNICallback');
  });

  it('SNICallback sets up context', async () => {
    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    // eslint-disable-next-line new-cap
    config.ssl.SNICallback('local.gasket.dev-godaddy.com', mockSniCallback);
    expect(mockCreateSecureContext).toHaveBeenCalled();
    expect(mockSniCallback).toHaveBeenCalledWith(null, mockContext);
  });

  it('SNICallback sets cert for local.gasket.* hostnames', async () => {
    const attemptedHostnames = [
      'local.gasket.dev-godaddy.com',
      'local.gasket.int.dev-godaddy.com',
      'local.gasket.dev-secureserver.net',
      'local.gasket.dev-gdcorp.tools',
      'local.gasket.int.dev-gdcorp.tools'
    ];

    for (const hostname of attemptedHostnames) {
      const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);
      // eslint-disable-next-line new-cap
      config.ssl.SNICallback(hostname, mockSniCallback);

      const expectedPart = hostname.replace('local.', '*.');

      expect(mockCreateSecureContext).toHaveBeenCalledWith({
        cert: `${expectedPart}.crt`,
        key: `${expectedPart}.key`
      });
    }
  });

  it('sets up sni for *.gasket.* dev hostnames', async () => {
    const attemptedHostnames = [
      'bogus.gasket.dev-godaddy.com',
      'bogus.gasket.int.dev-godaddy.com',
      'bogus.gasket.dev-secureserver.net',
      'bogus.gasket.dev-gdcorp.tools',
      'bogus.gasket.int.dev-gdcorp.tools'
    ];


    for (const hostname of attemptedHostnames) {
      const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);
      // eslint-disable-next-line new-cap
      config.ssl.SNICallback(hostname, mockSniCallback);

      const expectedPart = hostname.replace('bogus.', '*.');

      expect(mockCreateSecureContext).toHaveBeenCalledWith({
        cert: `${expectedPart}.crt`,
        key: `${expectedPart}.key`
      });
    }
  });

  it('does not set certs for non gasket.* hostnames', async () => {
    const attemptedHostnames = [
      'bogus.app.dev-godaddy.com',
      'bogus.app.int.dev-godaddy.com',
      'bogus.app.dev-secureserver.net',
      'bogus.app.dev-gdcorp.tools',
      'bogus.app.int.dev-gdcorp.tools'
    ];

    for (const hostname of attemptedHostnames) {
      const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);
      // eslint-disable-next-line new-cap
      config.ssl.SNICallback(hostname, mockSniCallback);

      expect(mockCreateSecureContext).not.toHaveBeenCalled();
      expect(mockSniCallback).toHaveBeenCalledWith(null, null);
    }
  });

  it('verify incoming config is changed', async () => {
    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    expect(config).not.toBe(mockHttpsProxyConfig);
  });

  it('no changes if getDevCert action not available', async () => {
    delete mockGasket.actions.getDevCert;

    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    expect(config).toBe(mockHttpsProxyConfig);
  });

  it('no changes if ssl already configured', async () => {
    mockHttpsProxyConfig.ssl = { };

    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    expect(config).toBe(mockHttpsProxyConfig);
  });

  it('no changes if not local env', async () => {
    mockGasket.config.env = 'production';

    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    expect(config).toBe(mockHttpsProxyConfig);
  });

  it('no changes if protocol set as http', async () => {
    mockHttpsProxyConfig.protocol = 'http';

    const config = await httpsProxy(mockGasket, mockHttpsProxyConfig);

    expect(config).toBe(mockHttpsProxyConfig);
  });
});
