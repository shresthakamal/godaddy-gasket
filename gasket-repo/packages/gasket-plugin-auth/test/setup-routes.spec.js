import { vi } from 'vitest';
import setupRoutes from '../lib/setup-routes.js';

// Mock the endpoint module
vi.mock('../lib/endpoint');
const mockEndpoint = (await import('../lib/endpoint.js')).default;

describe('setup-routes.js', () => {
  let mockGasket, mockApp, mockEndpointHandler;

  beforeEach(() => {
    mockEndpointHandler = vi.fn();
    mockEndpoint.mockReturnValue(mockEndpointHandler);

    mockGasket = {
      config: {
        auth: {}
      }
    };

    mockApp = {
      get: vi.fn()
    };

    vi.clearAllMocks();
  });

  describe('setupRoutes', () => {
    it('should be a function', () => {
      expect(setupRoutes).toBeInstanceOf(Function);
    });

    it('should create the main validation endpoint', () => {
      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
      expect(mockEndpoint).toHaveBeenCalledWith(mockGasket);
    });

    it('should only create main endpoint when no basePath is configured', () => {
      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledTimes(1);
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
    });

    it('should create both main and basePath endpoints when basePath is configured', () => {
      mockGasket.config.auth.basePath = '/my-app';

      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledTimes(2);
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
      expect(mockApp.get).toHaveBeenCalledWith('/my-app/api/auth/validate', mockEndpointHandler);
      expect(mockEndpoint).toHaveBeenCalledWith(mockGasket);
    });

    it('should handle different basePath values', () => {
      mockGasket.config.auth.basePath = '/custom-base';

      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
      expect(mockApp.get).toHaveBeenCalledWith('/custom-base/api/auth/validate', mockEndpointHandler);
    });

    it('should handle basePath with trailing slash', () => {
      mockGasket.config.auth.basePath = '/my-app/';

      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
      expect(mockApp.get).toHaveBeenCalledWith('/my-app//api/auth/validate', mockEndpointHandler);
    });

    it('should work when auth config is undefined', () => {
      delete mockGasket.config.auth;

      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledTimes(1);
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
    });

    it('should work when config is undefined', () => {
      delete mockGasket.config;

      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledTimes(1);
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
    });

    it('should create separate endpoint handlers for both routes', () => {
      mockGasket.config.auth.basePath = '/test';

      setupRoutes(mockGasket, mockApp);

      const calls = mockApp.get.mock.calls;
      expect(calls[0][1]).toBe(mockEndpointHandler);
      expect(calls[1][1]).toBe(mockEndpointHandler);
      expect(mockEndpoint).toHaveBeenCalledTimes(2);
      expect(mockEndpoint).toHaveBeenNthCalledWith(1, mockGasket);
      expect(mockEndpoint).toHaveBeenNthCalledWith(2, mockGasket);
    });

    it('should handle empty basePath string', () => {
      mockGasket.config.auth.basePath = '';

      setupRoutes(mockGasket, mockApp);

      expect(mockApp.get).toHaveBeenCalledTimes(1);
      expect(mockApp.get).toHaveBeenCalledWith('/api/auth/validate', mockEndpointHandler);
    });

    it('should call endpoint factory with gasket instance', () => {
      setupRoutes(mockGasket, mockApp);

      expect(mockEndpoint).toHaveBeenCalledTimes(1);
      expect(mockEndpoint).toHaveBeenCalledWith(mockGasket);
    });

    it('should call endpoint factory twice when basePath is configured', () => {
      mockGasket.config.auth.basePath = '/test';

      setupRoutes(mockGasket, mockApp);

      expect(mockEndpoint).toHaveBeenCalledTimes(2);
      expect(mockEndpoint).toHaveBeenNthCalledWith(1, mockGasket);
      expect(mockEndpoint).toHaveBeenNthCalledWith(2, mockGasket);
    });
  });
});
