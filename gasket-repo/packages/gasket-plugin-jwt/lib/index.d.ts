import type { Gasket } from '@gasket/core';

/** Options for AWS IAM configuration */
type IAMConfigOptions = {
  /** The primary AWS region to target when retrieving an IAM JWT */
  primaryRegion?: string;
  /** The secondary AWS region to target when retrieving an IAM JWT, if the primary region fails */
  secondaryRegion?: string;
  /** Additional options for IAM configuration */
  [key: string]: any;
}

/** Configuration for AWS IAM credentials */
type IAMConfig = {
  /** The SSO host to target */
  ssoHost: string;
  /** Cache TTL for the JWT produced by this config */
  ttl?: number;
  /** Options for IAM configuration */
  options?: IAMConfigOptions;
}

/** Options for Certificate configuration */
type CertConfigOptions = {
  /** The SSO realm to target */
  realm?: string;
  /** The id of the user to delegate to  */
  subordinateUser?: number | string;
  /** Additional options for Cert configuration */
  [key: string]: any;
}

/** Configuration for Certificate credentials */
type CertConfig = {
  /** The SSO host to target */
  ssoHost: string;
  /** Path to certificate public key in pem format. */
  certFile?: string;
  /** Path to certificate private key in pem format. */
  keyFile?: string;
  /** Loaded public key in pem format. */
  cert?: string;
  /** Loaded private key in pem format. */
  key?: string;
  /** Dev cert common name */
  devCert?: string;
  /** Cache TTL for the JWT produced by this config */
  ttl?: number;
  /** Options passed to SSO API */
  options?: CertConfigOptions
}

/** FFI Library configuration options */
type FFILibraryOptions = {
  /** Security level for authentication (FFI library) - preferred over riskLevel */
  securityLevel?: number;
  /** Risk level for authentication (FFI library) - deprecated, use securityLevel */
  riskLevel?: number;
  /** Authentication methods array (FFI library) */
  auths?: number[];
  /** Authentication type (FFI library) */
  authType?: string;
}

/** Value types that can be used in JwtConfig */
type JwtConfigValue = IAMConfig & CertConfig & FFILibraryOptions;

/** JwtConfig structure */
type JwtConfig = {
  [key: string]: JwtConfigValue;
}

export function fetchJwt(gasket: Gasket, config: JwtConfigValue): Promise<string>;
export function getToken(ssoHost: string, cert: string, key: string, options?: CertConfigOptions): Promise<string>;
export function fetchJwtFromIamTokenClient(config: IAMConfig): Promise<string>;
export function fetchJwtFromCertFile(config: CertConfig): Promise<string>;
export function fetchJwtFromCert(config: CertConfig): Promise<string>;
export function fetchJwtFromDevCert(gasket: Gasket, config: CertConfig): Promise<string>;

/**
 * Class representing the GdAuthManager.
 */
export class GdAuthManager {
  gdAuthCache: Map<string, any>;

  /**
   * Create a GdAuthManager.
   */
  constructor();

  /**
   * Get the type of authentication based on the configuration.
   * @param {object} config - The JWT configuration.
   * @param {object} config.options - The options object.
   * @param {string} config.options.realm - The realm option.
   * @param {string} config.cert - The certificate.
   * @param {string} config.certFile - The certificate file.
   * @param {string} config.devCert - The development certificate.
   * @returns {string} The type of authentication.
   */
  getType(config: CertConfigOptions | IAMConfigOptions): string;

  /**
   * Get the application name from the gasket configuration.
   * @param {object} gasket - The gasket object.
   * @param {object} gasket.config - The gasket configuration.
   * @param {object} gasket.config.auth - The authentication configuration.
   * @param {string} gasket.config.auth.appName - The application name.
   * @returns {string} The application name.
   * @throws Will throw an error if the application name is not configured.
   */
  getAppName(gasket: Gasket): string;

  /**
   * Set the GdAuth instance in the cache.
   * @param {object} gasket - The gasket object.
   * @param {string} key - The cache key.
   * @param {object} jwtConfig - The JWT configuration.
   */
  setGdAuthInstance(gasket: Gasket, key: string, jwtConfig: JwtConfig): void;

  /**
   * Get the GdAuth instance from the cache.
   * @param {string} key - The cache key.
   * @returns {any} The GdAuth instance.
   */
  getGdAuthInstance(key: string): any;
}
/** Authentication configuration */
type AuthConfig = {
  /** Application name for authentication */
  appName?: string;
  /** Enable FFI library usage */
  useFFILibrary?: boolean;
  /** Client identifier for FFI library */
  client?: string;
  /** PCP identifier for FFI library */
  pcpId?: string;
  /** Additional auth properties */
  [key: string]: any;
}

/** Add JWT Plugin functionality to '@gasket/core' */
declare module '@gasket/core' {
  export interface GasketConfig {
    jwt?: JwtConfig;
    auth?: AuthConfig;
  }

  /** Provides Gasket Actions for the JWT Plugin */
  export interface GasketActions {
    /**
     * Retrieves a JWT for the given key from the Gasket Config.
     * @param {string} key - The key associated with the `jwt` configuration.
     * @returns {Promise<string>} A Promise resolving to the JWT.
     * @throws {Error} Throws an error if no JWT configuration is found for the provided key
     */
    getJwt(key: string): Promise<string>;
  }
}

export const name = '@godaddy/gasket-plugin-jwt';

export default {
  name: name,
  hooks: {}
};
