const withPatchSpinner = require('../with-patch-spinner');

const reNextRequireLine = /require.+\n\n/;


function fixup(contents) {
  // skip for repeat upgrade runs
  if (contents.includes('next-redux-wrapper')) return contents;

  contents = contents.replace('const { configureMakeStore }', 'const { configureMakeStore, getOrCreateStore }');

  // Add new require statements
  contents = contents.replace(reNextRequireLine, function addImports(match) {
    return match.replace(/\n/, '') +
`const { HYDRATE, createWrapper } = require('next-redux-wrapper');
const merge = require('lodash.merge');

// Basic hydrate reducer for next-redux-wrapper
// @see: https://github.com/kirill-konshin/next-redux-wrapper#usage
const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

`;
  });

  // Setup makeStore const, add rootReducer
  contents = contents.replace(
    'module.exports = configureMakeStore({',
    'const makeStore = configureMakeStore({ rootReducer,');

  // Append nextRedux setup and exports
  contents = contents.trimRight() + `
const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
`;

  return contents;
}

/**
 * Finds and fixes the redux store
 *
 * @param {Map} files - Collection of filePaths to content
 */
function fixupReduxStore({ files }) {
  ['store.js', 'redux/store.js'].forEach(fileName => {
    const content = files.get(fileName);
    if (content) {
      files.set(fileName, fixup(content));
    }
  });
}

module.exports = withPatchSpinner('Update Redux store', fixupReduxStore);
