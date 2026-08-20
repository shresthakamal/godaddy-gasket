const withPatchSpinner = require('../with-patch-spinner');
const renameMap = require('./rename-map');

const renameKeys = Object.keys(renameMap);
const rePackages = new RegExp("(['\"])(" + renameKeys.join('|') + ')', 'g');

function fixup(contents) {
  return contents.replace(rePackages, function rename(match, start, name) {
    return start + renameMap[name];
  });
}

/**
 * Finds all the packages and fixes them up
 *
 * @param {Map} files - Collection of filePaths to content
 */
function renameImports({ files }) {
  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      files.set(filePath, fixup(content));
    }
  });
}

module.exports = withPatchSpinner('Rename package imports', renameImports);
