/* eslint-disable max-statements */
const withPatchSpinner = require('../with-patch-spinner');
const { updateVersions } = require('../../utils/dependencies');

const versions = {
  '@babel/core': '^7.16.10',
  'eslint': '^8.6.0',
  'eslint-config-godaddy-react': '^8.0.0',
  'eslint-config-godaddy': '^6.0.0',
  '@godaddy/eslint-plugin-react-intl': '^1.1.1',
  'eslint-config-next': '^12.1.0'
};

/**
 * Updates names and versions for package dependencies
 *
 * @param {function} updateContent - Transform content
 * @param {string[]} message - Result messages
 */
function updateDependencies({ updateContent, messages, nextSteps }) {
  updateContent('package.json', content => {
    content.devDependencies = content.devDependencies || {};
    // These are now direct dependencies of eslint-config-godaddy-react
    delete content.devDependencies['eslint-plugin-jsx-a11y'];
    delete content.devDependencies['eslint-plugin-react'];
    delete content.devDependencies['eslint-plugin-json'];
    delete content.devDependencies['eslint-plugin-mocha'];
    // parser included with eslint-config-next
    delete content.devDependencies['babel-core'];
    delete content.devDependencies['babel-eslint'];

    if (!('eslint-config-next' in content.devDependencies)) {
      content.devDependencies['eslint-config-next'] = versions['eslint-config-next'];
    }

    ['peerDependencies', 'dependencies', 'devDependencies'].forEach(attr => {
      if (!content[attr]) return;
      content[attr] = updateVersions(content[attr], versions);
    });

    if (content.eslintConfig && content.eslintConfig.extends) {
      content.eslintConfig.extends.push('next');
      // parser included with eslint-config-next
      delete content.eslintConfig.parser;
    } else {
      messages.push('Could not update `eslintConfig` - Be sure it add "next" to the extends.');
    }

    nextSteps.push('ESLint rules were updated - check code by running `npm run lint`.');

    return content;
  });
}

module.exports = withPatchSpinner('Update ESLint configs', updateDependencies);
