import { vi } from 'vitest';
import { getBaseDomain, checkRouteAuth } from '../lib/sso-route-protection.js';
import { makeGasketRequest } from '@gasket/request';

vi.mock('@gasket/request');
vi.mock('../lib/check-auth-helpers');

const { fixupAuthOptions, getAppName } = await import('../lib/check-auth-helpers.js');

describe('sso-route-protection', () => {
  describe('getBaseDomain', () => {
    it('returns godaddy.com for empty hostname', () => {
      expect(getBaseDomain('')).toBe('godaddy.com');
      expect(getBaseDomain(null)).toBe('godaddy.com');
      expect(getBaseDomain(void 0)).toBe('godaddy.com');
    });

    it('removes port from hostname', () => {
      expect(getBaseDomain('example.com:3000')).toBe('example.com');
    });

    it('handles single part domains', () => {
      expect(getBaseDomain('localhost')).toBe('localhost');
    });

    it('handles two part domains', () => {
      expect(getBaseDomain('example.com')).toBe('example.com');
    });

    it('handles multi-level TLDs', () => {
      expect(getBaseDomain('subdomain.example.co.uk')).toBe('example.co.uk');
      expect(getBaseDomain('www.example.com.au')).toBe('example.com.au');
    });

    it('handles regular TLDs with subdomains', () => {
      expect(getBaseDomain('www.example.com')).toBe('example.com');
      expect(getBaseDomain('api.staging.example.com')).toBe('example.com');
    });
  });

  describe('checkRouteAuth', () => {
    let mockGasket;
    let mockReq;
    let mockGasketReq;
    let mockCheckAuth;
    let mockVisitor;

    beforeEach(() => {
      mockVisitor = {
        hostname: 'example.com'
      };

      mockCheckAuth = vi.fn();

      mockGasket = {
        config: {
          auth: {
            authRoutes: {
              '/protected': {
                params: { realm: 'idp', risk: 'low' }
              }
            }
          }
        },
        actions: {
          getVisitor: vi.fn().mockResolvedValue(mockVisitor),
          getCheckAuth: vi.fn().mockResolvedValue(mockCheckAuth)
        },
        logger: {
          debug: vi.fn()
        }
      };

      mockReq = {
        path: '/protected',
        query: {},
        headers: {}
      };

      mockGasketReq = {
        path: '/protected',
        query: {},
        headers: {}
      };

      makeGasketRequest.mockResolvedValue(mockGasketReq);
      fixupAuthOptions.mockReturnValue({ realm: 'idp', risk: 'low' });
      getAppName.mockReturnValue('test-app');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns null when authRoutes is not configured', async () => {
      mockGasket.config.auth = {};
      const result = await checkRouteAuth(mockGasket, mockReq);
      expect(result).toBeNull();
    });

    it('returns null when route does not match', async () => {
      mockGasketReq.path = '/unprotected';
      const result = await checkRouteAuth(mockGasket, mockReq);
      expect(result).toBeNull();
    });

    it('returns null when auth is valid', async () => {
      mockCheckAuth.mockResolvedValue({ valid: true });
      const result = await checkRouteAuth(mockGasket, mockReq);
      expect(result).toBeNull();
    });

    it('returns SSO URL when auth is invalid', async () => {
      mockCheckAuth.mockResolvedValue({ valid: false, authReason: 'expired' });
      const result = await checkRouteAuth(mockGasket, mockReq);

      expect(result).toContain('https://sso.example.com/');
      expect(result).toContain('app=test-app');
      expect(result).toContain('realm=idp');
      expect(result).toContain('path=%2Fprotected');
      expect(result).toContain('risk=low');
      expect(result).toContain('auth_reason=expired');
    });

    it('logs debug information during auth check', async () => {
      mockCheckAuth.mockResolvedValue({ valid: false });
      await checkRouteAuth(mockGasket, mockReq);

      expect(mockGasket.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Redirecting to SSO: https://sso.example.com/?app=test-app&realm=idp&path=%2Fprotected&risk=low')
      );
    });

    it('returns an unauthorized signal instead of an SSO redirect for a failed oauth realm', async () => {
      fixupAuthOptions.mockReturnValue({ realm: 'oauth' });
      mockCheckAuth.mockResolvedValue({ valid: false, authReason: 'invalid_token' });

      const result = await checkRouteAuth(mockGasket, mockReq);

      expect(result).toEqual({ unauthorized: true });
      // No SSO redirect should be built for a machine-to-machine client.
      expect(getAppName).not.toHaveBeenCalled();
    });

    it('returns null when oauth realm auth is valid', async () => {
      fixupAuthOptions.mockReturnValue({ realm: 'oauth' });
      mockCheckAuth.mockResolvedValue({ valid: true });

      const result = await checkRouteAuth(mockGasket, mockReq);

      expect(result).toBeNull();
    });

    it('includes query parameters in redirect path', async () => {
      mockCheckAuth.mockResolvedValue({ valid: false });
      mockGasketReq.query = { foo: 'bar', baz: 'qux' };

      const result = await checkRouteAuth(mockGasket, mockReq);

      expect(result).toContain('path=%2Fprotected%3Ffoo%3Dbar%26baz%3Dqux');
    });

    it('skips null and undefined query parameter values', async () => {
      mockCheckAuth.mockResolvedValue({ valid: false });
      mockGasketReq.query = {
        validParam: 'value',
        nullParam: null,
        undefinedParam: undefined, // eslint-disable-line no-undefined
        emptyString: '',
        zero: 0
      };

      const result = await checkRouteAuth(mockGasket, mockReq);

      // Query params are encoded in the path parameter
      // Should include valid params, empty string, and zero (falsy but not null/undefined)
      expect(result).toContain('validParam%3Dvalue');
      expect(result).toContain('emptyString%3D');
      expect(result).toContain('zero%3D0');

      // Should NOT include null or undefined
      expect(result).not.toContain('nullParam');
      expect(result).not.toContain('undefinedParam');
    });

    it('handles array query parameter values', async () => {
      mockCheckAuth.mockResolvedValue({ valid: false });
      mockGasketReq.query = { tags: ['tag1', 'tag2', 'tag3'] };

      const result = await checkRouteAuth(mockGasket, mockReq);

      expect(result).toContain('path=%2Fprotected');
      expect(result).toContain('tags%3Dtag1');
      expect(result).toContain('tags%3Dtag2');
      expect(result).toContain('tags%3Dtag3');
    });

    it('includes port in SSO URL when present', async () => {
      mockCheckAuth.mockResolvedValue({ valid: false });
      mockGasketReq.headers = { host: 'example.com:3000' };

      const result = await checkRouteAuth(mockGasket, mockReq);

      expect(result).toContain('port=3000');
    });

    it('handles paths with query params correctly', async () => {
      mockCheckAuth.mockResolvedValue({ valid: false });
      mockGasketReq.path = '/protected';
      mockGasketReq.query = { redirect: '/dashboard' };

      const result = await checkRouteAuth(mockGasket, mockReq);

      expect(result).toContain('path=%2Fprotected%3Fredirect%3D%252Fdashboard');
    });
  });
});
