import { vi } from 'vitest';

vi.mock('gd-auth', () => {
  const MockGdAuth = vi.fn().mockImplementation(() => ({
    authenticate: vi.fn().mockResolvedValue({ auth: 'basic' })
  }));
  MockGdAuth.risk = { low: 1, medium: 2, high: 3 };
  return { GdAuth: MockGdAuth };
});

vi.mock('../lib/auth-lib-wrapper.js', () => ({
  GdAuthWrapper: vi.fn().mockImplementation(() => ({
    authenticate: vi.fn().mockResolvedValue({ auth: 'basic' })
  }))
}));

import {
  fixupAuthOptions,
  fixupValidateOptions,
  getAppName,
  logAuthChecked,
  getToken,
  fetchJomaxGroups,
  validateGroups,
  performAuthenticate
} from '../lib/check-auth-helpers.js';

describe('fixupAuthOptions', () => {
  let authConfig;

  beforeEach(() => {
    authConfig = {
      realm: 'idp',
      risk: 'low'
    };
  });

  it('returns defaults', () => {
    const results = fixupAuthOptions();
    expect(results).toEqual({
      realm: 'idp',
      type: ['basic', 'e2s', 'e2s2s', 's2s'],
      risk: 'low',
      allowHeartbeat: false,
      use12HourExpiration: true
    });
  });

  it('returns defaults with empty options', () => {
    const options = {};

    const results = fixupAuthOptions(options, authConfig);
    expect(results).toEqual({
      realm: 'idp',
      type: ['basic', 'e2s', 'e2s2s', 's2s'],
      risk: 'low',
      allowHeartbeat: false,
      use12HourExpiration: true
    });
  });

  it('defaults to authConfig values', () => {
    const options = {};

    authConfig.realm = 'config-realm';
    authConfig.risk = 'config-risk';
    authConfig.groups = ['config-groups'];
    authConfig.certs = ['config-certs'];
    authConfig.roles = ['config-roles'];

    const results = fixupAuthOptions(options, authConfig);
    expect(results).toEqual(expect.objectContaining({
      realm: 'config-realm',
      risk: 'config-risk',
      groups: ['config-groups'],
      certs: ['config-certs']
    }));
  });

  it('unmodified if no changes needed', () => {
    const options = {
      realm: 'idp',
      type: ['e2s'],
      risk: 'high',
      allowHeartbeat: true,
      use12HourExpiration: true,
      groups: ['group1'],
      certs: ['cert1'],
      roles: ['role1']
    };

    const results = fixupAuthOptions(options, authConfig);
    expect(results).toEqual(options);
  });

  it('ensures arrays', () => {
    const options = {
      type: 'e2s',
      groups: 'group1',
      certs: 'cert1',
      roles: 'role1'
    };

    const results = fixupAuthOptions(options, authConfig);
    expect(results).toEqual(expect.objectContaining({
      type: ['e2s'],
      groups: ['group1'],
      certs: ['cert1'],
      roles: ['role1'],
      use12HourExpiration: true
    }));
  });
});

describe('fixupValidateOptions', () => {
  let options, authConfig, appName, visitor;

  beforeEach(() => {
    authConfig = {
      realm: 'idp',
      risk: 'low',
      host: ['dev-godaddy.com']
    };
    options = {
      realm: 'idp',
      type: ['basic', 'e2s', 'e2s2s', 's2s'],
      risk: 'low'
    };
    appName = 'my-app';
    visitor = { hostname: 'my-app.dev-godaddy.com' };
  });

  it('returns expected', () => {
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      type: 'idp',
      host: 'sso.dev-godaddy.com',
      app: appName,
      auths: ['basic', 'e2s', 'e2s2s', 's2s'],
      verify: 1
    }));
  });

  it('has single host corresponding to visitor hostname', () => {
    authConfig.host = ['dev-godaddy.com', 'dev-secureserver.net', 'dev-123-reg.co.uk'];
    visitor.hostname = 'my-app.dev-123-reg.co.uk';
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      host: 'sso.dev-123-reg.co.uk'
    }));
  });

  it('use first host if no corresponding visitor hostname', () => {
    authConfig.host = ['dev-godaddy.com', 'dev-secureserver.net'];
    visitor.hostname = 'my-app.dev-somesite.com';
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      host: 'sso.dev-godaddy.com'
    }));
  });

  it('use first host if no visitor hostname', () => {
    authConfig.host = ['dev-godaddy.com', 'dev-secureserver.net'];
    delete visitor.hostname;
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      host: 'sso.dev-godaddy.com'
    }));
  });

  it('includes visitor plid', () => {
    visitor.plid = 123456;
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      plid: 123456
    }));
  });

  it('includes allowHeartbeat', () => {
    options.allowHeartbeat = true;
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      allowHeartbeat: true
    }));
  });

  it('includes use12HourExpiration', () => {
    options.use12HourExpiration = true;
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      use12HourExpiration: true
    }));
  });

  it('adds fetchKey for apiProxy', () => {
    authConfig.apiProxy = 'apiProxy';
    const results = fixupValidateOptions(options, authConfig, appName, visitor);
    expect(results).toEqual(expect.objectContaining({
      fetchKey: expect.any(Function)
    }));
  });
});

