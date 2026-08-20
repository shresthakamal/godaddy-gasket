const semver = require('semver');

module.exports = function hasGasketV6({ pkg }) {
  if (!pkg || !pkg.dependencies) {
    throw new Error('Invalid input: package data must include dependencies.');
  }

  const cliVersion = pkg.dependencies['@gasket/cli'];
  const coreVersion = pkg.dependencies['@gasket/core'];

  const checkVersion = (version, range) => {
    const minVersion = semver.minVersion(version);
    return minVersion && semver.satisfies(minVersion.version, range);
  };

  if (cliVersion && checkVersion(cliVersion, '>=6.0.0')) {
    return true;
  }

  if (coreVersion && checkVersion(coreVersion, '>=7.0.0')) {
    return true;
  }

  return false;
};

module.exports.label = 'Gasket >= v6/v2';
