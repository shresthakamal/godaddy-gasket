const withPatchSpinner = require('../with-patch-spinner');

const reJS = /\.[tj]sx?$/;

function transform(content) {
  return content.replace(/ocaleRequired/g, 'ocaleFileRequired').replace(/withLocaleFileRequired.+/g, (match) => {
    return match
      .replace(/,\s?\{\s?initialProps:\strue\s}/g, '')
      .replace(/,\s?\s?initialProps:\strue/g, '')
      .replace(/\s?initialProps:\strue,/g, '');
  });
}

/**
 * Finds all the packages and fixes them up
 *
 * @param {Map} files - Collection of filePaths to content
 * @param {string[]} messages - Messages to report
 */
function fixupLocaleRequired({ files }) {
  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      if (reJS.test(filePath)) {
        files.set(filePath, transform(content));
      }
    }
  });
}

module.exports = withPatchSpinner('Update locale paths', fixupLocaleRequired);
