/// <reference types="@gasket/plugin-data" />
import React from 'react';
import type { NextPageContext } from 'next';
import type { Gasket } from '@gasket/core';
import type {
  ComponentType,
  Dispatch,
  PropsWithChildren,
  ReactNode
} from 'react';

/**
 * Options with `checkAuth` during SSR, or passed as query params from the
 * browser to the validation endpoint. They are the criteria for authentication.
 */
export interface AuthParams {
  /** Where the token should originate from. i.e. `idp` or `jomax` */
  realm?: AuthRealmType;
  /** Risk level for *idp* tokens */
  risk?: AuthRiskType;
  /** Allowed *idp* token types */
  type?: AuthIdpType | AuthIdpType[];
  /** Allowed *jomax* admin groups */
  groups?: string | string[];
  /** Allowed *cert* common names. */
  certs?: string[];
  /** Perform heartbeat request when VAT is expired */
  allowHeartbeat?: boolean;
  /** Use 12-hour token expiration */
  use12HourExpiration?: boolean;
}

/**
 * Options for how to render or handle redirects once the AuthParams have been
 * validated.
 */
export interface AuthProps extends PropsWithChildren<AuthParams> {
  /** Gasket instance */
  gasket?: Gasket
  /** Do not redirect, instead show alt component */
  alt?: React.ReactNode;
  /** What to show when validating */
  loading?: React.ReactNode;
  /** Add validation details to child props */
  injectDetails?: boolean;
  /** Url to use instead of sso.*/
  ssoRedirectOverride?: string;
  /** Custom subdomain for redirect back from SSO */
  ssoRedirectSubdomain?: false | ((host: string) => string | false);
}

interface WithAuthProps extends AuthProps {
  /** Add a getInitialProps to the wrapper. Defaults to true */
  initialProps?: boolean;
}

// TODO: duped from plugin types
interface AuthResponse {
  /** Is user token valid for auth params */
  valid?: boolean;
  /** Valid auth extra details */
  details?: Record<string, unknown>;
  /** Invalid error message */
  reason?: string;
  /** Invalid code to pass along to SSO */
  authReason?: number;
}

/**
 * Validation response with added status and timestamp
 */
export interface AuthState extends AuthResponse {
  status: AuthStatusType;
  timestamp?: number;
  /**
   * True when the auth check failed due to a network/connectivity error (the
   * request never reached the server — offline, DNS, abort) rather than a real
   * auth rejection. Callers must not treat this as a logout: it does not
   * trigger an SSO redirect, and a previously-valid session is preserved.
   */
  networkError?: boolean;
  /**
   * True when a previously-valid session was preserved across a stale-vat 401
   * (authReason 3) to give the out-of-band heartbeat a cycle to refresh the
   * vat. Bounds the bridge to a single recovery: if the very next validation is
   * still a stale-vat 401, the state is replaced and the SSO redirect proceeds.
   */
  staleVatRecovered?: boolean;
}

/**
 * Lookup key based on AuthParams
 */
export type AuthKey = string;

/**
 * Object containing mappings of AuthKey to AuthState
 */
export type AuthKeyState = Record<AuthKey, AuthState>;

interface AuthFetchResponse extends Response {
  /** Request was unauthorized browser is redirecting to SSO login */
  ssoRedirect?: boolean;
}

/** SSO Login URL Params */
export interface LoginUrlParams {
  /** SSO app key name */
  app?: string;
  /** Authentication realm (idp or jomax) */
  realm?: (typeof AuthRealm)[keyof typeof AuthRealm];
  /** URL path of app to redirect back to */
  path?: string;
  /** Port which site was requested on */
  port?: string;
  /** Optional body of request */
  body?: Record<string, unknown>;
}

/**
 * Injects the auth details into the props of the component.
 */
interface InjectedDetails {
  authDetails: {
    cid?: string;
    shopperId?: string;
    plid?: number;
    type?: AuthIdpType;
    [param: string]: unknown;
  };
}

interface PathOptions {
  /** Url to override existing base sso url */
  overrideUrl?: string;
  /** Determine subdomain from host, or set false to disable */
  subdomain?: false | ((host: string) => string | false);
  hostname?: string;
}

declare global {
  interface Ux {
    data: {
      urls: {
        login: {
          href: string;
        };
      };
    };
  }

  interface Window {
    ux?: Ux;
    heartbeat?: {
      dispatch(options?: { redirectOn401?: boolean }): Promise<{ status: number; serviceCode?: number; skipped?: boolean; reason?: string; error?: boolean }>;
    };
  }
}

declare global {
  interface Response {
    ssoRedirect?: boolean;
  }
}

export type ComponentWithInitialProps<Props = unknown> = ComponentType<Props> & {
  getInitialProps?: (ctx: NextPageContext) => Promise<unknown>;
  WrappedComponent?: ComponentWithInitialProps;
};

/** Props for a Next.js page containing locale and initial state */
export type AuthContext = {
  /** State to reference */
  authKeyState?: AuthKeyState;
  /** Function if dispatching */
  dispatch?: Dispatch<{ payload: AuthKeyState }>;
};

declare module '@gasket/data' {
  interface GasketData {
    auth?: {
      appName?: string;
      basePath?: string;
    };
    visitor?: {
      plid?: number;
    };
  }
}

