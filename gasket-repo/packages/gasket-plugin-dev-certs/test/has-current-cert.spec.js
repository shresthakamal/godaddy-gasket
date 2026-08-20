import { vi } from 'vitest';

const mockParseStub = vi.fn().mockResolvedValue({
  notAfter: '2020,11,1'
});
const mockReadFileStub = vi.fn().mockResolvedValue({
  toString: vi.fn()
});

vi.mock('fs', () => ({
  promises: {
    readFile: mockReadFileStub
  }
}));
vi.mock('x509.js', () => ({
  default: {
    parseCert: mockParseStub
  }
}));

const hasCurrentCert = (await import('../lib/has-current-cert.js')).default;
const certPath = '/path/to/dir';
const mockCommonName = '*mockCommonName';

describe('hasCurrentCert', function () {

  it('returns true if cert is current', async function () {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2019, 11, 1));
    const result = await hasCurrentCert(certPath, mockCommonName);
    expect(result).toBeTruthy();
    vi.useRealTimers();
  });

  it('returns false if cert is not current', async function () {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2020, 11, 1));
    const result = await hasCurrentCert(certPath, mockCommonName);
    expect(result).toBeFalsy();
    vi.useRealTimers();
  });

  it('returns false if the cert cannot be parsed', async function () {
    mockParseStub.mockRejectedValueOnce(new Error('Invalid file'));

    const result = await hasCurrentCert(certPath, mockCommonName);

    expect(result).toBeFalsy();
  });
});
