const withPatchSpinner = require('../with-patch-spinner');
const { hasDep, updateVersions } = require('../../utils/dependencies');

const uxcore2Version = '^2301.0.0';

const versions = {
  '@ux/datepicker': uxcore2Version,
  '@ux/file-upload': uxcore2Version,
  '@ux/filter': uxcore2Version,
  '@ux/form-field': uxcore2Version,
  '@ux/icon': uxcore2Version,
  '@ux/slider': uxcore2Version,
  '@ux/tag': uxcore2Version,
  '@ux/time-picker': uxcore2Version,
  '@ux/uxcore2': uxcore2Version,
  '@ux/webpack-config': uxcore2Version,

  '@gasket/assets': '^6.39.0',
  '@gasket/cli': '^6.43.0',
  '@gasket/data': '^6.41.1',
  '@gasket/engine': '^6.43.0',
  '@gasket/fetch': '^6.39.0',
  '@gasket/helper-intl': '^6.41.2',
  '@gasket/log': '^6.39.0',
  '@gasket/nextjs': '^6.43.0',
  '@gasket/plugin-analyze': '^6.43.0',
  '@gasket/plugin-command': '^6.43.0',
  '@gasket/plugin-config': '^6.43.0',
  '@gasket/plugin-cypress': '^6.39.0',
  '@gasket/plugin-docs-graphs': '^6.43.0',
  '@gasket/plugin-docs': '^6.43.0',
  '@gasket/plugin-docsify': '^6.43.0',
  '@gasket/plugin-docusaurus': '^6.43.0',
  '@gasket/plugin-elastic-apm': '^6.43.0',
  '@gasket/plugin-express': '^6.43.0',
  '@gasket/plugin-fastify': '^6.43.0',
  '@gasket/plugin-git': '^6.43.0',
  '@gasket/plugin-https': '^6.43.0',
  '@gasket/plugin-intl': '^6.43.0',
  '@gasket/plugin-jest': '^6.39.0',
  '@gasket/plugin-lifecycle': '^6.43.0',
  '@gasket/plugin-lint': '^6.43.0',
  '@gasket/plugin-log': '^6.43.0',
  '@gasket/plugin-manifest': '^6.43.0',
  '@gasket/plugin-metadata': '^6.43.0',
  '@gasket/plugin-metrics': '^6.43.0',
  '@gasket/plugin-mocha': '^6.39.0',
  '@gasket/plugin-nextjs': '^6.43.0',
  '@gasket/plugin-redux': '^6.43.0',
  '@gasket/plugin-service-worker': '^6.43.0',
  '@gasket/plugin-start': '^6.43.0',
  '@gasket/plugin-swagger': '^6.43.0',
  '@gasket/plugin-webpack': '^6.43.0',
  '@gasket/plugin-workbox': '^6.43.0',
  '@gasket/preset-api': '^6.43.0',
  '@gasket/preset-nextjs': '^6.43.0',
  '@gasket/preset-pwa': '^6.43.0',
  '@gasket/react-intl': '^6.42.0',
  '@gasket/redux': '^6.39.0',
  '@gasket/resolve': '^6.43.0',
  '@gasket/typescript-tests': '^6.43.0',
  '@gasket/utils': '^6.43.0',

  '@godaddy/gasket-auth': '^2.14.0',
  '@godaddy/gasket-cookies': '^2.3.1',
  '@godaddy/gasket-dev-tools': '^2.3.5',
  '@godaddy/gasket-hcs': '^2.19.1',
  '@godaddy/gasket-header-nav': '^2.9.0',
  '@godaddy/gasket-hivemind': '^2.4.1',
  '@godaddy/gasket-next': '^2.26.0',
  '@godaddy/gasket-plugin-auth': '^2.22.0',
  '@godaddy/gasket-plugin-hcs': '^3.0.0',
  '@godaddy/gasket-plugin-hivemind': '^3.3.0',
  '@godaddy/gasket-plugin-linaria': '^2.4.3',
  '@godaddy/gasket-plugin-proxy': '^2.4.7',
  '@godaddy/gasket-plugin-rigor': '^2.4.2',
  '@godaddy/gasket-plugin-security-auth-logging': '^0.4.6',
  '@godaddy/gasket-plugin-security-logger': '^0.5.5',
  '@godaddy/gasket-plugin-security': '^2.6.4',
  '@godaddy/gasket-plugin-traffic': '^2.5.5',
  '@godaddy/gasket-plugin-uxp': '^2.36.0',
  '@godaddy/gasket-plugin-visitor': '^2.11.5',
  '@godaddy/gasket-plugin-zkconfig': '^2.3.5',
  '@godaddy/gasket-preset-api': '^2.10.9',
  '@godaddy/gasket-preset-hcs': '^3.0.0',
  '@godaddy/gasket-preset-webapp': '^2.26.0',

  'next': '13.1.1',
  'react': '^18.2.0',
  'react-dom': '^18.2.0'
};

/**
 * Ensures the presence of '@ux/webpack-config' dev dependency if '@ux/uxcore2'
 * is in the dependencies.
 *
 * @param {object} content - The content of package.json
 */
function ensureUxcore2WebpackConfig(content) {
  if (
    content.dependencies &&
    hasDep(content, '@ux/uxcore2') &&
    !hasDep(content, '@ux/webpack-config')
  ) {
    content.devDependencies = content.devDependencies || {};
    content.devDependencies['@ux/webpack-config'] =
      versions['@ux/webpack-config'];
  }
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
 * Updates package.json dependencies based on defined rules.
 *
 * @param {object} updateContent - The function to update the content of
 * package.json
 */
function updateDependencies({ updateContent }) {
  updateContent('package.json', (content) => {
    ensureUxcore2WebpackConfig(content);
    content = updateAllDependencies(content);
    return content;
  });
}

module.exports = withPatchSpinner(
  'Update package.json dependencies',
  updateDependencies
);
