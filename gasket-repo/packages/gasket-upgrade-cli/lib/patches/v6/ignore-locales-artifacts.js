/* eslint-disable no-sync */
const withPatchSpinner = require('../with-patch-spinner');
const path = require('path');
const fs = require('fs');

const content = `# built artifacts
locales-manifest.json
modules
`;

async function ignoreArtifacts(context) {
  const { cwd, git } = context;
  const localesDir = path.join(cwd, 'locales');
  const publicLocalesDir = path.join(cwd, 'public', 'locales');
  let targetDir = fs.existsSync(publicLocalesDir) && publicLocalesDir;
  targetDir = targetDir || fs.existsSync(localesDir) && localesDir;

  if (targetDir) {
    const filePath = path.join(targetDir, '.gitignore');
    await fs.promises.writeFile(filePath, content, 'utf8');
    await git.add(filePath);
  }
}

module.exports = withPatchSpinner('Ignore build artifacts', ignoreArtifacts);
