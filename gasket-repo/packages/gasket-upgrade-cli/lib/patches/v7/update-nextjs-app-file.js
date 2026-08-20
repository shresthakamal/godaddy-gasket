const withPatchSpinner = require('../with-patch-spinner');

const exportDefaultReplacement = `
export default [
  withAuthProvider()
].reduce((cmp, hoc) => hoc(cmp), App);
`.trim();

const updatedAppContents = `
import { withAuthProvider } from '@godaddy/gasket-auth';

function Layout(props) {
  const { Component, pageProps } = props;

  return (
    <Component { ...pageProps } />
  );
}

const App = createApp({ Layout, initialProps: true });
`.trimEnd();

const packageMappings = [
  {
    packageName: '@godaddy/gasket-next',
    deprecatedFunction: 'App',
    updatedFunction: 'createApp'
  }
];

function getImportReqRegEx(packageName, deprecatedFunction) {
  return new RegExp(
    // eslint-disable-next-line max-len
    `(?:import\\s*{([^}]*(\\b${deprecatedFunction}\\b)[^}]*)}\\s*from\\s*['"]${packageName}['"])|(?:const\\s*{([^}]*(\\b${deprecatedFunction}\\b)[^}]*)}\\s*=\\s*require\\s*\\(['"]${packageName}['"]\\))`,
    'g'
  );
}

function renameDeprecatedFunctions(contents, pkgMappings) {
  for (const pkgMap of pkgMappings) {
    const { packageName, deprecatedFunction, updatedFunction } = pkgMap;

    const importReqRegex = getImportReqRegEx(packageName, deprecatedFunction);

    if (importReqRegex.test(contents)) {
      const regexPattern = new RegExp(deprecatedFunction);
      contents = contents.replace(regexPattern, updatedFunction);
    }
  }

  return contents;
}

function fixup(contents) {
  // skip for repeat upgrade runs
  if (contents.includes('createApp')) return contents;

  contents = renameDeprecatedFunctions(contents, packageMappings);

  const regexPatternForLastImport = new RegExp(`(import\\s.*?;)(?!.*import)`, 's');
  contents = contents.replace(regexPatternForLastImport, `$1${updatedAppContents}`);

  contents = contents.replace(/export\s+default\s+App;/, exportDefaultReplacement);

  return contents;
}

/**
 * Finds and fixes the _app file
 *
 * @param {Map} files - Collection of filePaths to content
 */
function fixupAppFile({ files }) {
  const content = files.get('pages/_app.js');
  if (content) {
    files.set('pages/_app.js', fixup(content));
  }
}

module.exports = withPatchSpinner('Update Nextjs _app file', fixupAppFile);
