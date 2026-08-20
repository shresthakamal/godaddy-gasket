import { vi } from 'vitest';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

const mockFetchCertStub = vi.fn().mockResolvedValue();
const mockReadCertStub = vi.fn().mockResolvedValue();
const mockFetchDevCerts = vi.fn().mockResolvedValue();

vi.mock('../lib/fetch-dev-cert.js', () => ({ default: mockFetchCertStub }));
vi.mock('../lib/read-dev-cert.js', () => ({ default: mockReadCertStub }));
vi.mock('../lib/fetch-dev-certs.js', () => ({ default: mockFetchDevCerts }));

const actions = await import('../lib/actions.js');

describe('actions', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/path/to/root'
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns expected actions', () => {
    expect(actions).toHaveProperty('getDevCert', expect.any(Function));
  });

  describe('getDevCert', () => {
    let getDevCert, expectedAppPath, expectedPkgPath;

    beforeEach(() => {
      getDevCert = actions.getDevCert;
      expectedAppPath = '/path/to/root/.certs';
      expectedPkgPath = new URL('../certs', import.meta.url).pathname;
    });

    it('fetches dev cert', async () => {
      await getDevCert(mockGasket, 'example.com');
      expect(mockFetchCertStub).toHaveBeenCalledWith(expectedAppPath, 'example.com');
    });

    it('reads dev cert', async () => {
      await getDevCert(mockGasket, 'example.com');
      expect(mockReadCertStub).toHaveBeenCalledWith(expectedAppPath, 'example.com');
    });

    it('fetches to custom cert paths', async () => {
      mockGasket.config.devCerts = {
        path: '/custom/cert/path'
      };

      await getDevCert(mockGasket, 'example.com');
      const expectedPath = join(mockGasket.config.root, mockGasket.config.devCerts.path);
      expect(mockFetchCertStub).toHaveBeenCalledWith(expectedPath, 'example.com');
    });

    it('reads from custom cert paths', async () => {
      mockGasket.config.devCerts = {
        path: '/custom/cert/path'
      };

      await getDevCert(mockGasket, 'example.com');
      const expectedPath = join(mockGasket.config.root, mockGasket.config.devCerts.path);
      expect(mockReadCertStub).toHaveBeenCalledWith(expectedPath, 'example.com');
    });

    it('does not fetch packaged certs', async () => {
      await getDevCert(mockGasket, '*.gasket.dev-godaddy.com');
      expect(mockFetchCertStub).not.toHaveBeenCalled();
    });

    it('reads packaged certs', async () => {
      await getDevCert(mockGasket, '*.gasket.dev-godaddy.com');
      expect(mockReadCertStub).toHaveBeenCalledWith(expectedPkgPath, '*.gasket.dev-godaddy.com');
    });

    it('does not read packaged certs from custom path', async () => {
      mockGasket.config.devCerts = {
        path: '/custom/cert/path'
      };

      await getDevCert(mockGasket, '*.gasket.dev-godaddy.com');
      expect(mockReadCertStub).toHaveBeenCalledWith(expectedPkgPath, '*.gasket.dev-godaddy.com');
    });
  });

  describe('installDevCerts', () => {
    let installDevCerts, expectedAppPath;

    beforeEach(() => {
      expectedAppPath = '/path/to/root/.certs';
      mockGasket.config.devCerts = {
        commonNames: ['example.com']
      };

      installDevCerts = actions.installDevCerts;
    });

    it('fetches dev certs if configured', async () => {
      await installDevCerts(mockGasket);

      expect(mockFetchDevCerts).toHaveBeenCalledWith({
        dirPath: expectedAppPath,
        commonNames: ['example.com']
      });
    });

    it('does nothing if no dev certs configured', async () => {
      delete mockGasket.config.devCerts;

      await installDevCerts(mockGasket);

      expect(mockFetchDevCerts).not.toHaveBeenCalled();
    });

    it('installs to custom cert paths', async () => {
      mockGasket.config.devCerts.path = '/custom/cert/path';
      const expectedPath = join(mockGasket.config.root, mockGasket.config.devCerts.path);

      await installDevCerts(mockGasket);

      expect(mockFetchDevCerts).toHaveBeenCalledWith({
        dirPath: expectedPath,
        commonNames: ['example.com']
      });
    });

    it('waits for certificate downloads to complete', async () => {
      let hasCompleted = false;
      mockFetchDevCerts.mockImplementation(async () => {
        await setTimeout(10);
        hasCompleted = true;
      });

      await installDevCerts(mockGasket);

      expect(hasCompleted).toEqual(true);
    });
  });
});
