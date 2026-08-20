import { describe, it, expect, vi } from 'vitest';
import { GdAuthWrapper } from '../lib/auth-lib-wrapper.js';

// Mock the FFI library the same way test/ffi-integration.spec.js does: the
// real @godaddy/gd-auth-lib package isn't installed in this workspace (native
// FFI addon), so authenticate()'s unconditional loadFFILibrary() dynamic
// import must resolve to a mock rather than hit the filesystem.
vi.mock('@godaddy/gd-auth-lib', () => ({
  GdAuth: vi.fn().mockImplementation(() => ({
    setAppConfig: vi.fn(),
    parseToken: vi.fn().mockReturnValue({ token_type: 'o_auth' }),
    isOauth: vi.fn().mockReturnValue(true),
    getClaim: vi.fn((claims, key) => (key === 'client_id' ? 'consumer-x' : 'golf-next.translate')),
    verifyTokenAuth: vi.fn().mockReturnValue(true),
    getPayload: vi.fn().mockReturnValue({ sub: 'consumer-x' })
  })),
  SecurityLevel: { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 },
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

// authenticate() also imports 'gd-auth' unconditionally at module load time;
// mock it for isolation even though the oauth realm never touches this path.
vi.mock('gd-auth', () => {
  const MockGdAuth = vi.fn().mockImplementation(() => ({
    authenticate: vi.fn().mockResolvedValue({ auth: 'basic' })
  }));
  MockGdAuth.risk = { low: 1, medium: 2, high: 3 };
  return { GdAuth: MockGdAuth };
});

describe('GdAuthWrapper oauth', () => {
  it('validates an oauth token and returns clientId + scope', async () => {
    const wrapper = new GdAuthWrapper({
      useFFILibrary: true,
      realm: 'oauth',
      oauthIssuer: 'https://sso.gdcorp.tools',
      oauthAudience: 'golf-next'
    });

    const result = await wrapper.authenticate('sso.godaddy.com', 'tok', 'low');

    expect(result.oauth).toBe(true);
    expect(result.clientId).toBe('consumer-x');
    expect(result.scope).toBe('golf-next.translate');
    expect(result.tokenClaims).toEqual({ token_type: 'o_auth' });

    const { GdAuth } = await import('@godaddy/gd-auth-lib');
    const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;
    expect(mockInstance.parseToken).toHaveBeenCalledWith('tok', {
      oauth: { oauthIssuer: 'https://sso.gdcorp.tools', oauthAudience: 'golf-next' }
    });
    expect(mockInstance.isOauth).toHaveBeenCalledWith({ token_type: 'o_auth' });
  });

  it('defaults the issuer per-env from the OAuthIssuer enum when not configured', async () => {
    const wrapper = new GdAuthWrapper({
      useFFILibrary: true,
      realm: 'oauth',
      env: 'test' // no explicit oauthIssuer
    });

    await wrapper.authenticate('sso.godaddy.com', 'tok', 'low');

    const { GdAuth } = await import('@godaddy/gd-auth-lib');
    const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;
    expect(mockInstance.parseToken).toHaveBeenCalledWith('tok', {
      oauth: expect.objectContaining({ oauthIssuer: 'https://oauth.api.test-godaddy.com' })
    });
  });

  it('does not require pcpId or set SSO app config for the oauth realm', async () => {
    // The SSO path throws "pcpId is required" when `app` is set without a
    // pcpId; the oauth realm must skip that requirement entirely.
    const wrapper = new GdAuthWrapper({
      useFFILibrary: true,
      realm: 'oauth',
      app: 'my-app',
      env: 'prod', // no pcpId, non-dev env
      oauthIssuer: 'https://sso.gdcorp.tools'
    });

    const result = await wrapper.authenticate('sso.godaddy.com', 'tok', 'low');

    expect(result.oauth).toBe(true);

    const { GdAuth } = await import('@godaddy/gd-auth-lib');
    const mockInstance = GdAuth.mock.results[GdAuth.mock.results.length - 1].value;
    expect(mockInstance.setAppConfig).not.toHaveBeenCalled();
  });

  it('falls back to the sub claim only when client_id is absent', async () => {
    const { GdAuth } = await import('@godaddy/gd-auth-lib');
    GdAuth.mockImplementation(() => ({
      setAppConfig: vi.fn(),
      parseToken: vi.fn().mockReturnValue({ token_type: 'o_auth' }),
      isOauth: vi.fn().mockReturnValue(true),
      // client_id claim absent (undefined); sub is present
      getClaim: vi.fn((claims, key) => (key === 'sub' ? 'subject-x' : void 0))
    }));

    const wrapper = new GdAuthWrapper({
      useFFILibrary: true,
      realm: 'oauth',
      oauthIssuer: 'https://sso.gdcorp.tools'
    });

    const result = await wrapper.authenticate('sso.godaddy.com', 'tok', 'low');

    expect(result.clientId).toBe('subject-x');
  });

  it('throws when the token is not an oauth access token', async () => {
    const { GdAuth } = await import('@godaddy/gd-auth-lib');
    GdAuth.mockImplementation(() => ({
      setAppConfig: vi.fn(),
      parseToken: vi.fn().mockReturnValue({ token_type: 'jwt' }),
      isOauth: vi.fn().mockReturnValue(false),
      getClaim: vi.fn()
    }));

    const wrapper = new GdAuthWrapper({
      useFFILibrary: true,
      realm: 'oauth',
      oauthIssuer: 'https://sso.gdcorp.tools',
      oauthAudience: 'golf-next'
    });

    await expect(wrapper.authenticate('sso.godaddy.com', 'tok', 'low'))
      .rejects.toThrow('Token is not an OAuth access token');
  });

  it('rejects the oauth realm on the legacy (non-FFI) path', async () => {
    const wrapper = new GdAuthWrapper({
      useFFILibrary: false,
      realm: 'oauth'
    });

    await expect(wrapper.authenticate('sso.godaddy.com', 'tok', 'low'))
      .rejects.toThrow('oauth realm requires the gd-auth-lib FFI path (useFFILibrary: true)');
  });
});
