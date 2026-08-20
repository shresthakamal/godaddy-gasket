import * as utils from './utils.js';

const cspHeader = 'Content-Security-Policy';

/** @type {import('@gasket/core').ActionHandler<'insertCspHash'>} */
export function insertCspHash(gasket, res, type, cspHash) {
  gasket.logger.warn(
    'insertCspHash action is deprecated and will be removed in a future version. ' +
    'Consider using helmet\'s built-in CSP configuration directly.'
  );
  const value = res.getHeader(cspHeader);
  if (!value || typeof value !== 'string') return;

  const parsed = utils.parseDirectives(value);
  const arr = parsed[type] || [];
  // Adding a hash will invalidate 'unsafe-inline'.
  // Remove 'unsafe-inline' from policy before adding hashes
  if (!arr.includes("'unsafe-inline'")) {
    parsed[type] = [...arr, cspHash];
    res.setHeader(cspHeader, utils.stringifyDirectives(parsed));
  }
}

/** @type {import('@gasket/core').ActionHandler<'addCspNonce'>} */
export function addCspNonce(gasket, res, type = 'script-src') {
  gasket.logger.warn(
    'addCspNonce action is deprecated and will be removed in a future version. ' +
    'Consider using helmet\'s built-in CSP configuration directly.'
  );
  const value = res.getHeader(cspHeader);
  if (!value || typeof value !== 'string') return;

  const parsed = utils.parseDirectives(value);
  const arr = parsed[type] || [];
  // Adding a nonce will invalidate 'unsafe-inline'.
  // Remove 'unsafe-inline' from policy before adding nonce
  if (!arr.includes("'unsafe-inline'")) {
    const nonce = utils.createNonce();
    arr.push(nonce.directive);
    parsed[type] = arr;
    res.setHeader(cspHeader, utils.stringifyDirectives(parsed));
    return nonce.value;
  }
}

/** @type {import('@gasket/core').ActionHandler<'addCspHash'>} */
export function addCspHash(gasket, res, type, ...contents) {
  gasket.logger.warn(
    'addCspHash action is deprecated and will be removed in a future version. ' +
    'Consider using helmet\'s built-in CSP configuration directly.'
  );
  contents.forEach(content => {
    gasket.actions.insertCspHash(res, type, utils.createHash(content).directive);
  });
}
