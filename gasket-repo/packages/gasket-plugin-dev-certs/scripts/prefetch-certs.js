import prefetchCerts from '../lib/fetch-dev-certs.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { PACKAGED_CERTS as commonNames } from '../lib/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Main function to prefetch certs
 */
async function main() {
  const dirPath = path.join(__dirname, '..', 'certs');
  await prefetchCerts({ dirPath, commonNames });
}

main();
