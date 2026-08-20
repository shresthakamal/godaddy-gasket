const withPatchSpinner = require('../with-patch-spinner');
const inquirer = require('inquirer');
const { promisify } = require('util');
const glob = promisify(require('glob'));

const label = 'Setup postcss-rtlcss';

async function findPostcssConfig(context) {
  const { cwd, pkg } = context;

  if ('postcss' in pkg) return 'package.json';

  const existing = await glob('+(.postcss|postcss)*', { cwd, dot: true });
  return existing[0];
}

async function renameDir({ updateContent, useRtl }, spinner) {
  if (!useRtl) {
    spinner.info(`${label} (skipped)`);
    return;
  }

  updateContent('package.json', content => {
    content.devDependencies = {
      ...content.devDependencies,
      'postcss': '^8.4.5',
      'postcss-flexbugs-fixes': '^5.0.2',
      'postcss-preset-env': '^7.2.3',
      'postcss-rtlcss': '^3.5.0'
    };

    content.postcss = {
      plugins: [
        'postcss-flexbugs-fixes',
        [
          'postcss-preset-env',
          {
            autoprefixer: {
              flexbox: 'no-2009'
            },
            stage: 3,
            features: {
              'custom-properties': false
            }
          }
        ],
        'postcss-rtlcss'
      ]
    };

    return content;
  });
}

module.exports = withPatchSpinner(label, renameDir);

module.exports.prompt = async function setupRtlCssPrompt(context) {
  const config = await findPostcssConfig(context);

  if (!config) {
    const { useRtl } = await inquirer.prompt([{
      name: 'useRtl',
      message: 'Does your app need to support RTL languages?',
      type: 'confirm',
      default: false
    }]);

    context.useRtl = useRtl;
  }
};

