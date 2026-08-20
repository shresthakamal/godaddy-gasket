const withPatchSpinner = require('../with-patch-spinner');
const { hasDep, updateVersions } = require('../../utils/dependencies');

const uxcore2Version = '^2200.0.0';

const versions = {
  '@ux/uxcore2': uxcore2Version,
  '@ux/webpack-config': uxcore2Version,
  '@ux/datepicker': uxcore2Version,
  '@ux/icon': uxcore2Version,
  '@ux/slider': uxcore2Version,
  '@ux/time-picker': uxcore2Version,
  '@ux/file-upload': uxcore2Version,
  '@ux/filter': uxcore2Version,
  '@ux/form-field': uxcore2Version,
  '@ux/tag': uxcore2Version,

  '@gasket/preset-api': '^6.17.4',
  '@gasket/preset-nextjs': '^6.17.1',
  '@gasket/preset-pwa': '^6.17.0',

  '@gasket/plugin-analyze': '^6.17.0',
  '@gasket/plugin-command': '^6.17.0',
  '@gasket/plugin-config': '^6.17.0',
  '@gasket/plugin-docs': '^6.17.0',
  '@gasket/plugin-docs-graphs': '^6.17.0',
  '@gasket/plugin-docsify': '^6.17.0',
  '@gasket/plugin-elastic-apm': '^6.17.0',
  '@gasket/plugin-express': '^6.17.1',
  '@gasket/plugin-fastify': '^6.17.0',
  '@gasket/plugin-git': '^6.17.0',
  '@gasket/plugin-https': '^6.17.0',
  '@gasket/plugin-intl': '^6.17.1',
  '@gasket/plugin-jest': '^6.17.1',
  '@gasket/plugin-lifecycle': '^6.17.0',
  '@gasket/plugin-lint': '^6.17.4',
  '@gasket/plugin-log': '^6.17.1',
  '@gasket/plugin-manifest': '^6.17.0',
  '@gasket/plugin-metadata': '^6.17.0',
  '@gasket/plugin-metrics': '^6.17.0',
  '@gasket/plugin-mocha': '^6.17.1',
  '@gasket/plugin-nextjs': '^6.17.1',
  '@gasket/plugin-redux': '^6.17.1',
  '@gasket/plugin-service-worker': '^6.17.0',
  '@gasket/plugin-start': '^6.17.0',
  '@gasket/plugin-swagger': '^6.17.0',
  '@gasket/plugin-webpack': '^6.17.0',
  '@gasket/plugin-workbox': '^6.17.0',

  '@gasket/assets': '^6.17.0',
  '@gasket/cli': '^6.17.0',
  '@gasket/data': '^6.17.0',
  '@gasket/engine': '^6.17.0',
  '@gasket/fetch': '^6.17.0',
  '@gasket/helper-intl': '^6.17.0',
  '@gasket/log': '^6.17.1',
  '@gasket/nextjs': '^6.17.1',
  '@gasket/react-intl': '^6.17.1',
  '@gasket/redux': '^6.17.1',
  '@gasket/resolve': '^6.17.0',
  '@gasket/typescript-tests': '^6.17.4',
  '@gasket/utils': '^6.17.0',

  '@godaddy/gasket-preset-api': '^2.6.2',
  '@godaddy/gasket-preset-hcs': '^2.17.3',
  '@godaddy/gasket-preset-webapp': '^2.14.0',

  '@godaddy/gasket-plugin-appconfig': '^2.7.0',
  '@godaddy/gasket-plugin-auth': '^2.8.0',
  '@godaddy/gasket-plugin-hcs': '^2.21.1',
  '@godaddy/gasket-plugin-healthcheck': '^2.3.0',
  '@godaddy/gasket-plugin-hivemind': '^2.8.0',
  '@godaddy/gasket-plugin-linaria': '^2.3.0',
  '@godaddy/gasket-plugin-nsexperiments': '^2.4.0',
  '@godaddy/gasket-plugin-proxy': '^2.3.0',
  '@godaddy/gasket-plugin-rigor': '^2.3.0',
  '@godaddy/gasket-plugin-security': '^2.5.0',
  '@godaddy/gasket-plugin-security-auth-logging': '^0.4.0',
  '@godaddy/gasket-plugin-security-logger': '^0.4.0',
  '@godaddy/gasket-plugin-traffic': '^2.2.0',
  '@godaddy/gasket-plugin-uxp': '^2.19.0',
  '@godaddy/gasket-plugin-visitor': '^2.7.0',
  '@godaddy/gasket-plugin-zkconfig': '^2.2.0',

  '@godaddy/gasket-auth': '^2.5.0',
  '@godaddy/gasket-cookies': '^2.2.0',
  '@godaddy/gasket-dev-tools': '^2.2.0',
  '@godaddy/gasket-hcs': '^2.7.0',
  '@godaddy/gasket-header-nav': '^2.5.0',
  '@godaddy/gasket-hivemind': '^2.2.0',
  '@godaddy/gasket-next': '^2.11.0',

  'next': '^12.1.0',
  'react': '^17.0.2',
  'react-dom': '^17.0.2',
  'webpack': '^5.68.0',
  'next-redux-wrapper': '^7.0.5',

  'react-intl': '^5.24.4',
  'sass': '^1.49.7',
  'postcss': '^8.4.4',
  'sass-loader': '^8.0.2',

  'setup-env': '^1.2.4'
};

/**
 * Updates names and versions for package dependencies
 *
 * @param {function} updateContent - Transform content
 * @param {string[]} message - Result messages
 */
function updateDependencies({ updateContent }) {
  updateContent('package.json', content => {
    if (content.dependencies) {
      content.devDependencies = content.devDependencies || {};
      // ensure app has direct dev dependencies
      if (hasDep(content, '@ux/uxcore2') && !hasDep(content, '@ux/webpack-config')) {
        content.devDependencies['@ux/webpack-config'] = versions['@ux/webpack-config'];
      }
      if (hasDep(content, 'next') && !hasDep(content, 'postcss')) {
        content.devDependencies.postcss = versions.postcss;
      }
    }

    ['peerDependencies', 'dependencies', 'devDependencies'].forEach(attr => {
      if (!content[attr]) return;
      content[attr] = updateVersions(content[attr], versions);
    });

    return content;
  });
}

module.exports = withPatchSpinner('Update package.json dependencies', updateDependencies);
