const withPatchSpinner = require('../with-patch-spinner');
const { updateVersions } = require('../../utils/dependencies');

const versions = {
  'eslint': '^8.51.0',
  'eslint-config-godaddy-react': '^9.0.1',
  'eslint-config-godaddy': '^7.0.2',
  '@godaddy/eslint-plugin-react-intl': '^1.3.0',
  'eslint-config-next': '^13.5.5'
};

/**
 * Updates 'eslint-config-next' in the devDependencies if it's missing.
 *
 * @param {object} content - The content of package.json
 * @returns {object} The updated content of package.json
 */
function updateDevDependencies(content) {
  content.devDependencies ||= {};

  if (!content.devDependencies['eslint-config-next']) {
    content.devDependencies['eslint-config-next'] =
      versions['eslint-config-next'];
  }

  return content;
}

/**
 * Updates all dependencies (peerDependencies, dependencies, devDependencies)
 * using the specified versions.
 *
 * @param {object} content - The content of package.json
 * @returns {object} The updated content of package.json
 */
function updateAllDependencies(content) {
  ['peerDependencies', 'dependencies', 'devDependencies'].forEach((attr) => {
    if (content[attr]) {
      content[attr] = updateVersions(content[attr], versions);
    }
  });

  return content;
}

/**
 * Updates package.json dependencies and ESLint configuration.
 *
 * @param {object} updateContent - The function to update the content of
 * package.json
 * @param {string[]} nextSteps - An array to store next steps
 */
function updateDependencies({ updateContent, nextSteps }) {
  updateContent('package.json', (content) => {
    content = updateDevDependencies(content);
    content = updateAllDependencies(content);

    nextSteps.push(
      'ESLint rules were updated - check code by running `npm run lint`.'
    );

    return content;
  });
}

module.exports = withPatchSpinner('Update ESLint configs', updateDependencies);
