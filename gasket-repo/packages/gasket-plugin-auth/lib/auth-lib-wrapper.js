/**
 * Wrapper module to handle switching between gd-auth and @godaddy/gd-auth-lib
 * based on the useFFILibrary feature flag
 */

import { GdAuth as LegacyGdAuth } from 'gd-auth';
import { resolveEnvKey } from './utils.js';

// Maps a gasket env to a key of the `OAuthIssuer` enum in the FFI library.
const oauthIssuerEnvKeys = {
  dev: 'Dev',
  test: 'Test',
  ote: 'Ote',
  stg: 'Prod', // staging shares issuer with prod
  prod: 'Prod'
};

// Lazy load FFI library to avoid issues when not needed
let FFIGdAuth, SecurityLevel, AuthType, Auths, OAuthIssuer;
let ffiLibraryPromise = null;

/**
 * Lazy load the FFI library to avoid loading it when not needed
 * @returns {Promise<object>} The loaded FFI library components
 */
async function loadFFILibrary() {
  if (!ffiLibraryPromise) {
    ffiLibraryPromise = (async () => {
      // Use dynamic import for ES6 modules
      const ffiLib = await import('@godaddy/gd-auth-lib');
      FFIGdAuth = ffiLib.GdAuth;
      SecurityLevel = ffiLib.SecurityLevel;
      AuthType = ffiLib.AuthType;
      Auths = ffiLib.Auths;
      OAuthIssuer = ffiLib.OAuthIssuer;
      return { FFIGdAuth, SecurityLevel, AuthType, Auths, OAuthIssuer };
    })();
  }
  return ffiLibraryPromise;
}

/**
 * Resolve the OAuth issuer URL, preferring an explicitly configured value and
 * otherwise defaulting per-env from the gd-auth-lib `OAuthIssuer` enum (the
 * single source of truth for issuer URLs).
 * @type {import('./internal').resolveOauthIssuer}
 */
function resolveOauthIssuer(options, oauthIssuerEnum) {
  if (options.oauthIssuer) return options.oauthIssuer;
  const issuer = oauthIssuerEnum?.[oauthIssuerEnvKeys[resolveEnvKey(options.env)]];
  if (!issuer) {
    throw new Error('Unable to resolve OAuth issuer from the gd-auth-lib OAuthIssuer enum');
  }
  return issuer;
}

// Map old risk levels to new ones (will be populated when FFI library is loaded)
let riskLevelMap = {};

/**
 * Wrapper class for GdAuth that switches between old and new implementations
 */
class GdAuthWrapper {

  constructor(options = {}) {
    this.useFFI = options.useFFILibrary || false;
    this.options = options;
    this.authInstance = null;
    this.initialized = false;

    if (!this.useFFI) {
      // Initialize legacy auth immediately since it's synchronous
      // Pass useNewExpiration to legacy library (defaulted to true upstream)
      const legacyOptions = {
        ...options,
        useNewExpiration: options.useNewExpiration
      };
      this.authInstance = new LegacyGdAuth(legacyOptions);
      this.initialized = true;
    }
    // FFI initialization will be deferred to first use
  }

  /**
   * Initialize FFI library if needed
   * @private
   * @returns {Promise<void>}
   */
  async _initializeFFI() {
    if (this.initialized || !this.useFFI) {
      return;
    }

    const { FFIGdAuth: LoadedFFIGdAuth, SecurityLevel: LoadedSecurityLevel } = await loadFFILibrary();

    this.authInstance = new LoadedFFIGdAuth();

    // The oauth realm authenticates client-credentials tokens against an
    // issuer/audience and has no SSO app identity (no pcpId) or risk level, so
    // skip the SSO-specific risk mapping and app-config setup.
    if (this.options.realm !== 'oauth') {
      this._initializeSsoConfig(LoadedSecurityLevel);
    }

    this.initialized = true;
  }

