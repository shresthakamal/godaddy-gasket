import { vi } from 'vitest';

const mockWriteFileStub = vi.fn().mockResolvedValue();
const mockDownloadCertFileStub = vi.fn().mockResolvedValue({
  pem: 'mockPem',
  filename: 'mockFileName'
});
const mockGetCloudCertStub = vi.fn().mockResolvedValue({
  id: 'mockId'
});

vi.mock('fs', () => ({
  promises: {
    writeFile: mockWriteFileStub
  }
}));

vi.mock('../lib/download-cert-file.js', () => ({ default: mockDownloadCertFileStub }));
vi.mock('../lib/get-cloud-cert-for-common-name.js', () => ({ default: mockGetCloudCertStub }));

const downloadCert = (await import('../lib/download-cert.js')).default;
const mockCloudCert = { id: 'mockId' };
const mockDirectory = '/path/to/dir';
const mockCertFile = {
  pem: 'mockPem',
  filename: 'mockFileName'
};

describe('downloadCert', function () {

  it('throws an error if the cert is not found', async () => {
    mockGetCloudCertStub.mockResolvedValueOnce(null);

    await expect(downloadCert(mockDirectory, 'mockCommonName')).rejects.toThrow();
  });

  it('writes crt file in expected path', async function () {
    const { pem, filename } = mockCertFile;

    await downloadCert(mockDirectory, 'mockCommonName');

    expect(mockDownloadCertFileStub).toHaveBeenCalledWith(mockCloudCert, 'crt');
    expect(mockWriteFileStub).toHaveBeenCalledWith(`${mockDirectory}/${filename}`, pem);
  });

  it('writes chain file in expected path', async function () {
    const { pem, filename } = mockCertFile;

    await downloadCert(mockDirectory, 'mockCommonName');

    expect(mockDownloadCertFileStub).toHaveBeenCalledWith(mockCloudCert, 'chain');
    expect(mockWriteFileStub).toHaveBeenCalledWith(`${mockDirectory}/${filename}`, pem);
  });

  it('writes key file in expected path', async function () {
    const { pem, filename } = mockCertFile;

    await downloadCert(mockDirectory, 'mockCommonName');

    expect(mockDownloadCertFileStub).toHaveBeenCalledWith(mockCloudCert, 'key');
    expect(mockWriteFileStub).toHaveBeenCalledWith(`${mockDirectory}/${filename}`, pem);
  });
});
