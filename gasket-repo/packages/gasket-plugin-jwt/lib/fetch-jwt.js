/// <reference types="@godaddy/gasket-plugin-dev-certs" />

import { getTokenFromCertificate, IamTokenClient } from 'gd-auth-client';
import { promises as fs } from 'fs';

/**
 * @type {import('./index.js').fetchJwtFromDevCert}
 */
async function fetchJwtFromDevCert(gasket, config) {
  const { cert, key } = await gasket.actions.getDevCert(config.devCert);
  return await getToken(config.ssoHost, cert, key, config.options);
}

/**
 * @type {import('./index.js').fetchJwtFromCertFile}
 */
async function fetchJwtFromCertFile(config) {
  const [cert, key] = await Promise.all([
    fs.readFile(config.certFile, 'utf8'),
    fs.readFile(config.keyFile, 'utf8')
  ]);

  return await getToken(config.ssoHost, cert, key, config.options);
}

/**
 * @type {import('./index.js').fetchJwtFromCert}
 */
async function fetchJwtFromCert(config) {
  const { cert, key } = config;

  return await getToken(config.ssoHost, cert, key, config.options);
}

/**
 * @type {import('./index.js').getToken}
 */
async function getToken(ssoHost, cert, key, options) {
  return await getTokenFromCertificate(ssoHost, cert, key, options);
}

/**
 * @type {import('./index.js').fetchJwtFromIamTokenClient}
 */
async function fetchJwtFromIamTokenClient(config) {
  const tokenClient = new IamTokenClient(config.ssoHost, config.options);
  return await tokenClient.getToken();
}

/**
 * @type {import('./index.js').fetchJwt}
 */
async function fetchJwt(gasket, config) {
  if (config.devCert) {
    return await fetchJwtFromDevCert(gasket, config);
  } else if ((config.certFile)) {
    return await fetchJwtFromCertFile(config);
  } else if ((config.cert)) {
    return await fetchJwtFromCert(config);
  }
  return await fetchJwtFromIamTokenClient(config);

}

export default fetchJwt;
