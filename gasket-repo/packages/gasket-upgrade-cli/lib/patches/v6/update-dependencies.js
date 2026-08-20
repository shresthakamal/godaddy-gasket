const withPatchSpinner = require('../with-patch-spinner');
const renameMap = require('./rename-map');

const gasketVersion = '^6.0.0';
const uxcore2Version = '^2002.2.6';
const gdGasketVersion = '^2.0.0';

const unsupported = [
  '@godaddy/gasket-plugin-assets',
  '@godaddy/gasket-plugin-splitio',
  'next-routes',
  'asset-provider'
];

const versions = {
  'next': '^10.0.6',
  'webpack': '^5.21.2',
  '@ux/uxcore2': uxcore2Version,
  '@ux/datepicker': uxcore2Version,
  '@ux/icon': uxcore2Version,
  '@ux/slider': uxcore2Version,
  '@ux/time-picker': uxcore2Version,
  '@ux/file-upload': uxcore2Version,
  '@ux/filter': uxcore2Version,
  '@ux/form-field': uxcore2Version,
  '@ux/tag': uxcore2Version,

  'next-redux-wrapper': '^6.0.2',
  'lodash.merge': '^4.6.0',
  'react-intl': '^4.5.3',
  'sass': '^1.29.0',
  'sass-loader': '^8.0.2',
  'url-loader': '^4.1.1',
  'file-loader': '^6.2.0',

  // recent fixes
  'gasket/helper-intl': '^6.0.6',
  '@gasket/react-intl': '^6.0.7',
  '@gasket/redux': '^6.0.8'
};

function replacePackages(obj, messages) {
  return Object.keys(obj).reduce((acc, cur) => {
    if (renameMap[cur]) {
      acc[renameMap[cur]] = obj[cur];
    } else {
      if (unsupported.includes(cur)) {
        messages.push(`Package \`${ cur }\` is no longer supported.`);
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
  updateContent('package.json', content => {
    if (content.dependencies && content.dependencies.next) {
      content.dependencies['next-redux-wrapper'] = versions['next-redux-wrapper'];
      content.dependencies['lodash.merge'] = versions['lodash.merge'];
      content.devDependencies = content.devDependencies || {};
      content.devDependencies.sass = versions.sass;
      content.devDependencies.webpack = versions.webpack;
      content.dependencies['url-loader'] = versions['url-loader'];
      content.dependencies['file-loader'] = versions['file-loader'];
    }

    ['peerDependencies', 'dependencies', 'devDependencies'].forEach(attr => {
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
