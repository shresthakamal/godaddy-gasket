import { vi } from 'vitest';
import expressHandler from '../lib/express.js';
import { checkRouteAuth } from '../lib/sso-route-protection.js';

// Mock dependencies
vi.mock('../lib/sso-route-protection');

describe('express.js', () => {
  let mockGasket, mockApp, mockReq, mockRes, mockNext;

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
      use: vi.fn()
    };

    mockReq = {
      url: '/api-docs',
      headers: {
        host: 'test-app.dev-godaddy.com'
      }
    };

    mockRes = {
      writeHead: vi.fn(),
      end: vi.fn()
    };

    mockNext = vi.fn();

    checkRouteAuth.mockClear();
  });

  describe('expressHandler', () => {


    it('should set up route middleware when auth routes configured', () => {
      expressHandler(mockGasket, mockApp);

      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not set up route middleware when no auth routes', () => {
      delete mockGasket.config.auth.authRoutes;

      expressHandler(mockGasket, mockApp);

      expect(mockApp.use).not.toHaveBeenCalled();
    });

    it('should not set up route middleware when auth routes is empty', () => {
      mockGasket.config.auth.authRoutes = {};

      expressHandler(mockGasket, mockApp);

      expect(mockApp.use).not.toHaveBeenCalled();
    });
  });

  describe('route middleware behavior', () => {
    let routeMiddleware;

    beforeEach(() => {
      expressHandler(mockGasket, mockApp);
      // Get the middleware function that was passed to app.use
      routeMiddleware = mockApp.use.mock.calls[0][0];
    });

    it('should call checkRouteAuth with correct parameters', async () => {
      checkRouteAuth.mockResolvedValue(null);

      await routeMiddleware(mockReq, mockRes, mockNext);

      expect(checkRouteAuth).toHaveBeenCalledWith(
        mockGasket,
        mockReq
      );
    });

    it('should call next() when no SSO URL is returned', async () => {
      checkRouteAuth.mockResolvedValue(null);

      await routeMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.writeHead).not.toHaveBeenCalled();
      expect(mockRes.end).not.toHaveBeenCalled();
    });

    it('should redirect when SSO URL is returned', async () => {
      const ssoUrl = 'https://sso.dev-godaddy.com/?path=%2Fapi-docs&realm=jomax';
      checkRouteAuth.mockResolvedValue(ssoUrl);

      await routeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.writeHead).toHaveBeenCalledWith(302, { Location: ssoUrl });
      expect(mockRes.end).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should respond 401 when checkRouteAuth returns an unauthorized signal', async () => {
      checkRouteAuth.mockResolvedValue({ unauthorized: true });

      await routeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.writeHead).toHaveBeenCalledWith(401, { 'Content-Type': 'application/json' });
      expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify({ error: 'Unauthorized' }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle checkRouteAuth errors gracefully', async () => {
      const error = new Error('Auth check failed');
      checkRouteAuth.mockRejectedValue(error);

      await expect(routeMiddleware(mockReq, mockRes, mockNext)).rejects.toThrow(error);
    });
  });

  describe('setupRouteProtection', () => {
    it('should return null when auth config is missing', () => {
      delete mockGasket.config.auth;

      expressHandler(mockGasket, mockApp);

      expect(mockApp.use).not.toHaveBeenCalled();
    });

    it('should return null when auth routes is missing', () => {
      delete mockGasket.config.auth.authRoutes;

      expressHandler(mockGasket, mockApp);

      expect(mockApp.use).not.toHaveBeenCalled();
    });

    it('should return middleware function when auth routes is configured', () => {
      mockGasket.config.auth.authRoutes = { '/custom-route': { params: {} } };

      expressHandler(mockGasket, mockApp);

      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
