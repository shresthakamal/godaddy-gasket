import { vi } from 'vitest';
import serverConfig from '../lib/server-config.js';

describe('serverConfig', () => {
  let mockGasket, mockServerConfig;

  beforeEach(() => {
    mockServerConfig = {
      https: {}
    };
    mockGasket = {
      actions: {
        getDevCert: vi.fn().mockResolvedValue({
          cert: 'cert',
          key: 'key'
        })
      },
      config: {
        env: 'local',
        https: {}
      },
      branch: vi.fn().mockReturnThis()
    };
  });

  it('adds sni object to https property for local env', async () => {
    const result = await serverConfig(mockGasket, mockServerConfig);

    expect(result).not.toBe(mockServerConfig);
    expect(result.https).toHaveProperty('sni');
    expect(result.https).toHaveProperty('port', 8443);
  });

  it('does not alter config for non-local environments', async () => {
    mockGasket.config.env = 'production';
    const result = await serverConfig(mockGasket, mockServerConfig);

    expect(result).toBe(mockServerConfig);
    expect(result.https).not.toHaveProperty('sni');
  });

  it('sets up sni for local.gasket.* hostnames by default', async () => {
    const attemptedHostnames = [
      'local.gasket.dev-godaddy.com',
      'local.gasket.int.dev-godaddy.com',
      'local.gasket.dev-secureserver.net',
      'local.gasket.dev-gdcorp.tools',
      'local.gasket.int.dev-gdcorp.tools'
    ];


    for (const hostname of attemptedHostnames) {
      mockServerConfig.hostname = hostname;
      const result = await serverConfig(mockGasket, mockServerConfig);

      expect(result.https).toHaveProperty('sni');
      expect(result.https).toHaveProperty('port', 8443);
      result.https = {};
      result.hostname = null;
    }
  });

  it('sets up sni for *.gasket.* dev hostnames by default', async () => {
    const attemptedHostnames = [
      'bogus.gasket.dev-godaddy.com',
      'bogus.gasket.int.dev-godaddy.com',
      'bogus.gasket.dev-secureserver.net',
      'bogus.gasket.dev-gdcorp.tools',
      'bogus.gasket.int.dev-gdcorp.tools'
    ];

    for (const hostname of attemptedHostnames) {
      mockServerConfig.hostname = hostname;
      const result = await serverConfig(mockGasket, mockServerConfig);
      expect(result.https).toHaveProperty('sni');
      expect(result.https).toHaveProperty('port', 8443);
      result.https = {};
      result.hostname = null;
    }
  });

  it('adds default certs to existing HTTPS settings if unspecified', async () => {
    mockServerConfig.https.port = 3000;

    const expectServerNames = [
      '*.gasket.dev-godaddy.com',
      '*.gasket.int.dev-godaddy.com',
      '*.gasket.dev-secureserver.net',
      '*.gasket.dev-gdcorp.tools',
      '*.gasket.int.dev-gdcorp.tools'
    ];

    const result = await serverConfig(mockGasket, mockServerConfig);
    expect(result.https).toHaveProperty('sni');

    expectServerNames.forEach(name => {
      expect(result.https.sni[name]).toBeDefined();
      expect(result.https.sni[name]).toHaveProperty('key');
      expect(result.https.sni[name]).toHaveProperty('cert');
    });

    expect(result.https).toHaveProperty('port', 3000);
  });

  it('adds default certs to existing HTTP/2 settings if unspecified', async () => {
    mockServerConfig = {
      http2: {
        port: 3000
      }
    };

    const expectServerNames = [
      '*.gasket.dev-godaddy.com',
      '*.gasket.int.dev-godaddy.com',
      '*.gasket.dev-secureserver.net',
      '*.gasket.dev-gdcorp.tools',
      '*.gasket.int.dev-gdcorp.tools'
    ];

    const result = await serverConfig(mockGasket, mockServerConfig);
    expect(result.http2).toHaveProperty('sni');

    expectServerNames.forEach(name => {
      expect(result.http2.sni).toBeDefined();
      expect(result.http2.sni[name]).toHaveProperty('key');
      expect(result.http2.sni[name]).toHaveProperty('cert');
    });

    expect(result.http2).toHaveProperty('port', 3000);
  });

  it('sets the cert files root to the gasket root if unspecified', async () => {
    const root = '/app/root';
    mockServerConfig = {
      root,
      https: {
        port: 3000,
        cert: 'Some Cert',
        key: 'Some Key'
      }
    };

    const result = await serverConfig(mockGasket, mockServerConfig);

    expect(result.https).toHaveProperty('root', root);
  });

  it('does not add default SNI settings if the hostname is specified', async () => {
    mockServerConfig = {
      hostname: 'appconfig.int.dev-godaddy.com',
      https: {
        port: 9999,
        root: './certs',
        key: '_.appconfig.int.dev-godaddy.com.key',
        cert: [
          '_.appconfig.int.dev-godaddy.com.crt',
          'gd_bundle-g2.crt'
        ]
      }
    };

    const result = await serverConfig(mockGasket, mockServerConfig);

    expect(result.https).not.toHaveProperty('sni');
  });

  it('does not add getDevCert action not available', async () => {
    delete mockGasket.actions.getDevCert;

    const result = await serverConfig(mockGasket, mockServerConfig);

    expect(result.https).not.toHaveProperty('sni');
  });

  it('no effect if protocol is an array', async () => {
    mockServerConfig.https = [{ port: 5678 }];

    const result = await serverConfig(mockGasket, mockServerConfig);

    expect(result.https).not.toHaveProperty('sni');
  });

  it('does not add HTTPS settings for HTTP-only sites', async () => {
    mockServerConfig = { http: 8080 };

    const result = await serverConfig(mockGasket, mockServerConfig);

    expect(result).not.toHaveProperty('https');
  });
});
