import { vi } from 'vitest';

const createCertificate = vi.fn().mockResolvedValue({
  cert: 'cert',
  key: 'key'
});

vi.mock('@godaddy/quickcert', function () {
  return { createCertificate };
});

const { getSelfCert } = await import('../lib/actions.js');

describe('getSelfCert', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      logger: {
        info: vi.fn()
      }
    };
  });

  afterEach(function () {
    vi.resetAllMocks();
  });

  it('should generate new cert', async function () {
    const results = await getSelfCert(mockGasket, 'example1');

    expect(createCertificate).toHaveBeenCalledWith({ commonName: 'example1' });
    expect(results).toEqual({ cert: 'cert', key: 'key' });
  });

  it('should retrieve already generated cert', async function () {
    const results = await getSelfCert(mockGasket, 'example2');

    expect(createCertificate).toHaveBeenCalledWith({ commonName: 'example2' });
    const result2 = await getSelfCert(mockGasket, 'example2');

    expect(createCertificate).toHaveBeenCalledTimes(1);

    expect(results).toBe(result2);
  });

  it('logs timing', async function () {
    await getSelfCert(mockGasket, 'example3');
    expect(mockGasket.logger.info).toHaveBeenCalledWith(
      expect.stringMatching(/Generated self-signed certificate in \d+ms\./)
    );
  });
});
