/// <reference types="@gasket/plugin-data" />
/// <reference types="@godaddy/gasket-plugin-auth" />
/// <reference types="@godaddy/gasket-plugin-visitor" />
/// <reference types="@godaddy/gasket-plugin-uxp" />

import {
  AuthStatus,
  getAuthKey,
  getLoginUrlFromRequest,
  paramsFromProps
} from './utils.js';

/**
 * Server-side auth handler
 * @class
 * @augments BaseAuthHandler
 */
export default class ServerHandler {
  /** @type {import('./internal').ServerHandler_constructor} */
  constructor({ authProps, ctx }) {
    this.authProps = authProps;
    this.authParams = paramsFromProps(this.authProps);
    this.authKey = getAuthKey(this.authParams);
    this.ctx = ctx;
  }

  /**
   * Uses checkAuth to determine the authState state.
   * @type {import('./internal').ServerHandler_getAuthState}
   */
  async getAuthState() {
    const { req } = this.ctx;

    try {
      const checkAuth = await this.authProps.gasket.actions.getCheckAuth(req);
      const data = await checkAuth(this.authParams);

      return {
        ...data,
        status: AuthStatus.LOADED
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.message || e);

      // The auth check threw (upstream SSO unreachable / transient failure), so
      // we couldn't determine auth status — not a real rejection. Flag it so we
      // don't 302 an authenticated visitor to login on a blip; mirrors the
      // client handler's network-error classification.
      return {
        status: AuthStatus.ERROR,
        networkError: true
      };
    }
  }

  /**
   * Get the SSO login URL if redirect needed
   * @type {import('./internal').ServerHandler_getRedirectUrl}
   */
  async getRedirectUrl(authState) {
    if ('alt' in this.authProps || authState.valid) return;

    const { req } = this.ctx;
    const { actions } = this.authProps.gasket;

    const [
      visitor,
      pcContent,
      publicGasketData
    ] = await Promise.all([
      actions.getVisitor(req),
      actions.getPresentationCentral(req),
      actions.getPublicGasketData?.(req)
    ]);

    // fallback for earlier visitor plugin versions
    const host = visitor.host ?? visitor.hostname;
    const basePath = publicGasketData?.auth?.basePath ?? '';
    const { resolvedUrl: path = req.originalUrl } = this.ctx;

    const {
      realm,
      risk,
      ssoRedirectOverride: overrideUrl,
      ssoRedirectSubdomain: subdomain
    } = this.authProps;
    const { auth: { appName } = {} } = this.authProps.gasket.config ?? {};
    // true when path already starts with basePath as a complete segment (not just a shared string prefix)
    const isAlreadyPrefixed = basePath && path.startsWith(basePath) &&
      (path.length === basePath.length || '/?'.includes(path[basePath.length]));
    const ssoPath = `${basePath}${isAlreadyPrefixed ? path.slice(basePath.length) : path}`;
    const { authReason } = authState;
    const ssoParams = {
      realm,
      risk,
      path: ssoPath,
      ...(appName && { app: appName }),
      ...(authReason && { auth_reason: authReason })
    };
    const urlOptions = { overrideUrl, subdomain, host };

    return getLoginUrlFromRequest(pcContent.data, ssoParams, urlOptions);
  }

  /**
   * Attempt to redirect to the SSO login URL if auth state not valid
   * @type {import('./internal').ServerHandler_attemptRedirect}
   */
  async attemptRedirect(authState) {
    if (
      'alt' in this.authProps ||
      authState.valid ||
      authState.networkError || // transient connectivity failure, not a real auth rejection
      authState.status === AuthStatus.LOADING
    )
      return false;

    const { res } = this.ctx;

    if (!res.headersSent) {
      const url = await this.getRedirectUrl(authState);

      if (!url) return false;

      res.writeHead(302, { Location: url });
      res.end();

      return true;
    }

    return false;
  }
}
