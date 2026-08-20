import path from 'path';
import { promises as fs } from 'fs';
import x509 from 'x509.js';

const { readFile } = fs;

/**
 * Check if the current cert is still valid
 * @type {import('.').hasCurrentCert}
 */
async function hasCurrentCert(certPath, commonName) {
  try {
    const pem = await readFile(certFilePathFor(certPath, commonName));
    const cert = await x509.parseCert(pem.toString());
    const expiration = new Date(cert.notAfter);

    return new Date() < expiration;
  } catch {
    return false;
  }
}

/**
 * Get the file path for the certificate
 * @type {import('.').certFilePathFor}
 */
function certFilePathFor(directory, commonName) {
  return path.join(directory, `${commonName.replace('*', '_')}.crt`);
}

export default hasCurrentCert;
