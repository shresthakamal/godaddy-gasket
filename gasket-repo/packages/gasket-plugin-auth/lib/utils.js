/**
 * Ensure that the object is an array, if not, wrap it in an array.
 * @param {object | Array} obj - Object to ensure is an array
 * @returns {Array} obj
 */
export function ensureArray(obj) {
  if (!obj) return obj;
  return !Array.isArray(obj) ? [obj] : obj;
}

/**
 * Convert an object to a string key.
 * @type {import('./internal').objToKey}
 */
export function objToKey(options) {
  return JSON.stringify(options);
}

const isDevOrLocal = /dev|local/i;
const isTest = /test/i;
const isStg = /sta?g/i;
const isOte = /ote/i;

/**
 * Resolve a gasket top-level environment string to a canonical env key,
 * used to look up per-env defaults (e.g. `hosts`, `oauthIssuerEnvKeys`).
 * @type {import('./internal').resolveEnvKey}
 */
export function resolveEnvKey(env) {
  if (isTest.test(env)) return 'test';
  if (isStg.test(env)) return 'stg';
  if (isOte.test(env)) return 'ote';
  if (isDevOrLocal.test(env)) return 'dev';
  return 'prod';
}

/**
 * Ensures that the id is a number, not a string, if set.
 * @type {import('./internal').toInt}
 */
export function toInt(value) {
  return parseInt(value, 10);
}

/**
 * Enum for authentication realms
 * @readonly
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
};

/**
 * Enum for IDP authentication types
 * @readonly
 */
export const AuthIdp = {
  basic: 'basic',
  e2s: 'e2s',
  s2s: 's2s',
  s2snpr: 's2snpr',
  s2p: 's2p',
  e2s2s: 'e2s2s',
  e2s2p: 'e2s2p',
  e2p: 'e2p',
  cert2s: 'cert2s'
};

/**
 * Enum for authentication risk levels
 * @readonly
 */
export const AuthRisk = {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

export const typeDefaults = {
  [AuthRealm.jomax]: ['basic'],
  [AuthRealm.idp]: ['basic', 'e2s', 'e2s2s', 's2s'],
  [AuthRealm.idpInt]: ['basic', 'e2s', 'e2s2s', 's2s'],
  [AuthRealm.pass]: ['basic'],
  [AuthRealm.awsiam]: ['basic'],
  [AuthRealm.cert]: ['basic'],
  [AuthRealm.oauth]: ['basic']
};
