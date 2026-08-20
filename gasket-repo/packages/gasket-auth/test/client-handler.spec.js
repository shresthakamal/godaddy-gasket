/* eslint-disable no-console, no-undef */

const { mockFetch, mockRedirectTo, mockGetLoginUrlFromWindow, mockGasketData } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockRedirectTo: vi.fn(),
  mockGetLoginUrlFromWindow: vi.fn(),
  mockGasketData: vi.fn().mockReturnValue({})
}));

vi.mock('@gasket/fetch', () => ({
  default: mockFetch
}));

vi.mock('../src/utils.js', async () => ({
  ...await vi.importActual('../src/utils.js'),
  redirectTo: mockRedirectTo,
  getLoginUrlFromWindow: mockGetLoginUrlFromWindow
}));

vi.mock('@gasket/data', () => ({
  gasketData: mockGasketData
}));

import { clientAuthKeyState } from '../src/with-auth-provider';
import { AuthStatus } from '../src/utils';

const mockSsoUrl = 'https:sso.godaddy.com';

// helper to wait for async actions
const pause = ms => new Promise((resolve) => setTimeout(resolve, ms));

const ClientHandler = (await import('../src/client-handler.js')).default;

describe('ClientHandler', () => {
  let authProps, mockResponse, mockJson, mockDispatch;

  beforeEach(() => {
    window.open = vi.fn();
    mockDispatch = vi.fn();
    mockJson = { valid: true, new: true };
    authProps = { realm: 'jomax' };
    mockResponse = { ok: true, json: vi.fn().mockResolvedValue(mockJson) };
    mockFetch.mockImplementation().mockResolvedValue(mockResponse);
    mockGetLoginUrlFromWindow.mockReturnValue(mockSsoUrl);
  });

  afterEach(function () {
    vi.resetAllMocks();
    Object.keys(clientAuthKeyState).forEach(k => { delete clientAuthKeyState[k];});
  });

  it('implements expected methods', function () {
    [
      'getAuthState',
      'getRedirectUrl',
      'attemptRedirect'
    ].forEach(method => expect(method in ClientHandler.prototype).toBe(true));
  });

  it('configures auth params and key', function () {
    const handler = new ClientHandler({ authProps });
    expect(handler).toHaveProperty('authParams', { realm: 'jomax' });
    expect(handler).toHaveProperty('authKey', 'realm=jomax');
  });

  describe('.getAuthState', function () {

    it('fetches auth validate with auth params from props', async function () {
      let handler = new ClientHandler({ authProps });
      handler.getAuthState({}, mockDispatch);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/validate?realm=jomax');

      handler = new ClientHandler({ authProps: { ...authProps, realm: 'idp', risk: 'high' } });
      handler.getAuthState({}, mockDispatch);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/validate?realm=idp&risk=high');
    });

    it('does not fetches if current state recent', async function () {
      const handler = new ClientHandler({ authProps });
      const currentState = { status: AuthStatus.LOADED, timestamp: Date.now() };
      handler.getAuthState({ 'realm=jomax': currentState }, mockDispatch);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('re-fetches if current state stale', async function () {
      const handler = new ClientHandler({ authProps });
      const currentState = { status: AuthStatus.LOADED, timestamp: 1234 };
      handler.getAuthState({ 'realm=jomax': currentState }, mockDispatch);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('does not fetches if current status loading', async function () {
      const handler = new ClientHandler({ authProps });
      const currentState = { status: AuthStatus.LOADING };
      handler.getAuthState({ 'realm=jomax': currentState }, mockDispatch);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('next state status based on response', async function () {
      const handler = new ClientHandler({ authProps });
      let results = await handler.getAuthState({});
      expect(results).toEqual(expect.objectContaining({
        status: AuthStatus.LOADED,
        timestamp: expect.any(Number)
      }));

      mockResponse.ok = false;
      results = await handler.getAuthState({});
      expect(results).toEqual(expect.objectContaining({
        status: AuthStatus.ERROR,
        timestamp: expect.any(Number)
      }));
    });

    it('catches/logs errors and flags a network error state', async function () {
      vi.spyOn(console, 'error').mockImplementation();
      mockFetch.mockRejectedValue(new Error('Bad things'));
      const handler = new ClientHandler({ authProps });
      const results = await handler.getAuthState({});
      expect(results).toEqual(expect.objectContaining({
        status: AuthStatus.ERROR,
        networkError: true,
        timestamp: expect.any(Number)
      }));
      expect(console.error).toHaveBeenCalledWith('Bad things');
    });

    it('does NOT flag networkError on a non-ok response (real auth rejection)', async function () {
      mockResponse.ok = false;
      const handler = new ClientHandler({ authProps });
      const results = await handler.getAuthState({});
      expect(results.status).toBe(AuthStatus.ERROR);
      expect(results.networkError).toBeUndefined();
    });

    it('preserves a previously-valid session on a network error (dispatch path)', async function () {
      vi.spyOn(console, 'error').mockImplementation();
      mockFetch.mockRejectedValue(new Error('offline'));
      const prevValid = { valid: true, details: { x: 1 }, status: AuthStatus.LOADED, timestamp: 0 };
      const handler = new ClientHandler({ authProps });
      handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
      await pause(10);
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        payload: {
          'realm=jomax': expect.objectContaining({
            valid: true,
            details: { x: 1 },
            status: AuthStatus.LOADED,
            timestamp: expect.any(Number)
          })
        }
      }));
      // The preserved state must NOT carry the networkError flag forward.
      const dispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
      expect(dispatched.networkError).toBeUndefined();
    });

    it('replaces a previously-valid session on a real (non-network) error', async function () {
      mockResponse.ok = false;
      mockResponse.json = vi.fn().mockResolvedValue({}); // 401-style body, no `valid`
      const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
      const handler = new ClientHandler({ authProps });
      handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
      await pause(10);
      const dispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
      expect(dispatched.status).toBe(AuthStatus.ERROR);
      expect(dispatched.valid).not.toBe(true);
    });

    it('bridges a stale-vat 401 (authReason 3) for a previously-valid session', async function () {
      mockResponse.ok = false;
      mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
      const prevValid = { valid: true, details: { x: 1 }, status: AuthStatus.LOADED, timestamp: 0 };
      const handler = new ClientHandler({ authProps });
      handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
      await pause(10);
      const dispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
      expect(dispatched).toEqual(expect.objectContaining({
        valid: true,
        details: { x: 1 },
        status: AuthStatus.LOADED,
        staleVatRecovered: true,
        timestamp: expect.any(Number)
      }));
    });

    it('redirects on a second consecutive stale-vat 401 (bridge is bounded)', async function () {
      mockResponse.ok = false;
      mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
      // Session already bridged once — must not bridge again.
      const alreadyBridged = { valid: true, staleVatRecovered: true, status: AuthStatus.LOADED, timestamp: 0 };
      const handler = new ClientHandler({ authProps });
      handler.getAuthState({ 'realm=jomax': alreadyBridged }, mockDispatch);
      await pause(10);
      const dispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
      expect(dispatched.status).toBe(AuthStatus.ERROR);
      expect(dispatched.valid).not.toBe(true);
      expect(dispatched.staleVatRecovered).toBeUndefined();
    });

    it('does NOT bridge a stale-vat 401 when not previously valid', async function () {
      mockResponse.ok = false;
      mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
      const prevInvalid = { valid: false, status: AuthStatus.ERROR, timestamp: 0 };
      const handler = new ClientHandler({ authProps });
      handler.getAuthState({ 'realm=jomax': prevInvalid }, mockDispatch);
      await pause(10);
      const dispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
      expect(dispatched.status).toBe(AuthStatus.ERROR);
      expect(dispatched.valid).not.toBe(true);
    });

    it('does NOT bridge a real expiry 401 (authReason 1) for a valid session', async function () {
      mockResponse.ok = false;
      mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 1 });
      const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
      const handler = new ClientHandler({ authProps });
      handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
      await pause(10);
      const dispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
      expect(dispatched.status).toBe(AuthStatus.ERROR);
      expect(dispatched.valid).not.toBe(true);
    });

    describe('stale-vat active heartbeat recovery', function () {
      let mockHeartbeatDispatch;

      beforeEach(() => {
        mockHeartbeatDispatch = vi.fn().mockResolvedValue({ status: 0 });
        window.heartbeat = { dispatch: mockHeartbeatDispatch };
      });

      afterEach(() => {
        delete window.heartbeat;
      });

      it('calls window.heartbeat.dispatch with redirectOn401: false on stale-vat 401', async function () {
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(10);
        expect(mockHeartbeatDispatch).toHaveBeenCalledWith({ redirectOn401: false });
      });

      it('re-fetches and dispatches fresh state when heartbeat returns 201', async function () {
        mockHeartbeatDispatch.mockResolvedValue({ status: 201 });
        const freshJson = { valid: true, fresh: true };
        const freshResponse = { ok: true, json: vi.fn().mockResolvedValue(freshJson) };
        mockFetch
          .mockResolvedValueOnce({ ok: false, json: vi.fn().mockResolvedValue({ valid: false, authReason: 3 }) })
          .mockResolvedValueOnce(freshResponse);
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(50);
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        const firstDispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
        expect(firstDispatched).toEqual(expect.objectContaining({
          valid: true,
          staleVatRecovered: true
        }));
        const secondDispatched = mockDispatch.mock.calls[1][0].payload['realm=jomax'];
        expect(secondDispatched).toEqual(expect.objectContaining({
          valid: true,
          fresh: true,
          status: AuthStatus.LOADED
        }));
        expect(secondDispatched.staleVatRecovered).toBeUndefined();
      });

      it('does not overwrite bridged state when post-heartbeat re-validate has network error', async function () {
        vi.spyOn(console, 'error').mockImplementation();
        mockHeartbeatDispatch.mockResolvedValue({ status: 201 });
        mockFetch
          .mockResolvedValueOnce({ ok: false, json: vi.fn().mockResolvedValue({ valid: false, authReason: 3 }) })
          .mockRejectedValueOnce(new Error('offline'));
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(50);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const dispatched = mockDispatch.mock.calls[0][0].payload['realm=jomax'];
        expect(dispatched).toEqual(expect.objectContaining({
          valid: true,
          staleVatRecovered: true,
          status: AuthStatus.LOADED
        }));
      });

      it('does not dispatch a second time when heartbeat returns non-201', async function () {
        mockHeartbeatDispatch.mockResolvedValue({ status: 0, skipped: true });
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(50);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('does not dispatch a second time when heartbeat returns 401', async function () {
        mockHeartbeatDispatch.mockResolvedValue({ status: 401, serviceCode: -93 });
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(50);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('does not throw when window.heartbeat is not available', async function () {
        delete window.heartbeat;
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(10);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch.mock.calls[0][0].payload['realm=jomax'].staleVatRecovered).toBe(true);
      });

      it('does not call heartbeat when staleVatRecovered is already true', async function () {
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const alreadyBridged = { valid: true, staleVatRecovered: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': alreadyBridged }, mockDispatch);
        await pause(10);
        expect(mockHeartbeatDispatch).not.toHaveBeenCalled();
      });

      it('does not call heartbeat on network-error recovery', async function () {
        vi.spyOn(console, 'error').mockImplementation();
        mockFetch.mockRejectedValue(new Error('offline'));
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(10);
        expect(mockHeartbeatDispatch).not.toHaveBeenCalled();
      });

      it('silently swallows heartbeat promise rejection', async function () {
        mockHeartbeatDispatch.mockRejectedValue(new Error('heartbeat exploded'));
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(50);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('does not throw when window.heartbeat.dispatch is not a function', async function () {
        window.heartbeat = { dispatch: 'not-a-function' };
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(10);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });

      it('silently swallows synchronous heartbeat dispatch throws', async function () {
        window.heartbeat = {
          dispatch: () => {
            throw new Error('heartbeat sync throw');
          }
        };
        mockResponse.ok = false;
        mockResponse.json = vi.fn().mockResolvedValue({ valid: false, authReason: 3 });
        const prevValid = { valid: true, status: AuthStatus.LOADED, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        handler.getAuthState({ 'realm=jomax': prevValid }, mockDispatch);
        await pause(10);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
      });
    });

    it('uses clientAuthKeyState if not provided', async function () {
      clientAuthKeyState['realm=jomax'] = { fromClient: true, timestamp: Date.now(), status: AuthStatus.LOADED };
      const handler = new ClientHandler({ authProps });
      const results = await handler.getAuthState();
      expect(results).toEqual(expect.objectContaining({
        fromClient: true
      }));
    });

    describe('with dispatch provided', function () {

      it('returns AuthState object', function () {
        const handler = new ClientHandler({ authProps });
        const results = handler.getAuthState({}, mockDispatch);
        expect(results.constructor.name).not.toEqual('Promise');
        expect(results).toEqual({
          status: expect.any(String)
        });
      });

      it('returns current state and dispatches next', async function () {
        const oldState = { valid: false, old: true, timestamp: 0 };
        const handler = new ClientHandler({ authProps });
        const results = handler.getAuthState({ 'realm=jomax': oldState }, mockDispatch);
        expect(results).toBe(oldState);
        await pause(10);
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
          payload: {
            'realm=jomax': expect.objectContaining({
              valid: true,
              new: true,
              timestamp: expect.any(Number)
            })
          }
        }));
      });

      it('returns loading state if no existing state', async function () {
        const handler = new ClientHandler({ authProps });
        const results = handler.getAuthState({}, mockDispatch);
        expect(results).toEqual({
          status: AuthStatus.LOADING
        });
      });
    });

    describe('when no dispatch', function () {

      it('returns AuthState promise', async function () {
        const handler = new ClientHandler({ authProps });
        const results = handler.getAuthState();
        expect(results.constructor.name).toEqual('Promise');
        const value = await results;
        expect(value).toEqual(expect.objectContaining({
          status: expect.any(String),
          timestamp: expect.any(Number)
        }));
      });
    });
  });

  describe('.getRedirectUrl', function () {

    it('returns empty if alt in props', function () {
      authProps.alt = 'Alternative content';
      const handler = new ClientHandler({ authProps });
      const results = handler.getRedirectUrl({ valid: false });
      expect(results).toBeUndefined();
      expect(mockGetLoginUrlFromWindow).not.toHaveBeenCalled();
    });

    it('returns empty if window object is undefined', function () {
      const originalWindow = global.window;

      // @ts-ignore
      delete global.window;

      const handler = new ClientHandler({ authProps });
      const results = handler.getRedirectUrl({ valid: false });

      expect(results).toBeUndefined();
      expect(mockGetLoginUrlFromWindow).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    it('returns SSO URL', function () {
      const handler = new ClientHandler({ authProps });
      const results = handler.getRedirectUrl({ valid: false });
      expect(results).toBe(mockSsoUrl);
      expect(mockGetLoginUrlFromWindow).toHaveBeenCalled();
    });

    it('passes realm and risk to SSO params', function () {
      authProps.risk = 'low';
      const handler = new ClientHandler({ authProps });
      handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromWindow).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ realm: 'jomax', risk: 'low' }),
        expect.any(Object)
      );
    });

    it('adds auth_reason to SSO params', function () {
      const handler = new ClientHandler({ authProps });
      handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromWindow).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ auth_reason: 1 }),
        expect.any(Object)
      );
    });

    it('adds URL options', function () {
      authProps.ssoRedirectOverride = '/custom/login';
      authProps.ssoRedirectSubdomain = 'example';
      const handler = new ClientHandler({ authProps });
      handler.getRedirectUrl({ valid: false, authReason: 1 });
      expect(mockGetLoginUrlFromWindow).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({ overrideUrl: '/custom/login', subdomain: 'example' })
      );
    });

    it('passes appName from gasketData as app SSO param', function () {
      mockGasketData.mockReturnValueOnce({ auth: { appName: 'auctions' } });
      const handler = new ClientHandler({ authProps });
      handler.getRedirectUrl({ valid: false });
      expect(mockGetLoginUrlFromWindow).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ app: 'auctions' }),
        expect.any(Object)
      );
    });

    it('omits app SSO param when appName is absent from gasketData', function () {
      mockGasketData.mockReturnValueOnce({ auth: {} });
      const handler = new ClientHandler({ authProps });
      handler.getRedirectUrl({ valid: false });
      expect(mockGetLoginUrlFromWindow).toHaveBeenCalledWith(
        expect.any(Object),
        expect.not.objectContaining({ app: expect.anything() }),
        expect.any(Object)
      );
    });

    it('handles gasketData returning undefined gracefully', function () {
      mockGasketData.mockReturnValueOnce();
      const handler = new ClientHandler({ authProps });
      const results = handler.getRedirectUrl({ valid: false });
      expect(results).toBe(mockSsoUrl);
      expect(mockGetLoginUrlFromWindow).toHaveBeenCalledWith(
        expect.any(Object),
        expect.not.objectContaining({ app: expect.anything() }),
        expect.any(Object)
      );
    });
  });

  describe('.attemptRedirect', function () {

    let getRedirectUrlSpy;
    beforeEach(function () {
      getRedirectUrlSpy = vi.spyOn(ClientHandler.prototype, 'getRedirectUrl').mockImplementation();
    });

    it('returns false if alt in props', function () {
      authProps.alt = 'Alternative content';
      const handler = new ClientHandler({ authProps });
      const results = handler.attemptRedirect({ valid: false });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns false if state valid', function () {
      const handler = new ClientHandler({ authProps });
      const results = handler.attemptRedirect({ valid: true });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns false if loading', function () {
      const handler = new ClientHandler({ authProps });
      const results = handler.attemptRedirect({ status: AuthStatus.LOADING });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns false on a network error (does not redirect)', function () {
      const handler = new ClientHandler({ authProps });
      const results = handler.attemptRedirect({ status: AuthStatus.ERROR, networkError: true });
      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();
    });

    it('returns false if window object is undefined', function () {
      const originalWindow = global.window;

      // @ts-ignore
      delete global.window;

      const handler = new ClientHandler({ authProps });
      const results = handler.attemptRedirect({ valid: false });

      expect(results).toBe(false);
      expect(getRedirectUrlSpy).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    it('returns true if redirecting', function () {
      const handler = new ClientHandler({ authProps });
      const results = handler.attemptRedirect({ valid: false });
      expect(results).toBe(true);
      expect(getRedirectUrlSpy).toHaveBeenCalled();
      expect(mockRedirectTo).toHaveBeenCalled();
    });
  });
});
