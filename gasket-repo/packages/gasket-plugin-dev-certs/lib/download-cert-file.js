import { authorizedFetch } from './authorized-fetch.js';
import parseDisposition from './parse-disposition.js';
import { CERT_API_BASE_URL } from './constants.js';

/** @type {import('.').downloadCertFile} */
export default async function downloadCertFile(cloudCert, type) {
  const url = `${CERT_API_BASE_URL}/certificates/${cloudCert.id}.${type}`;
  const res = await authorizedFetch(url);
  const { filename } = parseDisposition(res.headers.get('content-disposition'));
  const pem = await res.text();

  return { pem, filename };
}
