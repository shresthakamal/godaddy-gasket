import { GdAuth } from 'gd-auth';
import { GdAuth as FFIGdAuth } from '@godaddy/gd-auth-lib';

/** @type {import('./index.js').GdAuthManager} */
class GdAuthManager {
  constructor() {
    this.gdAuthCache = new Map();
  }

  getType(config) {
    if (config.options?.realm) {
      return config.options.realm;
    }
    return config.cert || config.certFile || config.devCert ? 'cert' : 'awsiam';
  }

  getAppName(gasket) {
    const { config } = gasket;
    const { auth: { appName } } = config;

    if (!appName) {
      throw new Error('auth.appName is not configured in gasket.config');
    }

    return appName;
  }

  /**
   * Generate cache key for GdAuth instances
   * @private
   * @param {string} key - Base key
   * @param {boolean} useFFILibrary - Whether FFI library is being used
   * @returns {string} Cache key
   */
  _generateCacheKey(key, useFFILibrary = false) {
    return key + (useFFILibrary ? '-ffi' : '');
  }

  // eslint-disable-next-line complexity
  setGdAuthInstance(gasket, key, jwtConfig) {
    const useFFILibrary = gasket.config.auth?.useFFILibrary || false;
    const cacheKey = this._generateCacheKey(key, useFFILibrary);

    if (useFFILibrary) {
      const { auth } = gasket.config;
      const { env } = gasket.config;

      // Validate required FFI configuration
      if (!auth?.pcpId) {
        if (env === 'development' || env === 'local') {
          // Allow default for local development but warn
          gasket.logger?.warn(
            'FFI Library: pcpId not configured. Using default value for local development. ' +
            'This should be configured for production environments.'
          );
        } else {
          throw new Error(
            'FFI Library: pcpId is required when useFFILibrary is enabled. ' +
            'Please configure auth.pcpId in gasket.config.js'
          );
        }
      }

      if (!auth?.client) {
        gasket.logger?.warn(
          'FFI Library: client not configured. Using default value "gasket". ' +
          'Consider configuring auth.client in gasket.config.js'
        );
      }

      const ffiAuth = new FFIGdAuth();
      ffiAuth.setAppConfig({
        app: this.getAppName(gasket),
        client: auth?.client || 'gasket',
        pcpId: auth?.pcpId || (env === 'development' || env === 'local' ? '12345' : null),
        testMode: env === 'test' || false
      });
      this.gdAuthCache.set(cacheKey, ffiAuth);
    } else {
      this.gdAuthCache.set(cacheKey, new GdAuth({ app: this.getAppName(gasket), type: this.getType(jwtConfig) }));
    }
  }

  getGdAuthInstance(key, useFFILibrary = false) {
    const cacheKey = this._generateCacheKey(key, useFFILibrary);
    return this.gdAuthCache.get(cacheKey);
  }
}

export default GdAuthManager;