  /**
   * Initialize SSO-specific FFI state: the risk-level map and global app config.
   * Only applies to the SSO realms (not oauth).
   * @private
   * @param {object} LoadedSecurityLevel - SecurityLevel enum from the FFI library
   * @returns {void}
   */
  _initializeSsoConfig(LoadedSecurityLevel) {
    // Initialize risk level mapping
    riskLevelMap = {
      none: LoadedSecurityLevel.NONE,
      low: LoadedSecurityLevel.LOW,
      medium: LoadedSecurityLevel.MEDIUM,
      high: LoadedSecurityLevel.HIGH
    };

    // Set global app config once - this contains app-level settings
    if (!this.options.app) {
      return;
    }

    // Validate required FFI configuration
    if (!this.options.pcpId) {
      if (this.options.env === 'development' || this.options.env === 'local') {
        // Allow default for local development but warn
        if (this.options.logger) {
          this.options.logger.warn(
            'FFI Library: pcpId not configured. Using default value for local development. ' +
            'This should be configured for production environments.'
          );
        }
      } else {
        throw new Error(
          'FFI Library: pcpId is required when useFFILibrary is enabled. ' +
          'Please configure auth.pcpId in gasket.config.js'
        );
      }
    }
    if (!this.options.client && this.options.logger) {
      this.options.logger.warn(
        'FFI Library: client not configured. Using default value "gasket". ' +
        'Consider configuring auth.client in gasket.config.js'
      );
    }
    // Set global app configuration once - shared across all requests
    this.authInstance.setAppConfig({
      app: this.options.app,
      client: this.options.client || 'gasket',
      pcpId: this.options.pcpId || (this.options.env === 'development' || this.options.env === 'local' ? '12345' : null),
      testMode: this.options.testMode || false
    });
  }

  /**
   * Authenticate a token
   * @param {string} host - The host to authenticate against
   * @param {string} token - The JWT token
   * @param {number|string} risk - Risk level
   * @returns {Promise<object>} Authentication result
   */
  // eslint-disable-next-line max-statements
  async authenticate(host, token, risk) {
    if (this.useFFI) {
      await this._initializeFFI();

      const {
        SecurityLevel: LoadedSecurityLevel,
        AuthType: LoadedAuthType,
        Auths: LoadedAuths,
        OAuthIssuer: LoadedOAuthIssuer
      } = await loadFFILibrary();

      if (this.options.realm === 'oauth') {
        const tokenClaims = this.authInstance.parseToken(token, {
          oauth: {
            oauthIssuer: resolveOauthIssuer(this.options, LoadedOAuthIssuer),
            oauthAudience: this.options.oauthAudience
          }
        });
        if (!this.authInstance.isOauth(tokenClaims)) {
          throw new Error('Token is not an OAuth access token');
        }
        return {
          oauth: true,
          clientId: this.authInstance.getClaim(tokenClaims, 'client_id')
            ?? this.authInstance.getClaim(tokenClaims, 'sub'),
          scope: this.authInstance.getClaim(tokenClaims, 'scope'),
          tokenClaims
        };
      }

      // Map old risk format to new format
      const riskLevel = typeof risk === 'string'
        ? riskLevelMap[risk.toLowerCase()]
        : risk;

      // Auth options from incoming request - these are per-request parameters
      // For gd-auth-lib >= 0.13.2, use nested structure with godaddySso
      const authOptions = {
        godaddySso: {
          host,
          securityLevel: riskLevel ?? LoadedSecurityLevel.LOW,
          auths: this.options.auths ?? [LoadedAuths.BASIC],
          authType: this.options.type ?? LoadedAuthType.IDP,
          allowHeartbeat: this.options.allowHeartbeat ?? false,
          filterByAuthType: true
        }
        // Note: omit 'oauth' key to disable OAuth validation
      };

      const tokenClaims = this.authInstance.parseToken(token, authOptions);

      // Verify authentication
      if (!this.authInstance.verifyTokenAuth(tokenClaims, authOptions.godaddySso.auths)) {
        throw new Error('Token authentication failed');
      }

      // Return result in compatible format with old library
      const payload = this.authInstance.getPayload(tokenClaims);

      // Create a result object that mimics the old library's JWT response
      const result = {
        ...payload,
        tokenClaims,
        auth: authOptions.godaddySso.authType,
        // Add methods expected by validators
        getShopperPayload: () => ({
          plid: payload.plid,
          cid: payload.cid || this.authInstance.getCustomerId(tokenClaims),
          shopperId: this.authInstance.getShopperId(tokenClaims),
          plt: payload.plt
        }),
        getJomaxPayload: () => ({
          accountName: this.authInstance.getAccountName(tokenClaims) || payload.accountName
        }),
        getPassPayload: () => ({
          passId: this.authInstance.getPassId(tokenClaims) || payload.passId
        }),
        getCertPayload: () => ({
          cn: this.authInstance.getCommonName(tokenClaims) || payload.cn
        }),
        getAwsIamPayload: () => ({
          sub: this.authInstance.getAwsIamArn(tokenClaims) || payload.sub
        }),
        ucid: payload.ucid
      };

      // Add user-specific fields
      if (this.authInstance.isShopper(tokenClaims)) {
        result.shopper_id = this.authInstance.getShopperId(tokenClaims);
        result.customer_id = this.authInstance.getCustomerId(tokenClaims);
      } else {
        result.username = this.authInstance.getUsername(tokenClaims);
        result.common_name = this.authInstance.getCommonName(tokenClaims);
      }

      return result;
    } else {
      if (this.options.realm === 'oauth') {
        throw new Error('oauth realm requires the gd-auth-lib FFI path (useFFILibrary: true)');
      }
      // Use legacy authentication
      return await this.authInstance.authenticate(host, token, risk);
    }
  }