declare module 'http' {
  interface OutgoingMessage {
    set(name: string, value: string[]): void;
  }

  interface IncomingMessage {
    checkAuth(cleanQuery: AuthParams): Promise<AuthResponse>;
    originalUrl: string;
  }

  interface ServerResponse<Request extends IncomingMessage = IncomingMessage>
    extends OutgoingMessage<Request> {
    locals?: {
      visitor?: {
        hostname?: string;
        market?: string;
      };
      trace?: {
        traceId?: string;
      }
    };
    redirect(url: string): void;
  }
}

declare module 'next' {
  interface NextPageContext {
    resolvedUrl: string;
  }
}


/**
 * Client-side fetch wrapper that auto-redirect to SSO Login Page if
 * unauthorized.
 */
function authFetch(
  /** URL to fetch against */
  url: string,
  /** Fetch options */
  options?: RequestInit
): Promise<AuthFetchResponse>;

/**
 * Create a client-side fetch wrapper bound to the given authProps. On a 401 it
 * redirects to the SSO Login Page using a URL derived from those props (realm,
 * risk, ssoRedirectOverride, ssoRedirectSubdomain), so internal apps can
 * redirect to the correct realm (e.g. jomax) instead of always defaulting to
 * idp. Calling with no config yields the same behavior as `authFetch`.
 */
function makeAuthFetch(
  /** Auth settings used to build the SSO redirect on a 401 */
  authProps?: AuthProps
): (
  /** URL to fetch against */
  url: string,
  /** Fetch options */
  options?: RequestInit
) => Promise<AuthFetchResponse>;

/** Make an HOC that attaches a getInitialProps function for auth */
function authGetInitialProps<Props>(
  authProps: AuthProps
): (Component: ComponentType<Props>) => ComponentWithInitialProps<Props>;

/** Make a getServerSideProps function for auth */
function authGetServerSideProps(authProps: AuthProps): (
  context: NextPageContext
) => Promise<
  | {
    redirect: {
      destination: string;
      permanent: boolean;
    };
  }
  | {
    props: {
      authKeyState: AuthKeyState;
    };
  }
>;

/** Component that checks auth state and either renders or redirects to SSO */
function AuthRequired(
  props: PropsWithChildren<AuthProps>
): ReactNode;

/**
 * Fetch status of an auth setting
 */
export const AuthStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
} as const;

/**
 * Enum for authentication realms
 */
export const AuthRealm = {
  idp: 'idp',
  idpInt: 'idp_int',
  idp_int: 'idp_int',
  jomax: 'jomax',
  pass: 'pass',
  cert: 'cert',
  awsiam: 'awsiam'
} as const;

/**
 * Enum for IDP authentication types
 */
export const AuthIdp = {
  /** Employee, Shopper and Pass User logins */
  basic: 'basic',
  /** Employee to Shopper impersonation */
  e2s: 'e2s',
  /** Shopper to Shopper delegation */
  s2s: 's2s',
  /** Shopper to Shopper delegation, no products */
  s2snpr: 's2snpr',
  /** Shopper to Pass delegation */
  s2p: 's2p',
  /** Employee to Shopper to Shopper nested delegation */
  e2s2s: 'e2s2s',
  /** Employee to Shopper to Pass nested delegation) */
  e2s2p: 'e2s2p',
  /** Employee to Pass delegation */
  e2p: 'e2p',
  /** Certificate to Shopper authentication */
  cert2s: 'cert2s'
} as const;

/**
 * Enum for authentication risk levels
 */
export const AuthRisk = {
  low: 'low',
  medium: 'medium',
  high: 'high'
} as const;


export type AuthStatusType = typeof AuthStatus[keyof typeof AuthStatus];
export type AuthRealmType = typeof AuthRealm[keyof typeof AuthRealm];
export type AuthIdpType = typeof AuthIdp[keyof typeof AuthIdp];
export type AuthRiskType = typeof AuthRisk[keyof typeof AuthRisk];

/**
 * Retrieve fixed up SSO Login Url from PresentationCentral window globals
 */
function getLoginUrlFromWindow(
  /** Window object */
  window: Window,
  /** Additional sso query params */
  params?: Record<string, string | number> & {
    /** Predefined path */
    path?: string;
  },
  options?: PathOptions
): string;

/**
 * React hook that validates user authentication
 */
function useAuthState(authProps: AuthProps): AuthState;

/**
 * Make an HOC that adds a provider with auth key state and a dispatcher. This
 * can be used to wrap a top level React or a Next.js custom App component.
 */
function withAuthProvider<Props>(): (
  Component: ComponentType<Props>
) => ComponentType<Props>;

/**
 * HOC which wraps component with AuthRequired. Details are injected and the
 * getInitialProps method is attached by default.
 *
 * Using getInitialProps is more performant than getServerSideProps for page
 * transitions in the browser. Although it is most preferred, if you need to use
 * getServerSideProps for a page, you can disable getInitialProps from the HOC
 * in the options ({initialProps: false}).
 */
function withAuthRequired<Props>(
  hocProps: WithAuthProps
): (
  Component: ComponentType<Props & InjectedDetails>
) => ComponentType<Props>;

