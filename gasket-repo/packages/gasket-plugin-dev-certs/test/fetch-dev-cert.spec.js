import { vi } from 'vitest';

const mockMkdirpStub = vi.fn();
const mockHasCurrentCertStub = vi.fn().mockResolvedValue(true);
const mockDownloadCertStub = vi.fn().mockResolvedValue();
vi.mock('mkdirp', () => ({ default: mockMkdirpStub }));
vi.mock('../lib/has-current-cert.js', () => ({ default: mockHasCurrentCertStub }));
vi.mock('../lib/download-cert.js', () => ({ default: mockDownloadCertStub }));

const fetchDevCert = (await import('../lib/fetch-dev-cert.js')).default;
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('fetchDevCert', () => {

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('downloads certs by common name if not current', async function () {
    mockHasCurrentCertStub
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await fetchDevCert('/path/to/dir', 'expired.com');
    await fetchDevCert('/path/to/dir', 'exists.com');

    expect(mockDownloadCertStub).toHaveBeenCalledWith('/path/to/dir', 'expired.com');
    expect(mockDownloadCertStub).toHaveBeenCalledTimes(1);
    expect(mockDownloadCertStub).not.toHaveBeenCalledWith(expect.any(String), 'exists.com');
  });

  it('console logs when downloading cert', async function () {
    mockHasCurrentCertStub
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await fetchDevCert('/path/to/dir', 'expired.com');
    await fetchDevCert('/path/to/dir', 'exists.com');

    expect(consoleLogSpy).toHaveBeenCalledWith('Downloaded expired.com');
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('exists.com'));
  });
});
