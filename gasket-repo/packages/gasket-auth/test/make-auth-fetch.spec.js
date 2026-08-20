/* eslint-disable no-undef */

const mockFetch = vi.fn();
vi.mock('@gasket/fetch', () => ({
  default: mockFetch
}));

const mockGasketData = vi.fn().mockReturnValue({});
vi.mock('@gasket/data', () => ({
  gasketData: mockGasketData
}));

const utils = await import('../src/utils');
const { authFetch, makeAuthFetch } = await import('../src/make-auth-fetch');

describe('makeAuthFetch', () => {
  const mockUrl = 'https://testapi.com';
  const mockOpts = {
    method: 'post',
    body: {},
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 3000
  };

  let mockResponse;

  beforeEach(() => {
    mockGasketData.mockReturnValue({});
    mockResponse = {
      ok: true,
      status: 200,
      json: () => ({ data: 'abcdee' })
    };
    mockFetch.mockImplementation(() => Promise.resolve(mockResponse));
    vi.spyOn(window, 'open').mockImplementation();
  });

  afterEach(() => {
    mockFetch.mockReset();
    window.open.mockReset();
  });

  it('returns a fetch function', () => {
    expect(typeof makeAuthFetch()).toBe('function');
    expect(typeof makeAuthFetch({ realm: 'jomax' })).toBe('function');
  });

  it('exports a default authFetch (no config)', () => {
    expect(typeof authFetch).toBe('function');
  });

  it('returns response when status code is not 401', () => {
    return authFetch(mockUrl, mockOpts).then((resp) => {
      expect(resp.ok).toEqual(true);
      expect(resp.status).toEqual(200);
      expect(resp.json()).toEqual({ data: 'abcdee' });
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  it('passes url and opts to @gasket/fetch', () => {
    return authFetch(mockUrl, mockOpts).then(() => {
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, mockOpts);
    });
  });

  it('redirects to SSO page via client-side redirect when status code is 401', () => {
    mockResponse = { ok: false, status: 401, json: () => ({}) };

    return authFetch(mockUrl, mockOpts).then((resp) => {
      expect(resp).toBe(mockResponse);
      expect(resp.ssoRedirect).toEqual(true);
      const cleanedUpUrl = utils.fixupLoginUrlEnv(
        'https://sso.dev-godaddy.com?path=%2F',
        'sso.godaddy.com'
      );
      expect(window.open).toHaveBeenCalledWith(cleanedUpUrl, '_self');
    });
  });

  it('includes app param in 401 redirect when gasketData has appName', () => {
    mockGasketData.mockReturnValue({ auth: { appName: 'myapp' } });
    mockResponse = { ok: false, status: 401, json: () => ({}) };

    return authFetch(mockUrl, mockOpts).then((resp) => {
      expect(resp.ssoRedirect).toEqual(true);
      const cleanedUpUrl = utils.fixupLoginUrlEnv(
        'https://sso.dev-godaddy.com?app=myapp&path=%2F',
        'sso.godaddy.com'
      );
      expect(window.open).toHaveBeenCalledWith(cleanedUpUrl, '_self');
    });
  });

  it('omits app param in 401 redirect when gasketData has no appName', () => {
    mockGasketData.mockReturnValue({});
    mockResponse = { ok: false, status: 401, json: () => ({}) };

    return authFetch(mockUrl, mockOpts).then((resp) => {
      expect(resp.ssoRedirect).toEqual(true);
      const cleanedUpUrl = utils.fixupLoginUrlEnv(
        'https://sso.dev-godaddy.com?path=%2F',
        'sso.godaddy.com'
      );
      expect(window.open).toHaveBeenCalledWith(cleanedUpUrl, '_self');
    });
  });

  it('returns response when status code is 401 but has been called server-side', () => {
    mockResponse = { ok: false, status: 401, json: () => ({}) };

    const documentSpy = vi
      .spyOn(global.window, 'document', 'get')
      // eslint-disable-next-line no-undefined
      .mockImplementation(() => undefined);

    return authFetch(mockUrl, mockOpts).then((resp) => {
      expect(resp.ok).toEqual(false);
      expect(resp.status).toEqual(401);
      expect(window.open).not.toHaveBeenCalled();
      // Restore the document getter so it does not leak into later tests
      documentSpy.mockRestore();
    });
  });

  describe('realm configuration', () => {
    it('redirects to the jomax realm when authProps.realm is jomax', () => {
      const jomaxFetch = makeAuthFetch({ realm: 'jomax' });
      mockResponse = { ok: false, status: 401, json: () => ({}) };

      return jomaxFetch(mockUrl, mockOpts).then((resp) => {
        expect(resp.ssoRedirect).toEqual(true);
        expect(window.open).toHaveBeenCalledWith(
          expect.stringContaining('realm=jomax'),
          '_self'
        );
      });
    });

    it('does not add a realm param when unconfigured (idp default)', () => {
      mockResponse = { ok: false, status: 401, json: () => ({}) };

      return authFetch(mockUrl, mockOpts).then(() => {
        const [redirectUrl] = window.open.mock.calls[0];
        expect(redirectUrl).not.toContain('realm=');
      });
    });

    it('honors ssoRedirectOverride as the redirect base', () => {
      const overrideFetch = makeAuthFetch({
        realm: 'jomax',
        ssoRedirectOverride: 'https://sso.example.com/login'
      });
      mockResponse = { ok: false, status: 401, json: () => ({}) };

      return overrideFetch(mockUrl, mockOpts).then(() => {
        const [redirectUrl] = window.open.mock.calls[0];
        expect(redirectUrl).toContain('https://sso.example.com/login');
      });
    });

    it('threads ssoRedirectSubdomain into the redirect', () => {
      // The subdomain callback only fires when the host resolves to a real base
      // domain (getParamsFromHost returns early for localhost), so stub location.
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { host: 'sha1234.my-app.godaddy.com', pathname: '/', hash: '', search: '' }
      });
      const subdomainFetch = makeAuthFetch({
        realm: 'jomax',
        ssoRedirectSubdomain: () => 'customsub'
      });
      mockResponse = { ok: false, status: 401, json: () => ({}) };

      return subdomainFetch(mockUrl, mockOpts).then(() => {
        const calls = window.open.mock.calls;
        // Restore before asserting so a failure cannot leak into other tests
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: originalLocation
        });
        expect(calls[0]).toBeTruthy();
        const [redirectUrl] = calls[0];
        expect(redirectUrl).toContain('realm=jomax');
        expect(redirectUrl).toContain('subdomain=customsub');
      });
    });

    it('does not redirect when authProps includes alt', () => {
      const altFetch = makeAuthFetch({ realm: 'jomax', alt: 'Nope' });
      mockResponse = { ok: false, status: 401, json: () => ({}) };

      return altFetch(mockUrl, mockOpts).then((resp) => {
        // getRedirectUrl returns undefined for alt, so no redirect occurs and
        // ssoRedirect reflects that no navigation happened.
        expect(window.open).not.toHaveBeenCalled();
        expect(resp.ssoRedirect).toEqual(false);
      });
    });
  });
});
