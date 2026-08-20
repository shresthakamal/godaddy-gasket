const withPatchSpinner = require('../with-patch-spinner');

const setupFile = `
require('dotenv').config();
require('elastic-apm-node').start({
  serviceName: 'my-service-name',
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL
});
`;

/**
 * Update elastic apm setup
 *
 * @param {Map} files - Collection of filePaths to content
 * @param {function} updateContent - Transform content
 * @param {function} addContent - Add content
 */
function updateElasticApmSetup({ updateContent, addContent, files }) {
  const pkg = files.get('package.json');
  const keys = Object.keys(pkg.scripts).filter((key) => pkg.scripts[key].includes('elastic-apm-node/start'));

  if (keys.length) {
    if (files.get('setup.js')) {
      // eslint-disable-next-line no-console
      console.error('Error updating gasket-plugin-elastic-apm -- setup.js already exists');
      return;
    }

    updateContent('package.json', (content) => {
      addContent('setup.js', setupFile);
      keys.forEach((key) => {
        content.scripts[key] = content.scripts[key].replace(/elastic-apm-node\/start/g, './setup.js');
      });
      return content;
    });
  }
}

module.exports = withPatchSpinner('Update elastic apm setup', updateElasticApmSetup);
