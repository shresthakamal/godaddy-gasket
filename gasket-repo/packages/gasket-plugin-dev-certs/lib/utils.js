import { SNI_DEFAULTS } from './constants.js';

/**
 * Get the default sni config
 * @param {import('@gasket/core').Gasket} gasket - Gasket
 * @returns {Promise<object>} sni config
 */
export async function getDefaultSni(gasket) {
  const { sniNames } = gasket.config?.devCerts || {};
  const hostnames = sniNames ?? SNI_DEFAULTS;

  const certs = await Promise.all(hostnames.map(hostname => {
    return gasket.actions.getDevCert(hostname);
  }));

  return certs.reduce((acc, cert, i) => {
    acc[hostnames[i]] = cert;
    return acc;
  }, {});
}

const reGasketSubdomain = /(^[\w.]+)(.gasket.)/i;

/**
 * Convert a local.gasket.* hostname to a *.gasket.* hostname
 * @param {string} hostname - Hostname
 * @returns {string} wildcard
 */
export function toWildcard(hostname) {
  return hostname.replace(reGasketSubdomain, '*$2');
}
