/* eslint-disable no-sync */
const path = require('path');
const fs = require('fs');
const original = require('../v6/rename-static-dir');

module.exports = async function renameStaticDir(context) {
  const { patches } = context;
  if (!patches.v6) {
    // skip since it would have been handled already
    await original(context);
  }
};

module.exports.prompt = async function renameStaticDirPrompt(context) {
  const { cwd } = context;
  const staticDir = path.join(cwd, 'static');

  if (fs.existsSync(staticDir)) {
    // force this, even for original v6 patches
    context.renameStaticDir = true;
  }
};
