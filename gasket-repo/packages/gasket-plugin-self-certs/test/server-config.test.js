import { vi } from 'vitest';

import serverConfig from '../lib/server-config.js';

const EXAMPLE_CERT = 'example-cert';
const EXAMPLE_KEY = 'example-key';
const FIRST_CERT = 'first-cert';
const FIRST_KEY = 'first-key';

describe('serverConfig hook', function () {
  let mockGasket, mockServerConfig;

  beforeEach(function () {
    mockServerConfig = {
      https: {}
    };
    mockGasket = {
      actions: {
        getSelfCert: vi.fn().mockResolvedValue({
          cert: EXAMPLE_CERT,
          key: EXAMPLE_KEY
        })
      },
      config: {
        env: 'test',
        selfCerts: {
          https: 'localhost'
        }
      },
      logger: {
        error: vi.fn()
      },
      branch: vi.fn().mockReturnThis()
    };
  });

  it('has expected timing', function () {
    expect(serverConfig).toHaveProperty(
      'timing',
      expect.objectContaining({
        after: ['@godaddy/gasket-plugin-dev-certs']
      })
    );
  });

  it('no effect when selfCert.https not enabled', async function () {
    delete mockGasket.config.selfCerts;
    await serverConfig.handler(mockGasket, mockServerConfig);
    expect(mockGasket.actions.getSelfCert).not.toHaveBeenCalled();
  });

  it('no effect when https is an array', async function () {
    mockServerConfig.https = [
      {
        port: 5678
      }
    ];
    await serverConfig.handler(mockGasket, mockServerConfig);
    expect(mockGasket.actions.getSelfCert).not.toHaveBeenCalled();
  });

  it('sets the expected default self cert', async function () {
    await serverConfig.handler(mockGasket, mockServerConfig);
    expect(mockGasket.actions.getSelfCert).toHaveBeenCalledWith('localhost');
    expect(mockServerConfig.https).toEqual(
      expect.objectContaining({
        cert: EXAMPLE_CERT,
        key: EXAMPLE_KEY
      })
    );
  });

  it('sets the expected custom self cert', async function () {
    mockGasket.config.selfCerts.https = 'example.com';
    await serverConfig.handler(mockGasket, mockServerConfig);
    expect(mockGasket.actions.getSelfCert).toHaveBeenCalledWith('example.com');
    expect(mockServerConfig.https).toEqual(
      expect.objectContaining({
        cert: EXAMPLE_CERT,
        key: EXAMPLE_KEY
      })
    );
  });

  it('handles boolean true as localhost', async function () {
    mockGasket.config.selfCerts.https = true;
    await serverConfig.handler(mockGasket, mockServerConfig);
    expect(mockGasket.actions.getSelfCert).toHaveBeenCalledWith('localhost');
  });

  it('sets the expected default self cert with SNI', async function () {
    mockServerConfig.https.port = 1234;
    mockServerConfig.https.sni = {
      '*.example.com': {
        cert: FIRST_CERT,
        key: FIRST_KEY
      }
    };
    await serverConfig.handler(mockGasket, mockServerConfig);
    expect(mockGasket.actions.getSelfCert).toHaveBeenCalledWith('localhost');
    expect(mockServerConfig.https).toEqual(
      expect.objectContaining({
        port: 1234,
        sni: {
          '*.example.com': {
            cert: FIRST_CERT,
            key: FIRST_KEY
          },
          '*': {
            cert: EXAMPLE_CERT,
            key: EXAMPLE_KEY
          }
        }
      })
    );
  });

  it('gets the expected custom self cert with SNI', async function () {
    mockServerConfig.https.port = 1234;
    mockServerConfig.https.sni = {
      '*.example.com': {
        cert: FIRST_CERT,
        key: FIRST_KEY
      }
    };
    mockGasket.config.selfCerts.https = 'custom.hostname.com';
    await serverConfig.handler(mockGasket, mockServerConfig);
    expect(mockGasket.actions.getSelfCert).toHaveBeenCalledWith(
      'custom.hostname.com'
    );
    expect(mockServerConfig.https).toEqual(
      expect.objectContaining({
        port: 1234,
        sni: {
          '*.example.com': {
            cert: FIRST_CERT,
            key: FIRST_KEY
          },
          'custom.hostname.com': {
            cert: EXAMPLE_CERT,
            key: EXAMPLE_KEY
          }
        }
      })
    );
  });

  it('logs error and returns config when cert generation fails', async function () {
    const error = new Error('Cert generation failed');

    mockGasket.actions.getSelfCert.mockRejectedValue(error);

    const results = await serverConfig.handler(mockGasket, mockServerConfig);

    expect(mockGasket.logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load override certs')
    );
    expect(results).toEqual(mockServerConfig);
  });
});
