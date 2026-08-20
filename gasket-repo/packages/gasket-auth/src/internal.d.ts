import type { NextPageContext } from 'next';
import type { MaybeAsync } from '@gasket/core';
import type { PCData } from '@godaddy/gasket-plugin-uxp';
import type { PCManifest } from '@gasket/plugin-uxp';
import type { ReactNode } from 'react';
import type { GasketData } from '@gasket/data';
import type {
  AuthParams,
  AuthProps,
  AuthState,
  AuthKey,
  AuthKeyState,
  LoginUrlParams,
  ComponentWithInitialProps,
  AuthContext
} from './index.d.ts';

/** Adds timestamps to keyAuthState from SSR pageProps */
export type init = (authKeyState: AuthKeyState) => AuthKeyState;

/** Add payload to state */
export type reducer = (
  /** Incoming state */
  state: AuthKeyState,
  /** State change action */
  action: { payload: AuthKeyState }
) => AuthKeyState;

export type ServerHandler_constructor = (options: {
  authProps: AuthProps;
  ctx: NextPageContext;
}) => void;

export type ServerHandler_getAuthState = () => MaybeAsync<AuthState>;

export type ServerHandler_getRedirectUrl = (authState: AuthState) => string;

export type ServerHandler_attemptRedirect = (authState: AuthState) => boolean;

/**
 * Pick keys from props to create AuthParams
 */
export type pickFromKeys = (props: AuthProps, keys: string[]) => AuthParams;

/** Pick out params used from request from props */
export type paramsFromProps = (props: AuthProps) => AuthParams;

/** Get a lookup key based on auth params */
export type getAuthKey = (authProps: AuthProps) => AuthKey;

/** Get the URL to the check auth endpoint */
export type getAuthCheckUrl = (
  authParams: AuthParams,
  gasketData?: GasketData & { basePath?: string }
) => string;

/** Find additional sso redirect params from host */
export type getParamsFromHost = (
  /** window or req host */
  host: string,
  /** Callback to determine subdomain query param based on host */
  subdomain: false | ((host: string) => string | false)
) => AuthParams | {};

/** Build the SSO login URL */
export type transformLoginUrl = (ssoUrl: string, params: LoginUrlParams) => string;

/** Redirect to SSO login */
export type redirectTo = (ssoUrl: string) => void;

/**
 * Parse the SSO Login Url from PresentationCentral globals data (v2) or select
 * from shared props (v3)
 */
export type parseLoginUrl = (pcData: PCManifest) => string;

/**
 * If hostname is other than godaddy.com or secureserver.net, fixup the sso
 * login url using hostname
 */
export type fixupLoginUrlDomain = (ssoUrl: string, host: string) => string;

/**
 * If hostname includes stg- or ote-, fixup the login url if internal sso site
 */
export type fixupLoginUrlEnv = (ssoUrl: string, host: string) => string;

/**
 * Extract query params from ssoUrl and attach to baseOverrideUrl if provided
 */
export type fixupLoginBaseSubstitution = (
  ssoUrl: string,
  baseOverrideUrl: string
) => string;

/**
 * Shortcut to executes the fixup login url functions
 */
export type fixupLoginUrl = (
  /** SSO Login URL as provided by PresentationCentral */
  ssoUrl: string,
  /** Hostname of the request */
  host: string,
  /** Url to override the base from ssoUrl while keeping query params */
  baseOverrideUrl: string
) => string;

/** Render the wrapped children and inject details of enabled */
export type validContent = (
  authProps: AuthProps,
  authState: AuthState
) => ReactNode;

/** Redirect to SSO, or render alt content if set */
export type invalidContent = (
  authProps: AuthProps,
  authState: AuthState
) => ReactNode;

/** Check user cookie for valid token */
export type fetchAuthState = (
  /** Params to check token against */
  authParams: AuthParams
) => Promise<AuthState>;

export type ClientHandler_constructor = (options: { authProps: AuthProps }) => void;

/**
 * Returns the current authState, or a promise with the next authState if not
 * dispatching. If the authKeyState is not provided by context, then the
 * singleton state will be used.
 */
export type ClientHandler_getAuthState = (
  /** State to reference */
  authKeyState: AuthKeyState,
  /** Function if dispatching */
  dispatch?: (action: unknown) => void
) => MaybeAsync<AuthState>;

/** Get the SSO login URL */
export type ClientHandler_getRedirectUrl = (authState: AuthState) => string;

/** Attempt to redirect to the SSO login URL if auth state not valid */
export type ClientHandler_attemptRedirect = (authState: AuthState) => boolean;

export type useAuthContext = () => AuthContext;

/** Sets up and attaches the getInitialProps static method */
export type attachGetInitialProps = <Props>(
  /** Component to attach */
  Component: ComponentWithInitialProps<Props>,
  /** Auth settings to init handler with */
  authProps: AuthProps
) => ComponentWithInitialProps<Props>;

/** Component which sets up providers and reducer hook */
export type Wrapper = <Props>(
  props: Props & { pageProps?: AuthContext }
) => ReactNode;

/** Create a dispatch action */
export type createAuthStateAction = (
  authKey: AuthKey,
  authState: AuthState
) => {
  payload: AuthKeyState;
};

/**
 * Retrieve fixed up SSO Login Url from PresentationCentral request globals
 */
export type getLoginUrlFromRequest = (
  pcData: PCData,
  params?: {
    [key: string]: string | number;
  },
  options?: {
    overrideUrl?: string;
    subdomain?: false | ((host: string) => string | false);
    host?: string;
  }
) => string;
