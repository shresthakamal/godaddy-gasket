import { vi } from 'vitest';

const mockWriteFileStub = vi.fn().mockResolvedValue();
const mockMkdirpStub = vi.fn();
const mockHasCurrentCertStub = vi.fn().mockResolvedValue(true);
const mockDownloadCertStub = vi.fn().mockResolvedValue();

vi.mock('fs', () => ({
  promises: {
    writeFile: mockWriteFileStub
  }
}));
vi.mock('mkdirp', () => ({ default: mockMkdirpStub }));
vi.mock('../lib/has-current-cert.js', () => ({ default: mockHasCurrentCertStub }));
vi.mock('../lib/download-cert.js', () => ({ default: mockDownloadCertStub }));

const fetchDevCerts = (await import('../lib/fetch-dev-certs.js')).default;
const dirPath = '/path/to/dir';

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('fetchDevCerts', function () {

  it('downloads certs by common names if not current', async function () {
    mockHasCurrentCertStub
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    await fetchDevCerts({ dirPath, commonNames: ['expired.example.com', 'exists.example.com'] });

    expect(mockDownloadCertStub).toHaveBeenCalledWith(dirPath, 'expired.example.com');
    expect(mockDownloadCertStub).not.toHaveBeenCalledWith(dirPath, 'exists.example.com');

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Downloaded expired.example.com'));
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });
});
