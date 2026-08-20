/* eslint-disable no-sync */
const withPatchSpinner = require('../with-patch-spinner');
const path = require('path');
const fs = require('fs');

const label = 'Update GoLF manifest.xml';

async function fixup({ git, cwd, moveLocaleToPublic }, spinner) {
  const nestedManifest = path.join(cwd, 'public', 'locales', 'manifest.xml');
  const rootManifest = path.join(cwd, 'manifest.xml');

  if (!moveLocaleToPublic || !fs.existsSync(nestedManifest)) {
    spinner.info(`${label} (skipped)`);
    return;
  }

  await git.mv(nestedManifest, rootManifest);

  let contents = await fs.promises.readFile(rootManifest, 'utf8');
  contents = contents.replace(/"locales\//g, '"public/locales/');
  await fs.promises.writeFile(rootManifest, contents, 'utf8');
}

module.exports = withPatchSpinner(label, fixup);
