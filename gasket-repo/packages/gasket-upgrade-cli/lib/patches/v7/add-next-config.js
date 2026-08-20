/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');

const withPatchSpinner = require('../with-patch-spinner');

const content = `import gasket from './gasket.mjs';
export default gasket.actions.getNextConfig();`;

async function addNextConfig({ cwd }) {
  const nextConfig = path.join(cwd, 'next.config.mjs');

  if (!fs.existsSync(nextConfig)) {
    await fs.promises.writeFile(nextConfig, content, 'utf8');
  }
}

module.exports = withPatchSpinner('Add next.config.mjs', addNextConfig);
