/* eslint-disable no-sync */
const withPatchSpinner = require('../with-patch-spinner');
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs');

const label = 'Move locales/ to public/locales/';

async function renameDir({ cwd, git, moveLocaleToPublic }, spinner) {
  if (!moveLocaleToPublic) {
    spinner.info(`${label} (skipped)`);
    return;
  }

  const localesDir = path.join(cwd, 'locales');
  const publicLocalesDir = path.join(cwd, 'public', 'locales');

  await git.mv(localesDir, publicLocalesDir);
}

module.exports = withPatchSpinner(label, renameDir);

module.exports.prompt = async function moveLocaleToPublicPrompt(context) {
  const { cwd } = context;
  const publicDir = path.join(cwd, 'public');
  const localesDir = path.join(cwd, 'locales');
  context.hasRootLocalesDir = fs.existsSync(localesDir);

  if (context.hasRootLocalesDir && (context.renameStaticDir || fs.existsSync(publicDir))) {

    const { moveLocaleToPublic } = await inquirer.prompt([{
      name: 'moveLocaleToPublic',
      message: `Do you wish to move locales/ to public/locale/? (Recommended)`,
      type: 'confirm',
      default: true
    }]);

    context.moveLocaleToPublic = moveLocaleToPublic;
  }
};

