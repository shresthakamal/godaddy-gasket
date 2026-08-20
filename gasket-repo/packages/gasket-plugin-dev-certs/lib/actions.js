import path from 'path';
import fetchDevCert from './fetch-dev-cert.js';
import fetchDevCerts from './fetch-dev-certs.js';
import readDevCert from './read-dev-cert.js';
import { PACKAGED_CERTS } from './constants.js';

/**
 * Get the directory path for app certs
 * @param {import('@gasket/core').Gasket} gasket - Gasket
 * @returns {string} cert directory path
 */
function getAppCertDir(gasket) {
  const { path: certsPath = '.certs' } = gasket.config?.devCerts || {};
  return path.join(gasket.config.root, certsPath);
}

/** @type {import('@gasket/core').ActionHandler<'getDevCert'>} */
async function getDevCert(gasket, commonName) {
  const appCertDir = getAppCertDir(gasket);
  let certDir = appCertDir;
  if (PACKAGED_CERTS.includes(commonName)) {
    certDir = new URL('../certs', import.meta.url).pathname;
  } else {
    await fetchDevCert(appCertDir, commonName);
  }

  return await readDevCert(certDir, commonName);
}

/** @type {import('@gasket/core').ActionHandler<'installDevCerts'>} */
async function installDevCerts(gasket) {
  const appCertDir = getAppCertDir(gasket);
  const { commonNames } = gasket.config?.devCerts || {};

  if (!commonNames) return;
  await fetchDevCerts({ dirPath: appCertDir, commonNames });
}

export {
  getDevCert,
  installDevCerts
};