describe('fixupValidateOptions oauth', () => {
  it('passes issuer and audience through for the oauth realm', () => {
    const authOptions = { realm: 'oauth', type: ['basic'], risk: 'low' };
    const authConfig = {
      host: ['godaddy.com'],
      oauth: { oauthIssuer: 'https://sso.gdcorp.tools', oauthAudience: 'golf-next' }
    };
    const out = fixupValidateOptions(authOptions, authConfig, 'api.golfnext', { hostname: 'godaddy.com' });
    expect(out.realm).toBe('oauth');
    expect(out.oauthIssuer).toBe('https://sso.gdcorp.tools');
    expect(out.oauthAudience).toBe('golf-next');
  });

  it('forces the FFI path for the oauth realm even when the app did not enable it', () => {
    const out = fixupValidateOptions(
      { realm: 'oauth', type: ['basic'], risk: 'low' },
      { host: ['godaddy.com'], oauth: { oauthAudience: 'golf-next' } }, // no useFFILibrary
      'api.golfnext',
      { hostname: 'godaddy.com' }
    );
    expect(out.useFFILibrary).toBe(true);
  });

  it('leaves useFFILibrary untouched for non-oauth realms', () => {
    const out = fixupValidateOptions(
      { realm: 'jomax', type: ['basic'], risk: 'low' },
      { host: ['godaddy.com'] }, // no useFFILibrary → false
      'api.golfnext',
      { hostname: 'godaddy.com' }
    );
    expect(out.useFFILibrary).toBe(false);
  });

  it('does not include oauthIssuer/oauthAudience for non-oauth realms', () => {
    const out = fixupValidateOptions(
      { realm: 'jomax', type: ['basic'], risk: 'low' },
      { host: ['godaddy.com'], oauth: { oauthIssuer: 'https://sso.gdcorp.tools', oauthAudience: 'golf-next' } },
      'api.golfnext',
      { hostname: 'godaddy.com' }
    );
    expect(out).not.toHaveProperty('oauthIssuer');
    expect(out).not.toHaveProperty('oauthAudience');
  });

  it('includes oauthIssuer/oauthAudience for the oauth realm', () => {
    const out = fixupValidateOptions(
      { realm: 'oauth', type: ['basic'], risk: 'low' },
      { host: ['godaddy.com'], oauth: { oauthIssuer: 'https://sso.gdcorp.tools', oauthAudience: 'golf-next' } },
      'api.golfnext',
      { hostname: 'godaddy.com' }
    );
    expect(out).toHaveProperty('oauthIssuer', 'https://sso.gdcorp.tools');
    expect(out).toHaveProperty('oauthAudience', 'golf-next');
  });
});

describe('getAppName', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        auth: {
          appName: 'myapp',
          host: ['dev-godaddy.com']
        }
      },
      logger: {
        warn: vi.fn()
      }
    };
  });

  it('returns configured app name', () => {
    const results = getAppName(mockGasket, 'myapp.test-godaddy.com');
    expect(results).toEqual('myapp');
  });

  it('returns local.gasket if in hostname', () => {
    const results = getAppName(mockGasket, 'local.gasket.dev-godaddy.com');
    expect(results).toEqual('local.gasket');
  });

  it('throws if appName not configured', () => {
    delete mockGasket.config.auth.appName;
    expect(() => getAppName(mockGasket, 'myapp.test-godaddy.com')).toThrow(/appName not configured/);
  });

  it('warns if appName not configured with local.gasket', () => {
    delete mockGasket.config.auth.appName;
    expect(() => getAppName(mockGasket, 'local.gasket.dev-godaddy.com')).not.toThrow();
    expect(mockGasket.logger.warn).toHaveBeenCalledWith(expect.stringContaining('appName not configured'));
  });

  it('does not throw if hostname is missing', () => {
    // eslint-disable-next-line no-undefined
    expect(() => getAppName(mockGasket, undefined)).not.toThrow();
  });
});

describe('getToken', () => {
  it('returns token from authorization header', () => {
    const req = {
      headers: { authorization: 'sso-jwt my-token-123' },
      cookies: {}
    };
    expect(getToken('idp', req)).toBe('my-token-123');
  });

  it('returns token from x-authorization header', () => {
    const req = {
      headers: { 'x-authorization': 'idp-jwt header-token' },
      cookies: {}
    };
    expect(getToken('idp', req)).toBe('header-token');
  });

  it('returns token from cookies when header missing', () => {
    const req = {
      headers: {},
      cookies: { auth_idp: 'cookie-token' }
    };
    expect(getToken('idp', req)).toBe('cookie-token');
  });

  it('throws when no token found', () => {
    const req = { headers: {}, cookies: {} };
    expect(() => getToken('idp', req)).toThrow('Missing token in header or cookie');
  });

  it('returns undefined for non-matching realm in header', () => {
    const req = {
      headers: { authorization: 'jomax-jwt token-xyz' },
      cookies: {}
    };
    expect(() => getToken('idp', req)).toThrow('Missing token');
  });

  it('handles malformed authorization header', () => {
    const req = {
      headers: { authorization: 'not-a-valid-format' },
      cookies: {}
    };
    expect(() => getToken('idp', req)).toThrow('Missing token');
  });
});

