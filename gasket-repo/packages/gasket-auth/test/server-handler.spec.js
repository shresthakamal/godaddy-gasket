
/* eslint-disable no-undef */
const { mockGetLoginUrlFromRequest, mockCheckAuth } = vi.hoisted(() => ({
  mockGetLoginUrlFromRequest: vi.fn().mockReturnValue('https:sso.godaddy.com'),
  mockCheckAuth: vi.fn().mockResolvedValue({ valid: true })
}));

vi.mock('../src/utils', async () => ({
  ...await vi.importActual('../src/utils'),
  getLoginUrlFromRequest: mockGetLoginUrlFromRequest
}));

import { AuthStatus } from '../src/utils';

const mockSsoUrl = 'https:sso.godaddy.com';
const mockOriginalUrl = 'https://local.gasket.dev-godaddy.com:8443';

const ServerHandler = (await import('../src/server-handler')).default;

describe('ServerHandler', () => {
  let authProps, ctx, mockGasket;

  beforeEach(() => {
    mockGasket = {
      actions: {
        getCheckAuth: vi.fn().mockResolvedValue(
          mockCheckAuth
        ),
        getVisitor: vi.fn().mockResolvedValue({ host: 'www.example.com' }),
        getPresentationCentral: vi.fn().mockResolvedValue({ data: {} }),
        getPublicGasketData: vi.fn().mockResolvedValue({})
      }
    };
    authProps = { realm: 'jomax', gasket: mockGasket };
    vi.spyOn(console, 'error').mockImplementation();

    ctx = {
      req: { originalUrl: mockOriginalUrl, checkAuth: mockCheckAuth, get: vi.fn() },
      res: { writeHead: vi.fn(), end: vi.fn() }
    };
  });

  afterEach(function () {
    vi.clearAllMocks();
  });

  it('implements expected methods', function () {
    [
      'getAuthState',
      'getRedirectUrl',
      'attemptRedirect'
    ].forEach(method => expect(method in ServerHandler.prototype).toBe(true));
  });

  it('configures auth params and key', function () {
    const handler = new ServerHandler({ authProps });
    expect(handler).toHaveProperty('authParams', { realm: 'jomax' });
    expect(handler).toHaveProperty('authKey', 'realm=jomax');
  });

  it('configures ctx', function () {
    const handler = new ServerHandler({ authProps, ctx });
    expect(handler).toHaveProperty('ctx', ctx);
  });

  describe('.getAuthState', function () {

    it('uses checkAuth from req', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getAuthState();
      expect(ctx.req.checkAuth).toHaveBeenCalledWith(handler.authParams);
    });

    it('returns auth state with LOADED status', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.getAuthState();
      expect(results).toEqual({
        valid: true,
        status: AuthStatus.LOADED
      });
    });

    it('errors return with ERROR status flagged as a network error', async function () {
      mockCheckAuth.mockRejectedValue(new Error('Bad things man!'));
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.getAuthState();
      expect(results).toEqual({
        status: AuthStatus.ERROR,
        networkError: true
      });
    });
  });

  describe('.getRedirectUrl', function () {

    it('returns empty if alt in props', async function () {
      authProps.alt = 'Alternative content';
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.getRedirectUrl({ valid: false });
      expect(results).toBeUndefined();
      expect(mockGetLoginUrlFromRequest).not.toHaveBeenCalled();
    });

    it('returns empty if authState valid', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.getRedirectUrl({ valid: true });
      expect(results).toBeUndefined();
      expect(mockGetLoginUrlFromRequest).not.toHaveBeenCalled();
    });

    it('returns SSO URL', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.getRedirectUrl({ valid: false });
      expect(results).toBe(mockSsoUrl);
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalled();
    });

    it('passes realm and risk to SSO params', async function () {
      authProps.risk = 'low';
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ realm: 'jomax', risk: 'low' }),
        expect.any(Object)
      );
    });

    it('passes originalUrl as path to SSO params', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: mockOriginalUrl }),
        expect.any(Object)
      );
    });

    it('passes resolvedUrl as path to SSO params (getServerSideProps)', async function () {
      ctx.resolvedUrl = 'https://example.secureserver.net';
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: ctx.resolvedUrl }),
        expect.any(Object)
      );
    });

    it('adds auth_reason to SSO params', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ auth_reason: 1 }),
        expect.any(Object)
      );
    });

    it('adds URL options', async function () {
      authProps.ssoRedirectOverride = '/custom/login';
      authProps.ssoRedirectSubdomain = 'example';
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.any(Object),
        expect.objectContaining({ overrideUrl: '/custom/login', subdomain: 'example' })
      );
    });

    it('passes visitor host as options', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.any(Object),
        expect.objectContaining({ host: 'www.example.com' })
      );
    });

    it('passes visitor host with port as options', async function () {
      mockGasket.actions.getVisitor.mockResolvedValueOnce({ host: 'www.example.com:8443' });
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.any(Object),
        expect.objectContaining({ host: 'www.example.com:8443' })
      );
    });

    it('fallback to visitor hostname if no host', async function () {
      mockGasket.actions.getVisitor.mockResolvedValueOnce({ hostname: 'hostname.example.com' });
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.any(Object),
        expect.objectContaining({ host: 'hostname.example.com' })
      );
    });

    it('includes basePath in redirect URL when present', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          ...ctx,
          resolvedUrl: '/protected'
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/tester' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/tester/protected' }),
        expect.any(Object)
      );
    });

    it('does not double-prepend basePath when resolvedUrl already includes it', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          ...ctx,
          resolvedUrl: '/beta/watching/index'
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/beta' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/beta/watching/index' }),
        expect.any(Object)
      );
    });

    it('prepends basePath when path starts with same string but different segment', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          ...ctx,
          resolvedUrl: '/beta-feature/watching'
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/beta' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/beta/beta-feature/watching' }),
        expect.any(Object)
      );
    });

    it('preserves query string without double-prepending basePath', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          ...ctx,
          resolvedUrl: '/beta?redirect=true'
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/beta' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/beta?redirect=true' }),
        expect.any(Object)
      );
    });

    it('handles path exactly equal to basePath without modification', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          ...ctx,
          resolvedUrl: '/beta'
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/beta' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/beta' }),
        expect.any(Object)
      );
    });

    it('handles route named same as basePath (/beta/beta)', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          ...ctx,
          resolvedUrl: '/beta/beta'
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/beta' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/beta/beta' }),
        expect.any(Object)
      );
    });

    it('preserves trailing slash on basePath root without double-prepending', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          ...ctx,
          resolvedUrl: '/beta/'
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/beta' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/beta/' }),
        expect.any(Object)
      );
    });

    it('does not double-prepend basePath when falling back to req.originalUrl (getInitialProps path)', async function () {
      const handler = new ServerHandler({
        authProps,
        ctx: {
          req: { ...ctx.req, originalUrl: '/beta/watching/index' },
          res: ctx.res
          // no resolvedUrl — simulates getInitialProps / middleware context
        }
      });
      mockGasket.actions.getPublicGasketData.mockResolvedValueOnce({ auth: { basePath: '/beta' } });
      await handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ path: '/beta/watching/index' }),
        expect.any(Object)
      );
    });

    it('passes appName from gasket config as app SSO param', async function () {
      mockGasket.config = { auth: { appName: 'auctions' } };
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ app: 'auctions' }),
        expect.any(Object)
      );
    });

    it('omits app SSO param when appName is not configured', async function () {
      mockGasket.config = { auth: {} };
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.not.objectContaining({ app: expect.anything() }),
        expect.any(Object)
      );
    });

    it('omits app SSO param when gasket config is absent', async function () {
      // no mockGasket.config set (undefined)
      const handler = new ServerHandler({ authProps, ctx });
      await handler.getRedirectUrl({ valid: false });
      expect(mockGetLoginUrlFromRequest).toHaveBeenCalledWith(
        {},
        expect.not.objectContaining({ app: expect.anything() }),
        expect.any(Object)
      );
    });
  });

  describe('.attemptRedirect', function () {
    let getRedirectUrlSpy;

    beforeEach(function () {
      getRedirectUrlSpy = vi.spyOn(ServerHandler.prototype, 'getRedirectUrl').mockImplementation(() => mockSsoUrl);
    });

    afterEach(function () {
      getRedirectUrlSpy.mockRestore();
    });

    it('returns false if alt in props', async function () {
      authProps.alt = 'Alternative content';
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.attemptRedirect({ valid: false });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns false if state valid', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.attemptRedirect({ valid: true });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns false if loading', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.attemptRedirect({ status: AuthStatus.LOADING });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns false on a network error (does not 302 to login)', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.attemptRedirect({ status: AuthStatus.ERROR, networkError: true });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns true if redirecting', async function () {
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.attemptRedirect({ valid: false });
      expect(results).toBe(true);
      expect(getRedirectUrlSpy).toHaveBeenCalled();
      expect(ctx.res.writeHead).toHaveBeenCalledWith(302, { Location: mockSsoUrl });
      expect(ctx.res.end).toHaveBeenCalled();
    });

    it('does not redirect if headers sent', async function () {
      ctx.res.headersSent = true;
      const handler = new ServerHandler({ authProps, ctx });
      const results = await handler.attemptRedirect({ valid: false });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });
  });
});
