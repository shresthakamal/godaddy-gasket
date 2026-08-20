import { vi } from 'vitest';
import { makeCheckAuth } from '../lib/check-auth.js';
import { AuthRealm } from '../lib/utils.js';

vi.mock('../lib/check-auth-validators');

const {
  validateIdp,
  validateJomax,
  validatePass,
  validateCert,
  validateAwsIam,
  validateOauth
} = await import('../lib/check-auth-validators.js');

validateIdp.mockResolvedValue({
  valid: true,
  realm: AuthRealm.idp
});

validateJomax.mockResolvedValue({
  valid: true,
  realm: AuthRealm.jomax
});

validatePass.mockResolvedValue({
  valid: true,
  realm: AuthRealm.pass
});

validateCert.mockResolvedValue({
  valid: true,
  realm: AuthRealm.cert
});

validateAwsIam.mockResolvedValue({
  valid: true,
  realm: AuthRealm.awsiam
});

validateOauth.mockResolvedValue({
  valid: true,
  realm: AuthRealm.oauth,
  details: {
    clientId: 'consumer-x',
    scopes: ['golf-next.translate']
  }
});


describe('makeCheckAuth', () => {
  it('is a function', () => {
    expect(makeCheckAuth).toBeInstanceOf(Function);
  });

  it('returns a function', () => {
    const checkAuth = makeCheckAuth();
    expect(checkAuth).toBeInstanceOf(Function);
  });

  describe('checkAuth', () => {
    let checkAuth, mockGasket, mockReq, mockVisitor;

    beforeEach(() => {
      mockVisitor = {
        hostname: 'local.gasket.dev-godaddy.com'
      };
      mockGasket = {
        logger: {
          warn: vi.fn()
        },
        exec: vi.fn(),
        config: {
          auth: {
            host: ['dev-godaddy.com', 'dev-secureserver.net'],
            realm: 'idp'
          }
        },
        actions: {
          getVisitor: vi.fn().mockResolvedValue(mockVisitor)
        }
      };
      mockReq = {
        headers: {},
        cookies: {
          auth_idp: '1234abcd'
        }
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns an object', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      expect(checkAuth).toBeInstanceOf(Function);
    });

    it('returns expected object', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth();
      expect(results).toEqual(expect.objectContaining({
        valid: expect.any(Boolean),
        realm: expect.any(String)
      }));
    });

    it('returns expected success object', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth();
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: 'idp'
      }));
    });

    it('accepts query object argument', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'jomax' });
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: 'jomax'
      }));
    });

    it('same query result for same requests', async () => {
      validateIdp.mockResolvedValueOnce({
        valid: true,
        realm: 'idp',
        details: {
          extra: true
        }
      });

      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results1 = await checkAuth();
      const results2 = await checkAuth();
      expect(validateIdp).toHaveBeenCalledTimes(1);
      const results3 = await checkAuth({ risk: 'medium' });
      expect(validateIdp).toHaveBeenCalledTimes(2);
      expect(results1).toBe(results2);
      expect(results1).not.toBe(results3);
    });

    it('unique query results for different requests', async () => {
      validateIdp.mockResolvedValueOnce({
        valid: true,
        realm: 'idp',
        details: {
          extra: true
        }
      });

      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results1 = await checkAuth();
      const results2 = await checkAuth();
      expect(validateIdp).toHaveBeenCalledTimes(1);

      const nextReq = {
        headers: { 'x-example': 'example' }
      };
      const checkAuth2 = await makeCheckAuth(mockGasket, nextReq);
      const results3 = await checkAuth2();
      expect(validateIdp).toHaveBeenCalledTimes(2);
      expect(results1).toBe(results2);
      expect(results1).not.toBe(results3);
    });

    it('handles idp realm', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'idp' });
      expect(validateIdp).toHaveBeenCalled();
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: AuthRealm.idp
      }));
    });

    it('handles jomax realm', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'jomax' });
      expect(validateJomax).toHaveBeenCalled();
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: AuthRealm.jomax
      }));
    });

    it('handles cert realm', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'cert' });
      expect(validateCert).toHaveBeenCalled();
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: AuthRealm.cert
      }));
    });

    it('handles pass realm', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'pass' });
      expect(validatePass).toHaveBeenCalled();
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: AuthRealm.pass
      }));
    });

    it('handles awsiam realm', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'awsiam' });
      expect(validateAwsIam).toHaveBeenCalled();
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: AuthRealm.awsiam
      }));
    });

    it('handles oauth realm', async () => {
      mockGasket.config.auth.appName = 'test-app';
      mockGasket.config.auth.oauth = {
        oauthIssuer: 'https://issuer.example.com',
        oauthAudience: 'test-audience'
      };
      mockReq.headers.authorization = 'Bearer test-token';
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'oauth' });
      expect(validateOauth).toHaveBeenCalled();
      expect(results).toEqual(expect.objectContaining({
        valid: true,
        realm: AuthRealm.oauth,
        details: {
          clientId: 'consumer-x',
          scopes: ['golf-next.translate']
        }
      }));
    });

    it('handles invalid realm with error', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth({ realm: 'bogus' });
      expect(results).toEqual(expect.objectContaining({
        valid: false,
        realm: 'bogus',
        reason: 'Invalid realm (bogus)'
      }));
    });

    it('handles invalid auth with error', async () => {
      validateIdp.mockRejectedValueOnce(new Error('Invalid auth example message'));
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      const results = await checkAuth();
      expect(results).toEqual(expect.objectContaining({
        valid: false,
        realm: 'idp',
        reason: 'Invalid auth example message'
      }));
    });

    it('executes authChecked lifecycle when valid', async () => {
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      await checkAuth();
      expect(mockGasket.exec).toHaveBeenCalledWith('authChecked', expect.objectContaining({
        success: true,
        realm: 'idp',
        message: 'IDP - Succeeded'
      }));
    });

    it('executes authChecked lifecycle when invalid', async () => {
      validateIdp.mockRejectedValueOnce(new Error('Invalid auth example message'));
      checkAuth = makeCheckAuth(mockGasket, mockReq);
      await checkAuth();
      expect(mockGasket.exec).toHaveBeenCalledWith('authChecked', expect.objectContaining({
        success: false,
        realm: 'idp',
        message: 'Invalid auth example message'
      }));
    });
  });
});
