import { vi } from 'vitest';

const mockAuthorizedFetchStub = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({
    certificate: {
      commonName: 'mockCommonName'
    }
  })
});

vi.mock('../lib/authorized-fetch.js', () => ({
  authorizedFetch: mockAuthorizedFetchStub
}));

const getCloudCertForCommonName = (await import('../lib/get-cloud-cert-for-common-name.js')).default;

describe('getCloudCertForCommonName', function () {

  it('returns certs with found commonName', async function () {
    const result = await getCloudCertForCommonName('mockCommonName');

    expect(result.commonName).toEqual('mockCommonName');
  });

  it('throws on failed request', async function () {
    mockAuthorizedFetchStub.mockResolvedValue({
      ok: false,
      status: 422
    });
    await expect(async () => getCloudCertForCommonName('mockCommonName')).rejects.toThrow();
  });

  it('throws when the cert is not found', async function () {
    mockAuthorizedFetchStub.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        error: 404
      })
    });
    await expect(async () => getCloudCertForCommonName('mockCommonName')).rejects.toThrow();
  });
});
