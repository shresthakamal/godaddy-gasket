import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GdAuthWrapper, getFfiConstants } from '../lib/auth-lib-wrapper.js';
import { fixupValidateOptions, getAuthInstance } from '../lib/check-auth-helpers.js';

// Mock the FFI library
vi.mock('@godaddy/gd-auth-lib', () => ({
  GdAuth: vi.fn().mockImplementation(() => ({
    setAppConfig: vi.fn(),
    parseToken: vi.fn().mockReturnValue({ payload: { sub: 'test' } }),
    verifyTokenAuth: vi.fn().mockReturnValue(true),
    getPayload: vi.fn().mockReturnValue({ sub: 'test' }),
    isShopper: vi.fn().mockReturnValue(true),
    getShopperId: vi.fn().mockReturnValue('shopper-123'),
    getCustomerId: vi.fn().mockReturnValue('customer-123')
  })),
  SecurityLevel: { LOW: 1, MEDIUM: 2, HIGH: 3 },
  AuthType: { IDP: 'idp' },
  Auths: { BASIC: 'basic' },
  OAuthIssuer: {
    Dev: 'https://oauth.api.dev-godaddy.com',
    DevPrivate: 'https://oauth.api.private.dev-godaddy.com',
    Test: 'https://oauth.api.test-godaddy.com',
    Ote: 'https://oauth.api.ote-godaddy.com',
    Prod: 'https://oauth.api.godaddy.com'
  }
}));

// Mock the legacy library
vi.mock('gd-auth', () => {
  const MockGdAuth = vi.fn().mockImplementation(() => ({
    authenticate: vi.fn().mockResolvedValue({
      auth: 'basic',
      getShopperPayload: () => ({ shopperId: 'shopper-123' })
    })
  }));
  MockGdAuth.risk = { low: 1, medium: 2, high: 3 };
  return { GdAuth: MockGdAuth };
});

