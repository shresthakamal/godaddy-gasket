/* eslint-disable no-sync, no-console */
import globby from 'globby';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Find all packages with a `deprecated` property and `npm deprecate` them.
 * The `deprecated` value should be the message displayed
 */
function main() {
  const packagePaths = globby.sync(['packages/*/package.json']);
  const deprecated = packagePaths
    .map(p => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8')))
    .filter(pkg => pkg.deprecated);

  deprecated.forEach(pkg => {
    const cmd = `npm deprecate ${ pkg.name }@${ pkg.version } "${ pkg.deprecated }"`;
    const fullCmd = cmd + ' --registry=https://gdartifactory1.jfrog.io/artifactory/api/npm/npm-gasket-core-local/';

    console.log(cmd);
    try {
      execSync(fullCmd, { stdio: [0, 1, 2] });
    } catch (e) {
      console.error(e);
    }
  });
}

main();
