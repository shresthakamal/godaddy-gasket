const merge = require('lodash.merge');
const withPatchSpinner = require('../with-patch-spinner');

const label = 'Configure Eslint Settings';

/**
 * Updates names and versions for package dependencies
 *
 * @param {object} context - Context
 * @param {object} spinner - Spinner
 */
function updateConfig(context, spinner) {
  if (!context.moveLocaleToPublic) {
    spinner.info(`${label} (avoided)`);
    return;
  }

  context.updateContent('package.json', content => {

    // If we already have eslintConfig.settings.localeFiles, prepend `public/`
    const { eslintConfig } = content;
    if (eslintConfig) {
      if (eslintConfig.settings && eslintConfig.settings.localeFiles) {
        eslintConfig.settings.localeFiles = eslintConfig.settings.localeFiles
          .map(f => `public/${f}`);

        return content;
      }
    }

    const config = {
      eslintConfig: {
        settings: {
          localeFiles: [
            'public/locales/en-US.json'
          ]
        }
      }
    };

    return merge(content, config);
  });
}

module.exports = withPatchSpinner(label, updateConfig);
