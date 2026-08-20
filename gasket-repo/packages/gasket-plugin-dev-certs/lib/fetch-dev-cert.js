import mkdirp from 'mkdirp';
import hasCurrentCert from './has-current-cert.js';
import downloadCert from './download-cert.js';

export default async function fetchDevCert(dirPath, commonName) {
  await mkdirp(dirPath);
  const isCurrent = await hasCurrentCert(dirPath, commonName);
  if (!isCurrent) {
    await downloadCert(dirPath, commonName);
    // eslint-disable-next-line no-console
    console.log(`Downloaded ${commonName}`);
  }
}
