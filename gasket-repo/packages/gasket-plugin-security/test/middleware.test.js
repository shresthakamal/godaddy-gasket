import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockHelmetInstance = vi.fn().mockImplementation((_req, _res, _next) => _next());
const mockHelmet = vi.fn().mockReturnValue(mockHelmetInstance);
const mockCsp = vi.fn().mockReturnValue({ 'default-src': "'self'" });

vi.mock('helmet', () => ({ default: mockHelmet }));
vi.mock('../lib/get-content-security-policy.js', () => ({ default: mockCsp }));

const plugin = await import('../lib/middleware.js').then(m => m.default);

describe('middleware', function () {
  let gasket, req, res, next, mockCspHeader;

  beforeEach(function () {
    mockCspHeader = "default-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
      "script-src 'self' *.dev-godaddy.com *.dev-secureserver.net;";

    gasket = {
      command: {
        id: 'start'
      },
      actions: {
        insertCspHash: vi.fn(),
        addCspNonce: vi.fn(),
        addCspHash: vi.fn()
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn()
      },
      config: {
        helmet: {
          contentSecurityPolicy: {
            enabled: true
          }
        }
      },
      execWaterfall: vi.fn().mockImplementation((_, helmetConfig) => helmetConfig)
    };

    req = {
      hostname: 'example.test-godaddy.com'
    };
    res = {
      getHeader: vi.fn().mockImplementation(() => mockCspHeader),
      setHeader: vi.fn().mockImplementation((name, value) => { mockCspHeader = value; })
    };
    next = vi.fn();
  });

  afterEach(function () {
    vi.clearAllMocks();
  });

  it('runs after UXP plugin', function () {
    expect(plugin.timing.after).toEqual(['@godaddy/uxp']);
  });

  it('returns middleware that wraps helmet', function () {
    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    expect(typeof layer).toBe('function');
    // @ts-expect-error - accessing function name property
    expect(layer.name).toEqual('helmetWrapper');
  });

  it('does not return middleware if helmet=false', function () {
    gasket.config.helmet = false;
    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    expect(layer).toBeUndefined();
  });

  it('passes through to helmet middleware', async function () {
    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    // @ts-expect-error - minimal mock for testing
    await layer(req, res, next);
    expect(mockHelmet).toHaveBeenCalled();
    expect(mockHelmetInstance).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('passes helmet config to lifecycle', async function () {
    gasket.config.helmet = {
      frameguard: {
        action: 'deny'
      }
    };

    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    // @ts-expect-error - minimal mock for testing
    await layer(req, res, next);
    expect(gasket.execWaterfall).toHaveBeenCalledWith(
      'helmet',
      expect.objectContaining(gasket.config.helmet),
      expect.any(Object)
    );
  });

  it('configures helmet with gasket.config and lifecycle results', async function () {
    gasket.config.helmet = {
      contentSecurityPolicy: false,
      frameguard: {
        action: 'deny'
      }
    };

    gasket.execWaterfall.mockImplementationOnce((_, helmetConfig) => ({
      ...helmetConfig,
      referrerPolicy: { policy: 'no-referrer' }
    }));

    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    // @ts-expect-error - minimal mock for testing
    await layer(req, res, next);

    expect(mockHelmet).toHaveBeenCalledWith({
      ...gasket.config.helmet,
      referrerPolicy: { policy: 'no-referrer' }
    });
  });

  it('does not add contentSecurityPolicy by default', async function () {
    delete gasket.config.helmet.contentSecurityPolicy;
    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    // @ts-expect-error - minimal mock for testing
    await layer(req, res, next);

    expect(mockCsp).not.toHaveBeenCalled();
    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: false
    });
  });

  it('uses default directives when enabled is true', async function () {
    gasket.config.helmet = {
      contentSecurityPolicy: {
        enabled: true
      }
    };

    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    // @ts-expect-error - minimal mock for testing
    await layer(req, res, next);

    expect(mockCsp).toHaveBeenCalled();
    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: { 'default-src': "'self'" }
      }
    });
  });

  it('uses configured contentSecurityPolicy when enabled is not true', async function () {
    gasket.config.helmet = {
      contentSecurityPolicy: {
        directives: {
          'default-src': '\'https\''
        }
      }
    };

    // @ts-expect-error - minimal mock for testing
    const layer = plugin.handler(gasket);
    // @ts-expect-error - minimal mock for testing
    await layer(req, res, next);

    expect(mockCsp).not.toHaveBeenCalled();
    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: { 'default-src': '\'https\'' }
      }
    });
  });

  describe('addCspHash', function () {
    // helper to init and return the addCspHash method from res
    const getMethod = async () => {
      // @ts-expect-error - minimal mock for testing
      await plugin.handler(gasket)(req, res, next);
      return res.addCspHash;
    };

    it('attached to res if content-security-policy configured', async function () {
      await getMethod();
      expect(res).toHaveProperty('addCspHash');
    });

    it('not attached if content-security-policy disabled', async function () {
      gasket.config.helmet = {
        contentSecurityPolicy: false
      };
      await getMethod();

      expect(res).not.toHaveProperty('addCspHash');
    });

    it('updates response header with hash', async function () {
      const addCspHash = await getMethod();
      addCspHash('script-src', 'bogus content');
      expect(gasket.actions.addCspHash).toHaveBeenCalledWith(res, 'script-src', 'bogus content');
    });
  });

  describe('insertCspHash', function () {
    // helper to init and return the insertCspHash method from res
    const getMethod = async () => {
      // @ts-expect-error - minimal mock for testing
      await plugin.handler(gasket)(req, res, next);
      return res.insertCspHash;
    };

    it('attached to res if content-security-policy configured', async function () {
      await getMethod();
      expect(res).toHaveProperty('insertCspHash');
    });

    it('not attached if content-security-policy disabled', async function () {
      gasket.config.helmet = {
        contentSecurityPolicy: false
      };
      await getMethod();

      expect(res).not.toHaveProperty('insertCspHash');
    });

    it('updates response header with hash', async function () {
      const insertCspHash = await getMethod();
      insertCspHash('script-src', "'sha256-mockShaValue'");
      expect(gasket.actions.insertCspHash).toHaveBeenCalledWith(res, 'script-src', "'sha256-mockShaValue'");
    });
  });

  describe('addCspNonce', function () {
    // helper to init and return the addCspNonce method from res
    const getMethod = async () => {
      // @ts-expect-error - minimal mock for testing
      await plugin.handler(gasket)(req, res, next);
      return res.addCspNonce;
    };

    it('attached to res if content-security-policy configured', async function () {
      await getMethod();
      expect(res).toHaveProperty('addCspNonce');
    });

    it('not attached if content-security-policy disabled', async function () {
      gasket.config.helmet = {
        contentSecurityPolicy: false
      };
      await getMethod();

      expect(res).not.toHaveProperty('addCspNonce');
    });

    it('updates response header with hash', async function () {
      const addCspNonce = await getMethod();
      addCspNonce('script-src');
      expect(gasket.actions.addCspNonce).toHaveBeenCalledWith(res, 'script-src');
    });
  });
});
