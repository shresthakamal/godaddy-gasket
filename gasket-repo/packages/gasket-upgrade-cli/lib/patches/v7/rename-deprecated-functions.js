const withPatchSpinner = require('../with-patch-spinner');

const packageMappings = [
  {
    packageName: '@godaddy/gasket-auth',
    deprecatedFunction: 'authStatus',
    updatedFunction: 'AuthStatus'
  },
  {
    packageName: '@godaddy/gasket-next',
    deprecatedFunction: 'createAppComponent',
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

function fixup(contents) {
  for (const packageMap of packageMappings) {
    const { packageName, deprecatedFunction, updatedFunction } = packageMap;

    const importReqRegex = getImportReqRegEx(packageName, deprecatedFunction);

    if (importReqRegex.test(contents)) {
      const regexPattern = new RegExp(deprecatedFunction, 'g');
      contents = contents.replace(regexPattern, updatedFunction);
    }
  }

  return contents;
}

/**
 * Finds all the functions from packages in packageMappings
 * and fixes them up
 *
 * @param {Map} files - Collection of filePaths to content
 */
function renameDeprecatedFunctions({ files }) {
  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      files.set(filePath, fixup(content));
    }
  });
}

module.exports = withPatchSpinner('Rename deprecated functions', renameDeprecatedFunctions);
