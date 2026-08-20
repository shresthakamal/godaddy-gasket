import { withGasketRequestCache } from '@gasket/request';
import { objToKey, AuthRealm } from './utils.js';
import {
  validateJomax, validatePass, validateCert, validateAwsIam, validateIdp, validateOauth
} from './check-auth-validators.js';
import { fixupAuthOptions, fixupValidateOptions, getAppName, logAuthChecked } from './check-auth-helpers.js';

/** @type {typeof import('./internal').prepareForRequest} */
const prepareForRequest = withGasketRequestCache(async (gasket, req) => {
  // avoid multiple checks for the same query options for the same request
  const reqCache = new Map();

  return async function authCheckHandler(options) {
    const authConfig = gasket.config.auth;
    const authOptions = fixupAuthOptions(options, authConfig);

    const cacheKey = objToKey(authOptions);
    if (reqCache.has(cacheKey)) {
      return reqCache.get(cacheKey);
    }

    const performAuthCheck = async () => {
      const visitor = await gasket.actions.getVisitor(req);
      const { realm, groups, certs, roles, scopes } = authOptions;
      const appName = getAppName(gasket, visitor.hostname);
      const validateOptions = fixupValidateOptions(authOptions, authConfig, appName, visitor);

      try {
        switch (realm) {
          case AuthRealm.jomax:
            return await validateJomax(validateOptions, req, groups, gasket);
          case AuthRealm.pass:
            return await validatePass(validateOptions, req, gasket);
          case AuthRealm.cert:
            return await validateCert(validateOptions, req, certs, gasket);
          case AuthRealm.awsiam:
            return await validateAwsIam(validateOptions, req, roles, gasket);
          case AuthRealm.idp:
          case AuthRealm.idpInt:
            return await validateIdp(validateOptions, req, groups, gasket);
          case AuthRealm.oauth:
            return await validateOauth(validateOptions, req, scopes, gasket);
          default:
            throw new Error(`Invalid realm (${realm})`);
        }
      } catch (err) {
        return {
          valid: false,
          realm,
          authReason: err.ssoCode,
          reason: err.message
        };
      }
    };

    const check = performAuthCheck();
    reqCache.set(cacheKey, check);
    check.then((result) => {
      reqCache.set(cacheKey, result);
      logAuthChecked(gasket, req, result, authOptions);
    });

    return check;
  };
});

/** @type {import('./internal').makeCheckAuth} */
function makeCheckAuth(gasket, req) {
  return async function checkAuth(authOptions = {}) {
    const authCheckHandler = await prepareForRequest(gasket, req);
    return await authCheckHandler(authOptions);
  };
}

export {
  makeCheckAuth,
  fixupAuthOptions,
  fixupValidateOptions,
  getAppName
};