  /**
   * Check if a token represents a shopper
   * @param {object} tokenOrClaims - Token or claims object
   * @returns {boolean} True if shopper
   */
  isShopper(tokenOrClaims) {
    if (this.useFFI && tokenOrClaims.tokenClaims) {
      return this.authInstance.isShopper(tokenOrClaims.tokenClaims);
    }
    return false; // Legacy library doesn't have this method directly
  }

  /**
   * Check if a token is a Jomax token
   * @param {object} tokenOrClaims - Token or claims object
   * @returns {boolean} True if Jomax
   */
  isJomax(tokenOrClaims) {
    if (this.useFFI && tokenOrClaims.tokenClaims) {
      return this.authInstance.isJomax(tokenOrClaims.tokenClaims);
    }
    return false; // Legacy library doesn't have this method directly
  }

  /**
   * Get employee groups
   * @param {object} tokenOrClaims - Token or claims object
   * @param {string} host - Host name
   * @returns {string[]} Array of groups
   */
  getEmployeeGroups(tokenOrClaims, host) {
    if (this.useFFI && tokenOrClaims.tokenClaims) {
      return this.authInstance.getEmployeeGroups(tokenOrClaims.tokenClaims, host);
    }
    return []; // Legacy library doesn't have this method directly
  }
}

// Static properties for compatibility
GdAuthWrapper.risk = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3
};

// Lazy getters for FFI constants
let _ffiConstants = null;
/**
 * Get FFI constants
 * @returns {Promise<object>} FFI constants object
 */
async function getFfiConstants() {
  if (!_ffiConstants) {
    const ffiLib = await import('@godaddy/gd-auth-lib');
    _ffiConstants = {
      SecurityLevel: ffiLib.SecurityLevel,
      AuthType: ffiLib.AuthType,
      Auths: ffiLib.Auths
    };
  }
  return _ffiConstants;
}

export {
  GdAuthWrapper,
  getFfiConstants,
  // Export legacy risk for backward compatibility
  LegacyGdAuth
};

// Export legacy risk for backward compatibility
export const LegacyRisk = LegacyGdAuth.risk;
