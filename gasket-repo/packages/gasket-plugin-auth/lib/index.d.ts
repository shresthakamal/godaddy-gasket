/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GasketConfig, Gasket, MaybeAsync, Plugin } from '@gasket/core';
import { GasketRequest, RequestLike } from '@gasket/request';
import type { AgentConfigOptions } from 'elastic-apm-node';

interface ExtendedAgentConfigOptions extends AgentConfigOptions {
  sensitiveCookies?: Array<string>;
}

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
  awsiam: 'awsiam',
  oauth: 'oauth'
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
};

export type AuthIdpType = typeof AuthIdp[keyof typeof AuthIdp];

/**
 * Enum for authentication risk levels
 */
export const AuthRisk = {
  low: 'low',
  medium: 'medium',
  high: 'high'
} as const;

type IdpCriteria = {
  /** Private label id, a.k.a. reseller ID */
  plid?: number;
};

export type RealmCriteria = {
  [AuthRealm.awsiam]: {
    /** Allowed *role* AWS IAM roles. */
    roles?: string[];
  };
  [AuthRealm.cert]: {
    /** Allowed *cert* common names. */
    certs?: string[];
  };
  [AuthRealm.jomax]: {
    /** Allowed *jomax* admin groups */
    groups?: string | string[];
  };
  [AuthRealm.pass]: {};
  [AuthRealm.idp]: IdpCriteria;
  [AuthRealm.idpInt]: IdpCriteria;
  [AuthRealm.oauth]: {
    /** Allowed *oauth* scopes; at least one must be present on the token. */
    scopes?: string[];
  };
};

type PrivateLabelDetails = {
  plid: number;
};

export type IdpDetails = PrivateLabelDetails & {
  /**
   * The legacy ID for the customer; this is considered PII, and you should use
   * customerId instead whenever possible.
   */
  shopperId: string;
  /** @deprecated Use customerId instead */
  cid: string;
  /** The UUID identifier for the customer */
  customerId: string;
  /** Universal Contact ID in a delegation claim */
  ucid?: string;
  /** The type of reseller the shopper belongs to */
  privateLabelType?: number;
  /** Type of IDP authentication */
  type: AuthIdpType | AuthIdpType[]
};

export interface OauthDetails {
  /** The OAuth client identifier from the token */
  clientId?: string;
  /** The scopes granted to the token */
  scopes?: string[];
}

export type RealmDetails = {
  [AuthRealm.awsiam]: {
    /** The IAM role of the caller */
    role: string;
  };
  [AuthRealm.cert]: {
    /** The common name of the certificate used for auth */
    cert: string;
  };
  [AuthRealm.jomax]: {
    /** Jomax username */
    accountName: string;
    /** Jomax Active Directory groups for the user */
    groups: Array<string>;
  };
  [AuthRealm.pass]: PrivateLabelDetails & {
    /** The PASS ID */
    passId: string;
  };
  [AuthRealm.idp]: IdpDetails;
  [AuthRealm.idpInt]: IdpDetails;
  [AuthRealm.oauth]: OauthDetails;
};

export type AuthRealmType = typeof AuthRealm[keyof typeof AuthRealm];
export type AuthRiskType = typeof AuthRisk[keyof typeof AuthRisk];

/**
 * Criteria for authentication
 */
type AuthParams<T extends AuthRealmType> = RealmCriteria[T] & {
  /** Where the token should originate from. i.e. `idp` or `jomax` */
  realm?: T;
  /** Risk level for *idp* tokens */
  risk?: AuthRiskType;
  /** Allowed *idp* token types */
  type?: AuthIdpType | AuthIdpType[];
  /** perform heartbeat request when VAT is expired */
  allowHeartbeat?: boolean;
  /** Use the new 12-hour expiration policy for IDP tokens with `per=true` at security levels 1-3 */
  use12HourExpiration?: boolean;
};

