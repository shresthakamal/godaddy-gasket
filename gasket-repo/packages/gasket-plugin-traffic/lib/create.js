/// <reference types="create-gasket-app" />

import packageJson from '../package.json' with { type: 'json' };
const { name, version, dependencies } = packageJson;

/**
 * Get versions of specified dependencies from the provided depsObject.
 * @param {object} depsObject - Object containing dependency versions
 * @param {string[]} deps - Array of dependency names to look for
 * @returns {object} Object containing the specified dependencies and their versions
 */
function getDependenciesVersions(depsObject, deps) {
  return deps.reduce((acc, dependency) => {
    if (depsObject[dependency]) {
      acc[dependency] = depsObject[dependency];
    } else {
      console.warn(`No version found for ${dependency}`);
    }
    return acc;
  }, {});
}

const appDependencies = [
  '@opentelemetry/resources',
  '@opentelemetry/api',
  '@opentelemetry/semantic-conventions'
];

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default async function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addPlugin('pluginTraffic', name);
  pkg.add('dependencies', {
    [name]: `^${version}`,
    ...getDependenciesVersions(dependencies, appDependencies)
  });
}
