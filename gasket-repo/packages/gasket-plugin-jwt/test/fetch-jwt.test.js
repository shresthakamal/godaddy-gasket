/* eslint-disable no-undefined */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockCert = `-----BEGIN CERTIFICATE-----
randomGibberish
-----END CERTIFICATE-----`;

const mockToken = 'some-token';

const readCert = 'readCert';
const devCert = 'devCert';
const iamJwt = 'iamJwt';

vi.mock('fs', () => ({
  promises: { readFile: vi.fn().mockResolvedValue(readCert) }
}));

vi.mock('gd-auth-client', () => ({
  getTokenFromCertificate: vi.fn().mockImplementation(() => {
    return Promise.resolve(mockToken);
  }),
  IamTokenClient: vi.fn().mockImplementation(() => ({ getToken: vi.fn().mockResolvedValue(iamJwt) }))
}));

const { promises: fs } = await import('fs');
const { getTokenFromCertificate, IamTokenClient } = await import('gd-auth-client');
const fetchJwt = (await import('../lib/fetch-jwt.js')).default;

describe('fetchJwt', () => {
  let mockGasket;
  beforeEach(() => {
    mockGasket = {
      actions: {
        getDevCert: vi.fn().mockResolvedValue({ cert: devCert, key: devCert })
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch JWT from certificate file', async () => {
    const config = {
      certFile: 'certs/mock-cert.crt',
      keyFile: 'certs/mock-key.key',
      ssoHost: 'sso.godaddy.com'
    };

    const result = await fetchJwt(mockGasket, config);

    expect(result).toEqual(mockToken);
    expect(fs.readFile).toHaveBeenCalledWith('certs/mock-cert.crt', 'utf8');
    expect(fs.readFile).toHaveBeenCalledWith('certs/mock-key.key', 'utf8');
    expect(getTokenFromCertificate).toHaveBeenCalledWith(config.ssoHost, readCert, readCert, undefined);
  });

  it('should fetch JWT from certificate', async () => {
    const config = {
      cert: mockCert,
      key: mockCert,
      ssoHost: 'sso.godaddy.com'
    };

    const result = await fetchJwt(mockGasket, config);

    expect(result).toEqual(mockToken);
    expect(fs.readFile).not.toHaveBeenCalled();
    expect(getTokenFromCertificate).toHaveBeenCalledWith(config.ssoHost, mockCert, mockCert, undefined);
  });

  it('should fetch JWT from dev cert', async () => {
    const config = {
      devCert: 'devCert',
      ssoHost: 'sso.godaddy.com'
    };

    const result = await fetchJwt(mockGasket, config);

    expect(result).toEqual(mockToken);
    expect(mockGasket.actions.getDevCert).toHaveBeenCalledWith(config.devCert);
    expect(getTokenFromCertificate).toHaveBeenCalledWith(config.ssoHost, devCert, devCert, undefined);
  });

  it('should fetch JWT from AWS IAM', async () => {
    const config = {
      ssoHost: 'sso.godaddy.com',
      options: { primaryRegion: 'us-west-2', secondaryRegion: 'us-west-2' }
    };

    const result = await fetchJwt(mockGasket, config);

    expect(result).toBe(iamJwt);
    expect(IamTokenClient).toHaveBeenCalledWith(config.ssoHost, config.options);
  });
});
