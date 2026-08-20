/* eslint-disable no-sync */
const withPatchSpinner = require('../with-patch-spinner');
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs');

const label = 'Rename static/ to public/';

function fixupRefs(content) {
  return content.replace('static/', 'public/');
}

async function renameDir({ cwd, git, files, nextSteps, renameStaticDir }, spinner) {
  if (!renameStaticDir) {
    spinner.info(`${label} (skipped)`);
    return;
  }

  const staticDir = path.join(cwd, 'static');
  const publicDir = path.join(cwd, 'public');

  await git.mv(staticDir, publicDir);

  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      files.set(filePath, fixupRefs(content));
    }
  });

  nextSteps.push('Update deployment configs to include public/ directory.');
}

module.exports = withPatchSpinner(label, renameDir);

module.exports.prompt = async function renameStaticDirPrompt(context) {
  const { cwd } = context;
  const staticDir = path.join(cwd, 'static');

  if (fs.existsSync(staticDir)) {
    const { renameStaticDir } = await inquirer.prompt([{
      name: 'renameStaticDir',
      message: `Do you wish to rename /static to /public? (Recommended)`,
      type: 'confirm',
      default: true
    }]);

    context.renameStaticDir = renameStaticDir;
  }
};
