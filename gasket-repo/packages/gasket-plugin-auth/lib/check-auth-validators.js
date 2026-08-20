import { toInt } from './utils.js';
import { performAuthenticate, fetchJomaxGroups, validateGroups } from './check-auth-helpers.js';


/**
 * For documentation on Token Claims and available properties, see:
 * https://godaddy-corp.atlassian.net/wiki/spaces/AUTH/pages/89653651/Token+Claims
 * @type {import('./internal').validateIdp}
 */
async function validateIdp(options, req, expectedGroups, gasket) {
  const jwt = await performAuthenticate(options, req, gasket);
  const payload = jwt.getShopperPayload();

  /** @type {import('./index').IdpDetails} */
  const details = {
    type: jwt.auth,
    plid: toInt(payload.plid),
    customerId: payload.cid,
    cid: payload.cid,
    shopperId: payload.shopperId,
    privateLabelType: payload.plt
  };

  if (jwt.auth.startsWith('e2')) {
    if (expectedGroups?.length) {
      const groups = await fetchJomaxGroups(options, req);
      validateGroups(expectedGroups, groups);
    }

    // Universal Customer ID
    if (jwt.ucid) {
      details.ucid = jwt.ucid;
    }
  }

  if (
    options.plid &&
    options.host.includes('secureserver.net') &&
    options.plid !== details.plid
  ) {
    throw new Error(`Mismatched plid from query (${options.plid}) to token (${payload.plid})`);
  }

  return {
    valid: true,
    realm: options.type,
    details
  };
}

/** @type {import('./internal').validateJomax} */
async function validateJomax(options, req, expectedGroups, gasket) {
  const jwt = await performAuthenticate(options, req, gasket);
  const payload = jwt.getJomaxPayload();

  const groups = await fetchJomaxGroups(options, req);
  if (expectedGroups?.length) {
    validateGroups(expectedGroups, groups);
  }

  return {
    valid: true,
    realm: options.type,
    details: {
      accountName: payload.accountName,
      groups
    }
  };
}

/** @type {import('./internal').validatePass} */
async function validatePass(options, req, gasket) {
  const jwt = await performAuthenticate(options, req, gasket);
  const payload = jwt.getPassPayload();

  return {
    valid: true,
    realm: options.type,
    details: {
      passId: payload.passId
    }
  };
}

/** @type {import('./internal').validateCert} */
async function validateCert(options, req, expectedCerts, gasket) {
  const jwt = await performAuthenticate(options, req, gasket);
  const payload = jwt.getCertPayload();
  const cert = payload.cn;
  const testCert = cert.toLowerCase();

  if (expectedCerts?.length && !expectedCerts.some(expected => expected.toLowerCase() === testCert)) {
    throw new Error(`Unauthorized certificate (${cert})`);
  }

  return {
    valid: true,
    realm: options.type,
    details: {
      cert
    }
  };
}

/** @type {import('./internal').validateAwsIam} */
async function validateAwsIam(options, req, expectedRoles, gasket) {
  const jwt = await performAuthenticate(options, req, gasket);
  const payload = jwt.getAwsIamPayload();
  const role = payload.sub;
  const testRole = role.toLowerCase();

  if (expectedRoles?.length && !expectedRoles.some(expected => expected.toLowerCase() === testRole)) {
    throw new Error(`Unauthorized IAM Role (${role})`);
  }

  return {
    valid: true,
    realm: options.type,
    details: {
      role
    }
  };
}

/** @type {import('./internal').validateOauth} */
async function validateOauth(options, req, expectedScopes, gasket) {
  const result = await performAuthenticate(options, req, gasket);

  const scopes = typeof result.scope === 'string' ? result.scope.split(/\s+/).filter(Boolean) : [];
  if (expectedScopes?.length && !expectedScopes.some(scope => scopes.includes(scope))) {
    throw new Error(`Missing required scope (need one of: ${expectedScopes.join(', ')})`);
  }

  return {
    valid: true,
    realm: options.realm,
    details: {
      clientId: result.clientId,
      scopes
    }
  };
}

export {
  validateIdp,
  validateJomax,
  validatePass,
  validateCert,
  validateAwsIam,
  validateOauth
};
