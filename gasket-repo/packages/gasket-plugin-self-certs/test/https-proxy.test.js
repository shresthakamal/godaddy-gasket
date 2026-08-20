import { vi } from 'vitest';

import httpsProxy from '../lib/https-proxy.js';

const EXAMPLE_CERT = 'example-cert';
const EXAMPLE_KEY = 'example-key';
const EXAMPLE_COM = 'example.com';

describe('httpsProxy hook', function () {
  let mockGasket, mockHttpsProxyConfig;

  beforeEach(function () {
    mockHttpsProxyConfig = {
      protocol: 'https',
      port: 8443,
      xfwd: true,
      ws: true,
      target: {
        host: 'localhost',
        port: 3000
      }
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
      branch: vi.fn().mockReturnThis()
    };
  });

  it('has expected timing', function () {
    expect(httpsProxy).toHaveProperty(
      'timing',
      expect.objectContaining({
        after: ['@godaddy/gasket-plugin-dev-certs']
      })
    );
  });

  it('no effect when selfCert.https not enabled', async function () {
    delete mockGasket.config.selfCerts;
    const results = await httpsProxy.handler(mockGasket, mockHttpsProxyConfig);

    expect(mockGasket.actions.getSelfCert).not.toHaveBeenCalled();
    expect(results).toBe(mockHttpsProxyConfig);
  });

  it('no effect when selfCert.https does match hostname', async function () {
    mockHttpsProxyConfig.hostname = EXAMPLE_COM;
    const results = await httpsProxy.handler(mockGasket, mockHttpsProxyConfig);

    expect(mockGasket.actions.getSelfCert).not.toHaveBeenCalled();
    expect(results).toBe(mockHttpsProxyConfig);
  });

  it('sets the expected default self cert', async function () {
    const results = await httpsProxy.handler(mockGasket, mockHttpsProxyConfig);

    expect(mockGasket.actions.getSelfCert).toHaveBeenCalledWith('localhost');
    expect(results.ssl).toEqual(
      expect.objectContaining({
        cert: EXAMPLE_CERT,
        key: EXAMPLE_KEY
      })
    );
  });

  it('sets the expected custom self cert', async function () {
    mockGasket.config.selfCerts.https = EXAMPLE_COM;
    mockHttpsProxyConfig.hostname = EXAMPLE_COM;
    const results = await httpsProxy.handler(mockGasket, mockHttpsProxyConfig);

    expect(mockGasket.actions.getSelfCert).toHaveBeenCalledWith(EXAMPLE_COM);
    expect(results.ssl).toEqual(
      expect.objectContaining({
        cert: EXAMPLE_CERT,
        key: EXAMPLE_KEY
      })
    );
  });
});