type ApiProxy = {
  /** Hostname of the API proxy your app is using (do not include the scheme) */
  host: string;
  /**
   * Contents of the client cert your app uses to authenticate with the API
   * Proxy
   */
  cert: string;
  /**
   * Contents of the client cert's key your app uses to authenticate with the
   * API Proxy
   */
  key: string;
};

type AuthConfig<T extends AuthRealmType> = AuthParams<T> & {
  /**
   * Set if app is not using `uxp-plugin`. Defaults to app from
   * `presentationCentral` params.
   */
  appName?: string;
  /**
   * Set if the app is served under a path from the domain.
   */
  basePath?: string;
  /**
   * Set if the app requires going through an API proxy for SSO.
   */
  apiProxy?: ApiProxy;
  /** Authentication host name */
  host?: string[];
  /**
   * Enable the new FFI-based authentication library (experimental)
   */
  useFFILibrary?: boolean;
  /**
   * Client identifier for FFI library (required when useFFILibrary is true)
   */
  client?: string;
  /**
   * PCP identifier for FFI library (required when useFFILibrary is true)
   */
  pcpId?: string;
  /**
   * OAuth resource-server validation config for the `oauth` realm.
   */
  oauth?: {
    /** OAuth issuer URL. Defaults per-env from the built-in map. */
    oauthIssuer?: string;
    /**
     * Expected audience (resource identifier). When omitted, audience
     * validation is disabled and any well-formed token from the issuer is
     * accepted (tokens for other services can be replayed against this one).
     * Set to restrict tokens to this service.
     */
    oauthAudience?: string;
  };
  /**
   * Route-specific authentication configuration
   */
  authRoutes?: {
    [route: string]: {
      /** Authentication parameters for route protection */
      params?: AuthParams<T>;
    };
  };
};

export type AuthOptions<T extends AuthRealmType> = AuthParams<T>;

export interface AuthData {
  /**
   * A simple message about what the event is. In the case of auth failure, this
   * will be the reason for failure
   */
  message: string;
  /**
   * The HTTP request object
   */
  req: GasketRequest;
  /**
   * True if auth succeeded, False for any authentication/authorization failure
   */
  success: boolean;
  /**
   * The object may contain additional data about the event
   */
  [key: string]: any;
}

export type AuthResponse<T extends AuthRealmType> =
  | {
    /** Is user token valid for auth params */
    valid: true;
    /** The auth realm that was validated */
    realm: T;
    /** Valid auth extra details */
    details: RealmDetails[T];
  }
  | {
    /** Is user token valid for auth params */
    valid: false;
    /** Invalid error message */
    reason: string;
    /** Invalid code to pass along to SSO */
    authReason: number;
  };

type checkAuthFn = <T extends AuthRealmType>(params: AuthParams<T>) => Promise<AuthResponse<T>>;

declare module '@gasket/core' {
  interface GasketConfig {
    auth?: Partial<AuthConfig<AuthRealmType>>;
  }

  export interface GasketActions {
    getCheckAuth<T extends AuthRealmType>(req: RequestLike): checkAuthFn<T>,
    checkAuth<T extends AuthRealmType>(req: RequestLike, params: AuthParams<T>): Promise<AuthResponse<T>>,
    checkShopperAuth(req: RequestLike): Promise<AuthResponse<AuthRealm.idp>>,
    getAuthToken(req: RequestLike, realm: AuthRealmType): Promise<string | undefined>;
  }

  export interface HookExecTypes {
    authChecked(authData: AuthData): MaybeAsync<void>;
  }

  type ExtendedPlugin = Plugin & {
    AuthRealm;
    AuthRisk;
    AuthIdp;
  };
}

declare module 'express' {
  interface Request {
    id?: string;
    gdAuth?: {
      token: string;
      jwt: {
        jomax: {
          isExpired: boolean;
        };
      };
      reauthReason: number;
    };
  }

  interface Response {
    locals: {
      gasketData: Record<string, any>;
      visitor?: {
        plid?: number;
        hostname?: string;
      };
    };
  }
}

export default {
  name: '@godaddy/gasket-plugin-auth',
  hooks: {}
};
