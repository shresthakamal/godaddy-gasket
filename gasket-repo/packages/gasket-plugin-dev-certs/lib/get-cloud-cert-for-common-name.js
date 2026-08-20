import { authorizedFetch } from './authorized-fetch.js';
import { CERT_API_BASE_URL } from './constants.js';

/**
 * Get a cloud cert for a common name
 * @type {import('.').getCloudCertForCommonName}
 */
async function getCloudCertForCommonName(commonName) {
  const url = `${CERT_API_BASE_URL}/certificates/cn/${encodeURIComponent(commonName)}/latest`;
  const res = await authorizedFetch(url);

  if (!res.ok) {
    throw new Error(`Error ${res.status} retrieving cert for ${commonName}.`);
  }

  const body = await res.json();
  const { certificate } = body;

  if (!certificate)
    throw new Error(`No cert retrieved - check user AD group`);

  return certificate;
}

export default getCloudCertForCommonName;
