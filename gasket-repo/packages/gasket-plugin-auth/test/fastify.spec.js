import { vi } from 'vitest';
import fastifyHandler from '../lib/fastify.js';
import { checkRouteAuth } from '../lib/sso-route-protection.js';

// Mock dependencies
vi.mock('../lib/sso-route-protection');

describe('fastify.js', () => {
  let mockGasket, mockApp, mockRequest, mockReply;

  beforeEach(() => {
    mockGasket = {
      config: {
        auth: {
          authRoutes: {
            '/api-docs': {
              params: { realm: 'jomax' }
            }
          }
        }
      }
    };

    mockApp = {
      get: vi.fn(),
      addHook: vi.fn()
    };

    mockRequest = {
      url: '/api-docs',
      headers: {
        host: 'test-app.dev-godaddy.com'
      }
    };

    mockReply = {
      redirect: vi.fn(),
      code: vi.fn().mockReturnThis(),
      send: vi.fn()
    };

    checkRouteAuth.mockClear();
  });

  describe('fastifyHandler', () => {


    it('should set up route preHandler when auth routes configured', () => {
      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.addHook).toHaveBeenCalledWith('preHandler', expect.any(Function));
    });

    it('should not set up route preHandler when no auth routes', () => {
      delete mockGasket.config.auth.authRoutes;

      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.addHook).not.toHaveBeenCalled();
    });

    it('should not set up route preHandler when auth routes is empty', () => {
      mockGasket.config.auth.authRoutes = {};

      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.addHook).not.toHaveBeenCalled();
    });
  });

  describe('route preHandler behavior', () => {
    let routePreHandler;

    beforeEach(() => {
      fastifyHandler(mockGasket, mockApp);
      // Get the preHandler function that was passed to addHook
      routePreHandler = mockApp.addHook.mock.calls[0][1];
    });

    it('should call checkRouteAuth with correct parameters', async () => {
      checkRouteAuth.mockResolvedValue(null);

      await routePreHandler(mockRequest, mockReply);

      expect(checkRouteAuth).toHaveBeenCalledWith(
        mockGasket,
        mockRequest
      );
    });

    it('should not redirect when no SSO URL is returned', async () => {
      checkRouteAuth.mockResolvedValue(null);

      const result = await routePreHandler(mockRequest, mockReply);

      expect(mockReply.redirect).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should redirect when SSO URL is returned', async () => {
      const ssoUrl = 'https://sso.dev-godaddy.com/?path=%2Fapi-docs&realm=jomax';
      checkRouteAuth.mockResolvedValue(ssoUrl);

      const result = await routePreHandler(mockRequest, mockReply);

      expect(mockReply.redirect).toHaveBeenCalledWith(302, ssoUrl);
      expect(result).toBeUndefined();
    });

    it('should respond 401 when checkRouteAuth returns an unauthorized signal', async () => {
      checkRouteAuth.mockResolvedValue({ unauthorized: true });

      const result = await routePreHandler(mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockReply.redirect).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle checkRouteAuth errors gracefully', async () => {
      const error = new Error('Auth check failed');
      checkRouteAuth.mockRejectedValue(error);

      await expect(routePreHandler(mockRequest, mockReply)).rejects.toThrow(error);
    });

    it('should work with different request URLs', async () => {
      mockRequest.url = '/different-route';
      checkRouteAuth.mockResolvedValue(null);

      await routePreHandler(mockRequest, mockReply);

      expect(checkRouteAuth).toHaveBeenCalledWith(
        mockGasket,
        expect.objectContaining({
          headers: mockRequest.headers
        })
      );
    });
  });

  describe('setupRouteProtection', () => {
    it('should return null when auth config is missing', () => {
      delete mockGasket.config.auth;

      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.addHook).not.toHaveBeenCalled();
    });

    it('should return null when auth routes is missing', () => {
      delete mockGasket.config.auth.authRoutes;

      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.addHook).not.toHaveBeenCalled();
    });

    it('should return preHandler function when auth routes is configured', () => {
      mockGasket.config.auth.authRoutes = { '/custom-route': { params: {} } };

      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.addHook).toHaveBeenCalledWith('preHandler', expect.any(Function));
    });
  });

  describe('edge cases', () => {


    it('should handle redirect errors in preHandler', async () => {
      const ssoUrl = 'https://sso.dev-godaddy.com/?path=%2Fapi-docs&realm=jomax';
      checkRouteAuth.mockResolvedValue(ssoUrl);
      mockReply.redirect.mockImplementation(() => {
        throw new Error('Redirect failed');
      });

      fastifyHandler(mockGasket, mockApp);
      const routePreHandler = mockApp.addHook.mock.calls[0][1];

      await expect(routePreHandler(mockRequest, mockReply)).rejects.toThrow('Redirect failed');
    });
  });

  describe('integration scenarios', () => {


    it('should work when both auth routes and auth are configured', () => {
      mockGasket.config.auth.basePath = '/my-app';
      mockGasket.config.auth.authRoutes = { '/docs': { params: {} } };

      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/my-app/api/auth/validate', expect.any(Function));
      expect(mockApp.addHook).toHaveBeenCalledTimes(1);
    });

    it('should work when only auth is configured', () => {
      delete mockGasket.config.auth.authRoutes;

      fastifyHandler(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', expect.any(Function));
      expect(mockApp.addHook).not.toHaveBeenCalled();
    });
  });
});
