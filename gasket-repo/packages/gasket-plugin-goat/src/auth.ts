import type { Gasket } from '@gasket/core';
import type { AuthProvider } from '@godaddy/goat';

type AuthActions = Gasket['actions'] & {
  getJwt?: (_key: string) => Promise<string>;
  getAuthToken?: (_req: unknown, _realm: 'jomax') => Promise<string | undefined>;
};

/** Build an AuthProvider that mints a service JWT via gasket-plugin-jwt. */
export function serviceAuth(gasket: Gasket): AuthProvider {
  return async () => {
    const actions = gasket.actions as AuthActions;
    if (typeof actions.getJwt !== 'function') {
      throw new Error(
        '[goat] service authentication requires @godaddy/gasket-plugin-jwt'
        + ' with a matching jwt configuration'
      );
    }
    const token = await actions.getJwt('goat');
    return { Authorization: `sso-jwt ${token}` };
  };
}

/** Build an AuthProvider that forwards the caller's jomax token from the request. */
export function forwardAuth(gasket: Gasket, req: unknown): AuthProvider {
  return async () => {
    const actions = gasket.actions as AuthActions;
    if (typeof actions.getAuthToken !== 'function') {
      throw new Error(
        '[goat] request forwarding requires @godaddy/gasket-plugin-auth'
        + ' with auth.appName configured'
      );
    }
    const token = await actions.getAuthToken(req, 'jomax');
    if (!token) {
      throw new Error(
        '[goat] request passed but no sso-jwt token present'
        + ' — ensure the caller is authenticated'
      );
    }
    return { Authorization: `sso-jwt ${token}` };
  };
}
