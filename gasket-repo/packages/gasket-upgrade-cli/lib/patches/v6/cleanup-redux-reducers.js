const withPatchSpinner = require('../with-patch-spinner');

const reAuth = /\n?const\s(\w+).+'@godaddy\/gasket-auth\/reducers'.+/;
const reIntl = /\n?const\s(\w+).+'@gasket\/(?:react-)?intl\/reducers'.+/;
const reCookies = /\n?const\s(\w+).+'@godaddy\/gasket-cookies\/reducers'.+/;

const reAuthSpread = /\s+\.\.\.require\('@godaddy\/gasket-auth\/reducers'\),?/;
const reIntlSpread = /\s+\.\.\.require\('@gasket\/(?:react-)?intl\/reducers'\),?/;
const reCookiesSpread = /\s+\.\.\.require\('@godaddy\/gasket-cookies\/reducers'\),?/;

const makeVarRe = v => new RegExp(`\\s+\\.{0,3}${v},?`);

function fixup(contents) {
  const variables = [];

  [reAuth, reIntl, reCookies].forEach(re => {
    contents = contents.replace(re, function rename(match, variable) {
      variables.push(variable);
      return '';
    });
  });

  variables.forEach(v => {
    const re = makeVarRe(v);
    contents = contents.replace(re, '');
  });

  [reAuthSpread, reIntlSpread, reCookiesSpread].forEach(re => {
    contents = contents.replace(re, '');
  });

  return contents;
}

/**
 * Finds all the packages and fixes them up
 *
 * @param {Map} files - Collection of filePaths to content
 */
function cleanupReducers({ files }) {
  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      files.set(filePath, fixup(content));
    }
  });
}

module.exports = withPatchSpinner('Cleanup Redux reducers', cleanupReducers);
