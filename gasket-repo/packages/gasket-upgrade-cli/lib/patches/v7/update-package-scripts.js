const withPatchSpinner = require('../with-patch-spinner');

/**
 * Updates package scripts
 *
 * @param {function} updateContent - Transform content
 * @param {string[]} message - Result messages
 */
function updatePackageScripts({ updateContent }) {
  updateContent('package.json', content => {
    const { build, start, local, preview } = content.scripts;
    if (build) content.scripts.build = build.replace('gasket build', 'next build');
    if (start) content.scripts.start = start.replace('gasket start', 'node server.mjs');
    if (local) content.scripts.local = local.replace('gasket local', 'GASKET_DEV=1 nodemon server.mjs');

    if (!preview) {
      content.scripts.preview = 'npm run build && npm run start';
    }

    return content;
  });
}

module.exports = withPatchSpinner('Update package.json scripts', updatePackageScripts);