describe('fetchJomaxGroups', () => {
  it('returns groups on successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { groups: ['admin', 'eng'] } })
    });

    const req = {
      headers: { authorization: 'sso-jwt my-token' },
      cookies: {}
    };
    const options = { host: 'sso.test.com', type: 'idp' };
    const result = await fetchJomaxGroups(options, req);
    expect(result).toEqual(['admin', 'eng']);
  });

  it('returns empty array when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = {
      headers: { authorization: 'sso-jwt my-token' },
      cookies: {}
    };
    const options = { host: 'sso.test.com', type: 'idp' };
    const result = await fetchJomaxGroups(options, req);
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('returns empty array when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const req = {
      headers: { authorization: 'sso-jwt my-token' },
      cookies: {}
    };
    const options = { host: 'sso.test.com', type: 'idp' };
    const result = await fetchJomaxGroups(options, req);
    expect(result).toEqual([]);
  });

  it('returns empty array when host is missing', async () => {
    const req = {
      headers: { authorization: 'sso-jwt my-token' },
      cookies: {}
    };
    const options = { host: null, type: 'idp' };
    const result = await fetchJomaxGroups(options, req);
    expect(result).toEqual([]);
  });
});

describe('validateGroups', () => {
  it('does not throw when expected group is present', () => {
    expect(() => validateGroups(['admin'], ['Admin', 'Eng'])).not.toThrow();
  });

  it('throws when expected group is not present', () => {
    expect(() => validateGroups(['admin'], ['eng', 'ops'])).toThrow('Unauthorized groups');
  });

  it('is case insensitive', () => {
    expect(() => validateGroups(['ADMIN'], ['admin'])).not.toThrow();
  });

  it('passes when any expected group matches', () => {
    expect(() => validateGroups(['admin', 'superuser'], ['eng', 'superuser'])).not.toThrow();
  });
});

describe('performAuthenticate', () => {
  let mockAuthenticate;

  beforeEach(async () => {
    mockAuthenticate = vi.fn();
    const { GdAuth } = await import('gd-auth');
    GdAuth.mockImplementation(() => ({
      authenticate: mockAuthenticate
    }));
  });

  it('wraps ENOTFOUND with readable error', async () => {
    mockAuthenticate.mockRejectedValue(
      Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' })
    );

    const req = {
      headers: { authorization: 'sso-jwt test-token' },
      cookies: {}
    };
    const options = {
      type: 'sso',
      host: 'sso.bad-host.com',
      useFFILibrary: false,
      _unique1: true
    };

    await expect(performAuthenticate(options, req, {}))
      .rejects.toThrow('Unable to reach sso.bad-host.com');
  });

  it('rethrows non-ENOTFOUND errors', async () => {
    mockAuthenticate.mockRejectedValue(new Error('auth failed'));

    const req = {
      headers: { authorization: 'sso-jwt test-token' },
      cookies: {}
    };
    const options = {
      type: 'sso',
      host: 'sso.test.com',
      useFFILibrary: false,
      _unique2: true
    };

    await expect(performAuthenticate(options, req, {}))
      .rejects.toThrow('auth failed');
  });
});

describe('getToken oauth Bearer', () => {
  it('extracts a Bearer token for the oauth realm', () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' } };
    expect(getToken('oauth', req)).toBe('abc.def.ghi');
  });
  it('does not treat Bearer as valid for the jomax realm', () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' } };
    expect(() => getToken('jomax', req)).toThrow(/Missing token/);
  });
});

describe('logAuthChecked', () => {
  let mockGasket, req, results, authOptions;

  beforeEach(() => {
    mockGasket = {
      exec: vi.fn()
    };
    req = {
      headers: {
        'user-agent': 'my-user-agent'
      }
    };
    authOptions = {
      realm: 'idp'
    };
  });

  it('logs success', async () => {
    results = {
      valid: true
    };
    await logAuthChecked(mockGasket, req, results, authOptions);
    expect(mockGasket.exec).toHaveBeenCalledWith('authChecked', {
      success: true,
      realm: 'idp',
      req,
      message: 'IDP - Succeeded'
    });
  });

  it('logs failure', async () => {
    results = {
      valid: false,
      reason: 'Test failure'
    };
    await logAuthChecked(mockGasket, req, results, authOptions);
    expect(mockGasket.exec).toHaveBeenCalledWith('authChecked', {
      success: false,
      realm: 'idp',
      req,
      message: 'Test failure'
    });
  });
});

