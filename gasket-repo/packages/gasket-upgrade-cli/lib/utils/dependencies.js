const semver = require('semver');

/**
 * Shortcut to check if a package is included as a dependency or devDependency
 * @param {object} pkg - package.json contents
 * @param {string} depName - Name of dependency to check
 * @returns {boolean} results
 */
function hasDep(pkg, depName) {
  return (pkg.devDependencies && depName in pkg.devDependencies) ||
    (pkg.dependencies && depName in pkg.dependencies);
}

/**
 * Update matching dependency to minimum compatible version
 * @param {object} pkgDeps - mapping of dependency versions (devDependencies, etc.)
 * @param {object} versions - target dependency version to upgrade to
 * @returns {object} dependencies
 */
function updateVersions(pkgDeps, versions) {
  return Object.keys(pkgDeps).reduce((acc, cur) => {
    acc[cur] = pkgDeps[cur];
    const wanted = versions[cur];
    if (wanted) {
      const current = semver.minVersion(pkgDeps[cur]).version;
      if (!semver.satisfies(current, wanted)) {
        acc[cur] = wanted;
      }
    }
    return acc;
  }, {});
}

module.exports = {
  hasDep,
  updateVersions
};