describe('FFI Library Integration Tests', () => {
  describe('GdAuthWrapper', () => {
    it('should use FFI library when enabled', () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });
      expect(wrapper.useFFI).toBe(true);
    });

    it('should use legacy library when disabled', () => {
      const wrapper = new GdAuthWrapper({ useFFILibrary: false, app: 'test' });
      expect(wrapper.useFFI).toBe(false);
    });

    it('should authenticate with FFI library using nested godaddySso options', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });
      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result).toBeDefined();

      // Verify parseToken was called with nested structure
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;
      expect(mockInstance.parseToken).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({
          godaddySso: expect.objectContaining({
            host: 'sso.test.com',
            securityLevel: expect.any(Number),
            auths: expect.any(Array),
            authType: expect.any(String),
            allowHeartbeat: false,
            filterByAuthType: true
          })
        })
      );
    });

    it('should authenticate with legacy library', async () => {
      const wrapper = new GdAuthWrapper({ useFFILibrary: false, app: 'test' });
      const result = await wrapper.authenticate('sso.test.com', 'token', 1);
      expect(result).toBeDefined();
    });

    it('should throw error when pcpId is missing in production', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        env: 'production'
      });

      await expect(async () => {
        await wrapper.authenticate('sso.test.com', 'token', 'low');
      }).rejects.toThrow('FFI Library: pcpId is required when useFFILibrary is enabled');
    });

    it('should warn when pcpId is missing in development', async () => {
      const mockLogger = { warn: vi.fn() };
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        env: 'development',
        logger: mockLogger
      });

      expect(wrapper.useFFI).toBe(true);

      // Trigger FFI initialization by calling authenticate
      await wrapper.authenticate('sso.test.com', 'token', 'low');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('pcpId not configured')
      );
    });
  });

  describe('fixupValidateOptions with FFI', () => {
    it('should handle FFI library flag', () => {
      const authOptions = { realm: 'idp', type: ['basic'], risk: 'low' };
      const authConfig = { host: ['test.com'], useFFILibrary: true };
      const app = 'test-app';
      const visitor = { hostname: 'test.com', plid: 123 };

      const result = fixupValidateOptions(authOptions, authConfig, app, visitor);

      expect(result.useFFILibrary).toBe(true);
      expect(result.verify).toBe('low'); // FFI uses string risk
    });

    it('should handle legacy library', () => {
      const authOptions = { realm: 'idp', type: ['basic'], risk: 'low' };
      const authConfig = { host: ['test.com'], useFFILibrary: false };
      const app = 'test-app';
      const visitor = { hostname: 'test.com', plid: 123 };

      const result = fixupValidateOptions(authOptions, authConfig, app, visitor);

      expect(result.useFFILibrary).toBe(false);
      expect(result.verify).toBe(1); // Legacy uses numeric risk
    });
  });

  describe('getAuthInstance', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should forward pcpId and client from gasket config to FFI wrapper', () => {
      const gasket = {
        config: {
          env: 'development',
          auth: {
            pcpId: '6409',
            client: 'auth-ui',
            host: ['dev-godaddy.com'],
            useFFILibrary: true
          }
        },
        logger: { warn: vi.fn() }
      };

      const options = {
        useFFILibrary: true,
        app: 'auth-ui',
        host: 'sso.dev-godaddy.com',
        auths: ['basic'],
        type: 'idp',
        verify: 'low'
      };

      const instance = getAuthInstance(options, gasket);
      expect(instance.options.pcpId).toBe('6409');
      expect(instance.options.client).toBe('auth-ui');
    });

    it('should not throw when gasket config lacks pcpId in development', () => {
      const gasket = {
        config: {
          env: 'development',
          auth: {
            host: ['dev-godaddy.com'],
            useFFILibrary: true
          }
        },
        logger: { warn: vi.fn() }
      };

      const options = {
        useFFILibrary: true,
        app: 'test-app',
        host: 'sso.dev-godaddy.com'
      };

      const instance = getAuthInstance(options, gasket);
      expect(instance.options.pcpId).toBeUndefined();
    });
  });

  describe('Static properties', () => {
    it('should expose risk levels for compatibility', () => {
      expect(GdAuthWrapper.risk).toEqual({
        none: 0,
        low: 1,
        medium: 2,
        high: 3
      });
    });
  });

  describe('useNewExpiration configuration', () => {
    it('should pass useNewExpiration: true to legacy library when explicitly enabled', () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: false,
        app: 'test',
        useNewExpiration: true
      });

      // Verify the wrapper is using legacy library
      expect(wrapper.useFFI).toBe(false);
      expect(wrapper.initialized).toBe(true);
      expect(wrapper.authInstance).toBeDefined();
    });

    it('should pass useNewExpiration: false to legacy library when explicitly disabled', () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: false,
        app: 'test',
        useNewExpiration: false
      });

      // Verify the wrapper is using legacy library
      expect(wrapper.useFFI).toBe(false);
      expect(wrapper.initialized).toBe(true);
      expect(wrapper.authInstance).toBeDefined();
    });

    it('should default useNewExpiration to true when not specified', () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: false,
        app: 'test'
      });

      // Verify the wrapper is using legacy library with default behavior
      expect(wrapper.useFFI).toBe(false);
      expect(wrapper.initialized).toBe(true);
      expect(wrapper.authInstance).toBeDefined();
    });
  });

  describe('API v0.11.3+ nested options structure', () => {
    it('should use securityLevel instead of riskLevel in godaddySso options', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development',
        auths: ['basic'],
        type: 'idp'
      });

      await wrapper.authenticate('sso.test.com', 'token', 'medium');

      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;

      expect(mockInstance.parseToken).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({
          godaddySso: expect.objectContaining({
            securityLevel: expect.any(Number)
          })
        })
      );

      // Should NOT have riskLevel at top level
      const call = mockInstance.parseToken.mock.calls[mockInstance.parseToken.mock.calls.length - 1];
      expect(call[1]).not.toHaveProperty('riskLevel');
      expect(call[1]).not.toHaveProperty('host');
      expect(call[1]).not.toHaveProperty('auths');
    });

    it('should omit oauth key to disable OAuth validation', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      await wrapper.authenticate('sso.test.com', 'token', 'low');

      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;
      const call = mockInstance.parseToken.mock.calls[mockInstance.parseToken.mock.calls.length - 1];

      // Should have godaddySso but NOT oauth
      expect(call[1]).toHaveProperty('godaddySso');
      expect(call[1]).not.toHaveProperty('oauth');
    });

    it('should access nested auths from godaddySso for verifyTokenAuth', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development',
        auths: ['s2s']
      });

      await wrapper.authenticate('sso.test.com', 'token', 'low');

      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;

      // verifyTokenAuth should be called with auths from godaddySso
      expect(mockInstance.verifyTokenAuth).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['s2s'])
      );
    });

    it('should handle SecurityLevel.NONE (0) correctly with nullish coalescing', async () => {
      const { SecurityLevel: LoadedSecurityLevel } = await import('@godaddy/gd-auth-lib');
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      // Pass 0 (NONE) explicitly - should NOT default to LOW
      await wrapper.authenticate('sso.test.com', 'token', 0);

      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;
      const call = mockInstance.parseToken.mock.calls[mockInstance.parseToken.mock.calls.length - 1];

      // Should be 0 (NONE), not 1 (LOW)
      expect(call[1].godaddySso.securityLevel).toBe(0);
      expect(call[1].godaddySso.securityLevel).not.toBe(LoadedSecurityLevel.LOW);
    });
  });

  describe('authenticate result payload', () => {
    it('should return result with payload helper methods', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result.getShopperPayload).toBeInstanceOf(Function);
      expect(result.getJomaxPayload).toBeInstanceOf(Function);
      expect(result.getPassPayload).toBeInstanceOf(Function);
      expect(result.getCertPayload).toBeInstanceOf(Function);
      expect(result.getAwsIamPayload).toBeInstanceOf(Function);
    });

    it('should return shopper fields when isShopper is true', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result.shopper_id).toBe('shopper-123');
      expect(result.customer_id).toBe('customer-123');
      expect(result.username).toBeUndefined();
    });

    it('should return employee fields when isShopper is false', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: { sub: 'emp' } }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({ sub: 'emp' }),
        isShopper: vi.fn().mockReturnValue(false),
        getUsername: vi.fn().mockReturnValue('jdoe'),
        getCommonName: vi.fn().mockReturnValue('John Doe'),
        getShopperId: vi.fn().mockReturnValue(null),
        getCustomerId: vi.fn().mockReturnValue(null)
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result.username).toBe('jdoe');
      expect(result.common_name).toBe('John Doe');
      expect(result.shopper_id).toBeUndefined();
    });

    it('should throw when verifyTokenAuth fails', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: {} }),
        verifyTokenAuth: vi.fn().mockReturnValue(false),
        getPayload: vi.fn().mockReturnValue({})
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      await expect(wrapper.authenticate('sso.test.com', 'token', 'low'))
        .rejects.toThrow('Token authentication failed');
    });

    it('should invoke getShopperPayload with correct fields', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: { sub: 'test' } }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({ plid: 1, cid: 'c1', plt: 2 }),
        isShopper: vi.fn().mockReturnValue(true),
        getShopperId: vi.fn().mockReturnValue('s1'),
        getCustomerId: vi.fn().mockReturnValue('c1')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      const shopperPayload = result.getShopperPayload();
      expect(shopperPayload).toEqual({ plid: 1, cid: 'c1', shopperId: 's1', plt: 2 });
    });

    it('should invoke getJomaxPayload', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: {} }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({}),
        isShopper: vi.fn().mockReturnValue(false),
        getAccountName: vi.fn().mockReturnValue('admin-acct'),
        getUsername: vi.fn().mockReturnValue('admin'),
        getCommonName: vi.fn().mockReturnValue('Admin')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result.getJomaxPayload()).toEqual({ accountName: 'admin-acct' });
    });

    it('should invoke getPassPayload', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: {} }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({}),
        isShopper: vi.fn().mockReturnValue(false),
        getPassId: vi.fn().mockReturnValue('pass-abc'),
        getUsername: vi.fn().mockReturnValue('u'),
        getCommonName: vi.fn().mockReturnValue('cn')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result.getPassPayload()).toEqual({ passId: 'pass-abc' });
    });

    it('should invoke getCertPayload', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: {} }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({}),
        isShopper: vi.fn().mockReturnValue(false),
        getCommonName: vi.fn().mockReturnValue('cert-cn'),
        getUsername: vi.fn().mockReturnValue('u')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result.getCertPayload()).toEqual({ cn: 'cert-cn' });
    });

    it('should invoke getAwsIamPayload', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: {} }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({}),
        isShopper: vi.fn().mockReturnValue(false),
        getAwsIamArn: vi.fn().mockReturnValue('arn:aws:iam::123:role/test'),
        getUsername: vi.fn().mockReturnValue('u'),
        getCommonName: vi.fn().mockReturnValue('cn')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      const result = await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(result.getAwsIamPayload()).toEqual({ sub: 'arn:aws:iam::123:role/test' });
    });
  });

  describe('isShopper / isJomax / getEmployeeGroups', () => {
    it('should delegate isShopper to FFI authInstance', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: { sub: 'test' } }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({ sub: 'test' }),
        isShopper: vi.fn().mockReturnValue(true),
        getShopperId: vi.fn().mockReturnValue('s1'),
        getCustomerId: vi.fn().mockReturnValue('c1')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      await wrapper.authenticate('sso.test.com', 'token', 'low');
      const result = wrapper.isShopper({ tokenClaims: { sub: 'test' } });
      expect(result).toBe(true);
    });

    it('should return false from isShopper without tokenClaims', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(wrapper.isShopper({})).toBe(false);
    });

    it('should return false from isShopper when not using FFI', () => {
      const wrapper = new GdAuthWrapper({ useFFILibrary: false, app: 'test' });
      expect(wrapper.isShopper({ tokenClaims: {} })).toBe(false);
    });

    it('should delegate isJomax to FFI authInstance', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: {} }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({}),
        isShopper: vi.fn().mockReturnValue(false),
        isJomax: vi.fn().mockReturnValue(true),
        getUsername: vi.fn().mockReturnValue('u'),
        getCommonName: vi.fn().mockReturnValue('cn')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(wrapper.isJomax({ tokenClaims: { sub: 'emp' } })).toBe(true);
    });

    it('should return false from isJomax without tokenClaims', async () => {
      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(wrapper.isJomax({})).toBe(false);
    });

    it('should return false from isJomax when not using FFI', () => {
      const wrapper = new GdAuthWrapper({ useFFILibrary: false, app: 'test' });
      expect(wrapper.isJomax({ tokenClaims: {} })).toBe(false);
    });

    it('should delegate getEmployeeGroups to FFI authInstance', async () => {
      const { GdAuth } = await import('@godaddy/gd-auth-lib');
      GdAuth.mockImplementation(() => ({
        setAppConfig: vi.fn(),
        parseToken: vi.fn().mockReturnValue({ payload: {} }),
        verifyTokenAuth: vi.fn().mockReturnValue(true),
        getPayload: vi.fn().mockReturnValue({}),
        isShopper: vi.fn().mockReturnValue(false),
        getEmployeeGroups: vi.fn().mockReturnValue(['admin', 'eng']),
        getUsername: vi.fn().mockReturnValue('u'),
        getCommonName: vi.fn().mockReturnValue('cn')
      }));

      const wrapper = new GdAuthWrapper({
        useFFILibrary: true,
        app: 'test',
        pcpId: '12345',
        env: 'development'
      });

      await wrapper.authenticate('sso.test.com', 'token', 'low');
      expect(wrapper.getEmployeeGroups({ tokenClaims: {} }, 'test.com')).toEqual(['admin', 'eng']);
    });

    it('should return empty array from getEmployeeGroups when not using FFI', () => {
      const wrapper = new GdAuthWrapper({ useFFILibrary: false, app: 'test' });
      expect(wrapper.getEmployeeGroups({ tokenClaims: {} }, 'test.com')).toEqual([]);
    });
  });

  describe('getFfiConstants', () => {
    it('should return SecurityLevel, AuthType, and Auths', async () => {
      const constants = await getFfiConstants();
      expect(constants.SecurityLevel).toEqual({ LOW: 1, MEDIUM: 2, HIGH: 3 });
      expect(constants.AuthType).toEqual({ IDP: 'idp' });
      expect(constants.Auths).toEqual({ BASIC: 'basic' });
    });

    it('should cache constants on second call', async () => {
      const first = await getFfiConstants();
      const second = await getFfiConstants();
      expect(first).toBe(second);
    });
  });
});
