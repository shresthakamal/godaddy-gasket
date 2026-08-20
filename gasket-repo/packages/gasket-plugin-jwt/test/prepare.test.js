import { describe, it, expect, beforeAll, vi } from 'vitest';
import prepareHook from '../lib/prepare.js';

const mockCert = `-----BEGIN CERTIFICATE-----
randomGibberish
-----END CERTIFICATE-----`;

describe('configure', () => {
  let mockGasket;

  beforeAll(() => {
    mockGasket = { logger: {
      warn: vi.fn(),
      error: vi.fn()
    } };
  });


  it('logs error if ssoHost is missing', () => {
    const config = { jwt: { someKey: { key: mockCert, cert: mockCert } } };
    // @ts-expect-error - minimal mock for testing
    prepareHook(mockGasket, config);
    expect(mockGasket.logger.error).toHaveBeenCalledWith('Missing ssoHost for jwt.someKey');
  });

  it('returns config with jwt settings', () => {
    const config = { jwt: { someKey: { ssoHost: 'sso.dev-godaddy.com',  key: mockCert, cert: mockCert } } };
    // @ts-expect-error - minimal mock for testing
    const results = prepareHook(mockGasket, config);
    expect(results).toHaveProperty('jwt');
    expect(mockGasket.logger.warn).not.toHaveBeenCalled();
  });

  it('validates cert config and logs warning if key is a path', () => {
    const config = { jwt: { someKey: { ssoHost: 'sso.dev-godaddy.com', key: '/path/to/key', cert: './cert' } } };
    // @ts-expect-error - minimal mock for testing
    const results = prepareHook(mockGasket, config);
    expect(mockGasket.logger.warn).toHaveBeenCalledWith('jwt.someKey.key is a path. Configure jwt.someKey.keyFile instead.');
    // @ts-expect-error - custom config property
    expect(results.jwt.someKey).toHaveProperty('keyFile', '/path/to/key');
    // @ts-expect-error - custom config property
    expect(results.jwt.someKey).not.toHaveProperty('key');

    expect(mockGasket.logger.warn).toHaveBeenCalledWith('jwt.someKey.cert is a path. Configure jwt.someKey.certFile instead.');
    // @ts-expect-error - custom config property
    expect(results.jwt.someKey).toHaveProperty('certFile', './cert');
    // @ts-expect-error - custom config property
    expect(results.jwt.someKey).not.toHaveProperty('cert');
  });

  it('logs error if keyFile or certFile is missing', () => {
    const config = { jwt: { someKey: { ssoHost: 'sso.dev-godaddy.com', keyFile: 'someKeyFile' } } };
    // @ts-expect-error - minimal mock for testing
    prepareHook(mockGasket, config);
    expect(mockGasket.logger.error).toHaveBeenCalledWith('Missing keyFile or certFile for jwt.someKey');
  });

  it('logs error if key or cert is missing', () => {
    const config = { jwt: { someKey: { ssoHost: 'sso.dev-godaddy.com', key: 'someKey' } } };
    // @ts-expect-error - minimal mock for testing
    prepareHook(mockGasket, config);
    expect(mockGasket.logger.error).toHaveBeenCalledWith('Missing key or cert for jwt.someKey');
  });
});
