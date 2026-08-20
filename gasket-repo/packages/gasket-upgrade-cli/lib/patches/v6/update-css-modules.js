const withPatchSpinner = require('../with-patch-spinner');
const path = require('path');
const inquirer = require('inquirer');

const label = 'Update CSS Modules naming';

// only capture relative imports (not from node_modules)
const reStyleFile = /["'](\.[^'"]+\.s?css)['"];?/g;
const reDotModule = /\.module\./;

function addDotModule(file) {
  return file.replace(/(\.s?css)/, '.module$1');
}

async function fixup({ files, git, cwd, nextSteps, cssModuleFiles }, spinner) {
  if (!cssModuleFiles) {
    spinner.info(`${label} (skipped)`);
    return;
  }

  const moduleFiles = new Set();
  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      if (filePath === 'pages/_app.js') return; // skip

      if (reStyleFile.test(content)) {
        const fixed = content.replace(reStyleFile, (match, styleFile) => {
          if (reDotModule.test(styleFile)) return match;
          const srcFile = path.resolve(path.dirname(filePath), styleFile);
          moduleFiles.add(srcFile);
          return match.replace(styleFile, addDotModule(styleFile));
        });
        files.set(filePath, fixed);
      }
    }
  });

  if (moduleFiles.size) {
    let message = 'CSS Module styles will need to be adjusted for:';
    for (const srcFile of moduleFiles) {
      const tgtFile = addDotModule(srcFile);
      message += '\n    - ' + path.relative(cwd, tgtFile);
      await git.mv(srcFile, tgtFile);
    }
    nextSteps.push(message);
  }
}

module.exports = withPatchSpinner(label, fixup);

module.exports.prompt = async function updateCssModulesPrompt(context) {

  const { cssModuleFiles } = await inquirer.prompt([{
    name: 'cssModuleFiles',
    message: 'Rename component style files to include `.module`?',
    type: 'confirm',
    default: true
  }]);

  context.cssModuleFiles = cssModuleFiles;
};

