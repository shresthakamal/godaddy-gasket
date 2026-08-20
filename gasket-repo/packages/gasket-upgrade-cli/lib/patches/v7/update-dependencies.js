const withPatchSpinner = require('../with-patch-spinner');
const renameMap = require('./rename-map');

const gasketVersion = '^7.2.0';
const gdGasketVersion = '^3.2.0';

const unsupported = [
  '@godaddy/gasket-plugin-healthcheck',
  '@godaddy/gasket-plugin-rtl-css',
  '@godaddy/gasket-plugin-appconfig',
  '@godaddy/gasket-dev-tools',
  '@gasket/plugin-log',
  '@gasket/log',
  '@godaddy/gasket-hivemind',
  '@godaddy/gasket-plugin-hivemind'
];

const versions = { next: '^14.2.21'
};

function replacePackages(obj, messages) {
  return Object.keys(obj).reduce((acc, cur) => {
    if (renameMap[cur]) {
      acc[renameMap[cur]] = obj[cur];
    } else {
      if (unsupported.includes(cur)) {
        messages.push(`Package \`${cur}\` is no longer supported.`);
      }
      acc[cur] = obj[cur];
    }

    return acc;
  }, {});
}

function gasketVersions(obj) {
  return Object.keys(obj).reduce((acc, cur) => {
    if (unsupported.includes(cur)) {
      acc[cur] = obj[cur];
    } else if (cur.startsWith('@gasket')) {
      acc[cur] = gasketVersion;
    } else if (cur.startsWith('@godaddy/gasket')) {
      acc[cur] = gdGasketVersion;
    } else {
      acc[cur] = obj[cur];
    }
    return acc;
  }, {});
}

function otherVersions(obj) {
  return Object.keys(obj).reduce((acc, cur) => {
    if (versions[cur]) {
      acc[cur] = versions[cur];
    } else {
      acc[cur] = obj[cur];
    }
    return acc;
  }, {});
}

/**
 * Updates names and versions for package dependencies
 *
 * @param {function} updateContent - Transform content
 * @param {string[]} message - Result messages
 */
function updateDependencies({ updateContent, messages }) {
  updateContent('package.json', (content) => {
    ['peerDependencies', 'dependencies', 'devDependencies'].forEach((attr) => {
      if (!content[attr]) return;
      content[attr] = replacePackages(content[attr], messages);
      content[attr] = gasketVersions(content[attr], messages);
      content[attr] = otherVersions(content[attr], messages);
    });

    return content;
  });
}

module.exports = withPatchSpinner('Update package.json dependencies', updateDependencies);
module.exports.gasketVersion = gasketVersion;
module.exports.gdGasketVersion = gdGasketVersion;
