import fetch from '@gasket/fetch';
import {
  AuthStatus,
  isBrowser,
  createAuthStateAction,
  getAuthKey,
  getAuthCheckUrl,
  getLoginUrlFromWindow,
  paramsFromProps,
  redirectTo
} from './utils.js';
import { clientAuthKeyState } from './with-auth-provider.js';
import { gasketData } from '@gasket/data';

// authReason returned by /api/auth/validate when the vat (validation token) is
// merely stale, not the session expired. The out-of-band browser heartbeat
// refreshes the vat within seconds, so this 401 is recoverable.
const STALE_VAT_AUTH_REASON = 3;

/**
 * Check user cookie for valid token
 * @type {import('./internal').fetchAuthState}
 */
function fetchAuthState(authParams) {
  const url = getAuthCheckUrl(authParams, gasketData());
  return fetch(url)
    .then(async (response) => {
      const data = await response.json();

      return {
        ...data,
        status: (response.ok && AuthStatus.LOADED) || AuthStatus.ERROR,
        timestamp: Date.now()
      };
    })
    .catch((e) => {
      console.error(e.message || e); // eslint-disable-line no-console

      // fetch() rejected, so the request never got a response (offline, DNS,
      // aborted, CORS). That is a connectivity failure, NOT a real auth
      // rejection — we genuinely don't know the auth status. Flag it so callers
      // can avoid treating a transient network blip as a logout (which would
      // bounce an authenticated user to SSO). A real 401/403 still flows through
      // the .then branch above as a plain ERROR and continues to redirect.
      return {
        status: AuthStatus.ERROR,
        networkError: true,
        timestamp: Date.now()
      };
    });
}

/**
 * Client-side auth handler
 * @class
 * @augments BaseAuthHandler
 */
export default class ClientHandler {
  /**
   * constructor
   * @type {import('./internal').ClientHandler_constructor}
   */
  constructor({ authProps }) {
    this.authProps = authProps;
    this.authParams = paramsFromProps(this.authProps);
    this.authKey = getAuthKey(this.authParams);
  }

  /**
   * Returns the current authState, or a promise with the next authState if
   * not dispatching. If the authKeyState is not provided by context, then the
   * singleton state will be used.
   * @type {import('./internal').ClientHandler_getAuthState}
   */
  getAuthState(authKeyState = clientAuthKeyState, dispatch) {
    let authState = authKeyState[this.authKey];

    // If we are already loading, exit now.
    if (authState?.status === AuthStatus.LOADING) return authState;

    // Make sure we have a state object to work with.
    authState = authState || { status: AuthStatus.LOADING };

    // The next steps are not available during SSR, so exit early.
    if (!isBrowser) return authState;

    // If we have a recent auth state, return it.
    if (authState.timestamp >= Date.now() - 60000) {
      return authState;
    }
    // Our authState is stale, so we will now refresh it

    // Mutate state status to avoid unnecessary fetches and renders
    authState.status = AuthStatus.LOADING;
    authKeyState[this.authKey] = authState;

    // Was the session valid before this (re)validation? Captured here because
    // the check below only mutated `.status`, leaving `.valid` intact.
    const wasValid = authState.valid === true;

    // Start fetching next authState
    const promise = fetchAuthState(this.authParams);

    // If we have a dispatch, return current state and dispatch next state later
    if (dispatch) {
      promise.then((nextAuthState) => {
        // Two transient conditions must not tear a previously-valid user out of
        // the app:
        //  - networkError: the validate request never reached the server, so we
        //    don't actually know the auth status.
        //  - stale vat (authReason 3): a real 401, but the out-of-band heartbeat
        //    refreshes the vat within seconds. On a reconnect/refocus burst the
        //    validate can momentarily 401 before the heartbeat catches up.
        // In both cases, if the session was valid a moment ago, keep it (with a
        // fresh timestamp so we re-validate on the next cycle). The stale-vat
        // bridge is bounded to a single recovery (staleVatRecovered) so a
        // genuinely unrecoverable vat still redirects on the next validation; a
        // genuine auth rejection (real expiry, authReason 1/2) replaces the
        // state immediately and redirects as before.
        const recoverNetworkError = nextAuthState.networkError && wasValid;
        const recoverStaleVat =
          wasValid &&
          nextAuthState.valid !== true &&
          nextAuthState.authReason === STALE_VAT_AUTH_REASON &&
          authState.staleVatRecovered !== true;

        const resolved =
          recoverNetworkError || recoverStaleVat
            ? {
              ...authState,
              status: AuthStatus.LOADED,
              timestamp: Date.now(),
              ...(recoverStaleVat && { staleVatRecovered: true })
            }
            : nextAuthState;
        dispatch(createAuthStateAction(this.authKey, resolved));

        if (recoverStaleVat && typeof window !== 'undefined' && typeof window.heartbeat?.dispatch === 'function') {
          try {
            window.heartbeat.dispatch({ redirectOn401: false })
              .then((result) => {
                if (result?.status === 201) {
                  return fetchAuthState(this.authParams).then((freshState) => {
                    if (!freshState.networkError) {
                      dispatch(createAuthStateAction(this.authKey, freshState));
                    }
                  });
                }
              })
              .catch(() => { /* intentionally ignore heartbeat errors */ });
          } catch {
            // intentionally ignore heartbeat errors (sync throw / non-promise implementations)
          }
        }
      });

      return authState;
    }

    // If not dispatching, return the promise
    return promise;
  }

  /**
   * Get the SSO login URL
   * @type {import('./internal').ClientHandler_getRedirectUrl}
   */
  getRedirectUrl(authState) {
    if ('alt' in this.authProps || typeof window === 'undefined') return;

    const {
      realm,
      risk,
      ssoRedirectOverride: overrideUrl,
      ssoRedirectSubdomain: subdomain
    } = this.authProps;
    const { auth: { appName } = {} } = gasketData() ?? {};
    const { authReason } = authState;
    const ssoParams = {
      realm,
      risk,
      ...(appName && { app: appName }),
      ...(authReason && { auth_reason: authReason })
    };

    return getLoginUrlFromWindow(window, ssoParams, { overrideUrl, subdomain });
  }

  /**
   * Attempt to redirect to the SSO login URL if auth state not valid
   * @type {import('./internal').ClientHandler_attemptRedirect}
   */
  attemptRedirect(authState) {
    if (
      'alt' in this.authProps ||
      authState.valid ||
      authState.networkError || // transient connectivity failure, not a real auth rejection
      authState.status === AuthStatus.LOADING ||
      typeof window === 'undefined'
    )
      return false;

    const url = this.getRedirectUrl(authState);
    redirectTo(url);

    return true;
  }
}
