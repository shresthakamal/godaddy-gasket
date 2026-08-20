/* eslint-disable no-process-env */
import { vi } from 'vitest';

const mockJwt = 'mockJwt';
const mockURL = 'https://certificates.api.int.godaddy.com/v1/certificates?status=ISSUED&commonName=*.gasket.dev-godaddy.com';

const mockGetJomaxJwtWithOauth = vi.fn();
const mockNodeFetch = vi.fn();

vi.mock('@gd-internal/ssojwt', () => ({
  getJomaxJwtWithOauth: mockGetJomaxJwtWithOauth
}));

vi.mock('node-fetch', () => ({ default: mockNodeFetch }));

describe('authorizedFetch', function () {
  let originalEnv;
  let authorizedFetch;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
    vi.resetModules();
    mockGetJomaxJwtWithOauth.mockResolvedValue(mockJwt);
    mockNodeFetch.mockResolvedValue({ ok: true });
    authorizedFetch = await import('../lib/authorized-fetch.js?t=' + Date.now());
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getJwt', function () {
    it('returns CERT_API_TOKEN if set', async function () {
      process.env.CERT_API_TOKEN = 'token-from-env';

      const result = await authorizedFetch.getJwt();
      expect(result).toBe('token-from-env');
    });

    it('calls getJomaxJwtWithOauth when CERT_API_TOKEN is not set', async function () {
      delete process.env.CERT_API_TOKEN;
      delete process.env.CI;

      const result = await authorizedFetch.getJwt();
      expect(result).toEqual(mockJwt);
      expect(mockGetJomaxJwtWithOauth).toHaveBeenCalledWith({ env: 'prod' });
    });

    it('throws in CI if CERT_API_TOKEN is not set', async function () {
      delete process.env.CERT_API_TOKEN;
      process.env.CI = 'true';

      await expect(authorizedFetch.getJwt()).rejects.toThrow('CERT_API_TOKEN is required in CI');
    });
  });

  describe('authorizedFetch', function () {
    it('returns a mock authorized response', async function () {
      delete process.env.CERT_API_TOKEN;
      delete process.env.CI;

      const result = await authorizedFetch.authorizedFetch(mockURL);

      expect(mockGetJomaxJwtWithOauth).toHaveBeenCalled();
      expect(mockNodeFetch).toHaveBeenCalledWith(mockURL, expect.any(Object));
      expect(result).toEqual({ ok: true });
    });

    it('throws an error if a non-2xx response is received', async () => {
      mockNodeFetch.mockResolvedValueOnce({ ok: false, status: 403 });

      await expect(authorizedFetch.authorizedFetch(mockURL)).rejects.toThrow('Failed to fetch');
    });
  });
});
