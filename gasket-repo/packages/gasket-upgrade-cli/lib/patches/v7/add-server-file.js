const withPatchSpinner = require('../with-patch-spinner');
const path = require('path');
const fs = require('fs');

const content = `
import gasket from './gasket.mjs';
gasket.actions.startServer();
`;

async function addServerFile({ cwd, git, messages }) {
  const serverFile = path.join(cwd, 'server.mjs');

  // eslint-disable-next-line no-sync
  if (!fs.existsSync(serverFile)) {
    await fs.promises.writeFile(serverFile, content, 'utf8');
    try {
      await git.add(serverFile);
    } catch {
      messages.push('Git error adding server.mjs');
    }
  }
}

module.exports = withPatchSpinner('Add server.mjs file', addServerFile);
