const withPatchSpinner = require('../with-patch-spinner');

/**
 * Takes and object and sorts its keys
 *
 * @param {object} obj - Object with keys to be ordered
 * @param {function} [compare] - optional sort function
 * @returns {object} sorted
 */
function sortKeys(obj, compare) {
  const ordered = {};

  Object.keys(obj).sort(compare).forEach(function (key) {
    ordered[key] = obj[key];
  });

  return ordered;
}

function fixup(content) {
  ['peerDependencies', 'dependencies', 'devDependencies'].forEach(attr => {
    if (!content[attr]) return;
    content[attr] = sortKeys(content[attr]);
  });

  return content;
}

/**
 * Sort package dependency names
 *
 * @param {function} updateContent - Transform content
 */
function sortPackage({ updateContent }) {
  updateContent('package.json', content => fixup(content));
}

module.exports = withPatchSpinner('Sort package.json attribute', sortPackage);
