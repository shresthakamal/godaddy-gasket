/* eslint-disable no-console */
import { from } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import mkdirp from 'mkdirp';
import hasCurrentCert from './has-current-cert.js';
import downloadCert from './download-cert.js';

/**
 * Fetch dev certs
 * @type {import('.').fetchDevCerts}
 */
export default async function fetchDevCerts({ dirPath, commonNames }) {
  await mkdirp(dirPath);

  await from(commonNames)
    .pipe(
      mergeMap(async (commonName) => {
        const isCurrent = await hasCurrentCert(dirPath, commonName);

        return { commonName, isCurrent };
      }),
      filter(({ isCurrent }) => !isCurrent),
      mergeMap(async ({ commonName }) => {
        await downloadCert(dirPath, commonName);
        return commonName;
      })
    )
    .forEach((commonName) => console.log(`Downloaded ${commonName}`));
}
