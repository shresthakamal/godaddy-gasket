const withPatchSpinner = require('../with-patch-spinner');
const renameMap = {
  'gasket.logger.warning': 'gasket.logger.warn',
  'logger.log': 'logger.info'
};

const renameKeys = Object.keys(renameMap);
const rePackages = new RegExp('(' + renameKeys.join('|') + ')', 'g');

function fixup(contents) {
  return contents.replace(rePackages, function (match) {
    return renameMap[match];
  });
}

/**
 * Updates logger for v7 changes
 *
 * @param {Map} files - Collection of filePaths to content
 */
function updateLogger({ files }) {
  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      files.set(filePath, fixup(content));
    }
  });
}

module.exports = withPatchSpinner('Rename package imports', updateLogger);
