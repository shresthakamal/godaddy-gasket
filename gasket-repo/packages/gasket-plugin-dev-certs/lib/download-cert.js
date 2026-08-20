import path from 'path';
import { promises as fs } from 'fs';
import getCloudCertForCommonName from './get-cloud-cert-for-common-name.js';
import downloadCertFile from './download-cert-file.js';

const { writeFile } = fs;

/**
 * Download the certificate files for the given commonName
 * @type {import('.').downloadCert}
 */
async function downloadCert(directory, commonName) {
  const cloudCert = await getCloudCertForCommonName(commonName);

  if (!cloudCert) {
    throw new Error(
      `${commonName} is not available to download for your login. Check your AD group membership.`
    );
  }

  await Promise.all([
    updateCertFile(cloudCert, directory),
    updateCaChainFile(cloudCert, directory),
    updateKeyFile(cloudCert, directory)
  ]);

  return commonName;
}

/**
 * Update the certificate file
 * @type {import('.').updateCertFile}
 */
async function updateCertFile(cloudCert, directory) {
  const { pem, filename } = await downloadCertFile(cloudCert, 'crt');
  await writeFile(path.join(directory, filename), pem);
}

/**
 * Update the CA chain file
 * @type {import('.').updateCaChainFile}
 */
async function updateCaChainFile(cloudCert, directory) {
  const { pem, filename } = await downloadCertFile(cloudCert, 'chain');
  await writeFile(path.join(directory, filename), pem);
}

/**
 * Update the key file
 * @type {import('.').updateKeyFile}
 */
async function updateKeyFile(cloudCert, directory) {
  const { pem, filename } = await downloadCertFile(cloudCert, 'key');
  await writeFile(path.join(directory, filename), pem);
}

export default downloadCert;
