import { vi } from 'vitest';
import plugin, { AuthRealm, AuthRisk, AuthIdp } from '../lib/index.js';
import pkg from '../package.json' with { type: 'json' };

describe('Plugin', () => {
  let mockGasket;

  beforeAll(() => {
    mockGasket = { config: { auth: {} } };
  });

  it('has expected devDependencies', () => {
    expect(pkg).toHaveProperty('devDependencies');
    expect(pkg.devDependencies).toHaveProperty('@godaddy/gasket-auth');
  });

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', pkg.name);
    expect(plugin).toHaveProperty('dependencies', ['@godaddy/gasket-plugin-visitor']);
    expect(plugin).toHaveProperty('version', pkg.version);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'webpackConfig',
      'configure',
      'gasketData',
      'express',
      'fastify',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('named exports', () => {
    it('exports AuthRealm, AuthRisk, AuthIdp as named exports', () => {
      expect(AuthRealm).toBeDefined();
      expect(AuthRisk).toBeDefined();
      expect(AuthIdp).toBeDefined();
    });

    it('named exports match plugin properties', () => {
      expect(AuthRealm).toBe(plugin.AuthRealm);
      expect(AuthRisk).toBe(plugin.AuthRisk);
      expect(AuthIdp).toBe(plugin.AuthIdp);
    });

    it('AuthIdp has expected values', () => {
      expect(AuthIdp).toEqual({
        basic: 'basic',
        e2s: 'e2s',
        s2s: 's2s',
        s2snpr: 's2snpr',
        s2p: 's2p',
        e2s2s: 'e2s2s',
        e2s2p: 'e2s2p',
        e2p: 'e2p',
        cert2s: 'cert2s'
      });
    });
  });

  describe('express', () => {
    it('sets app get endpoint', () => {
      const mockApp = {
        get: vi.fn(),
        use: vi.fn()
      };
      plugin.hooks.express(mockGasket, mockApp);
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
    });

    it('also sets endpoint with basePath if set', () => {
      const mockApp = {
        get: vi.fn(),
        use: vi.fn()
      };
      mockGasket.config.auth.basePath = '/my-app';
      plugin.hooks.express(mockGasket, mockApp);
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/my-app/api/auth/validate', expect.any(Function));
    });

    it('sets up route protection middleware when auth routes is configured', () => {
      const mockApp = {
        get: vi.fn(),
        use: vi.fn()
      };
      mockGasket.config.auth.authRoutes = { '/api-docs': { params: {} } };
      plugin.hooks.express(mockGasket, mockApp);
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
    });

    it('does not set up route middleware when auth routes is not configured', () => {
      const mockApp = {
        get: vi.fn(),
        use: vi.fn()
      };
      delete mockGasket.config.auth.authRoutes;
      plugin.hooks.express(mockGasket, mockApp);
      expect(mockApp.use).not.toHaveBeenCalled();
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
    });
  });

  describe('fastify', () => {
    it('sets app get endpoint', () => {
      const mockFastify = {
        get: vi.fn(),
        addHook: vi.fn()
      };
      plugin.hooks.fastify(mockGasket, mockFastify);
      expect(mockFastify.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
    });

    it('also sets endpoint with basePath if set', () => {
      const mockFastify = {
        get: vi.fn(),
        addHook: vi.fn()
      };
      mockGasket.config.auth.basePath = '/my-app';
      plugin.hooks.fastify(mockGasket, mockFastify);
      expect(mockFastify.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
      expect(mockFastify.get).toHaveBeenCalledWith('/my-app/api/auth/validate', expect.any(Function));
    });

    it('sets up route protection preHandler when auth routes is configured', () => {
      const mockFastify = {
        get: vi.fn(),
        addHook: vi.fn()
      };
      mockGasket.config.auth.authRoutes = { '/api-docs': { params: {} } };
      plugin.hooks.fastify(mockGasket, mockFastify);
      expect(mockFastify.addHook).toHaveBeenCalledWith('preHandler', expect.any(Function));
      expect(mockFastify.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
    });

    it('does not set up route preHandler when auth routes is not configured', () => {
      const mockFastify = {
        get: vi.fn(),
        addHook: vi.fn()
      };
      delete mockGasket.config.auth.authRoutes;
      plugin.hooks.fastify(mockGasket, mockFastify);
      expect(mockFastify.addHook).not.toHaveBeenCalled();
      expect(mockFastify.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
    });
  });
});
