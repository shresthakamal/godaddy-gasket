import { vi } from 'vitest';

const mockAuthorizedFetchStub = vi.fn().mockResolvedValue({
  headers: {
    get: vi.fn()
  },
  text: vi.fn().mockResolvedValue('mockPem')
});
const mockParseDispositionStub = vi.fn().mockReturnValue({
  filename: 'mockFileName'
});

vi.mock('../lib/authorized-fetch.js', () => ({
  authorizedFetch: mockAuthorizedFetchStub
}));

vi.mock('../lib/parse-disposition.js', () => ({ default: mockParseDispositionStub }));

const downloadCertFile = (await import('../lib/download-cert-file.js')).default;
const mockCloudCert = {
  id: 'mockId'
};

describe('downloadCertFile', function () {

  it('returns pem and filename', async function () {
    const result = await downloadCertFile(mockCloudCert, 'type');

    expect(result.pem).toEqual('mockPem');
    expect(result.filename).toEqual('mockFileName');
  });

  it('changes endpoint for fetch called based on type', async function () {
    const crtType = 'crt';

    await downloadCertFile(mockCloudCert, crtType);

    expect(mockAuthorizedFetchStub).toHaveBeenCalledWith(
      `https://certificates.api.int.gdcorp.tools/v1/certificates/${mockCloudCert.id}.${crtType}`
    );
  });
});
