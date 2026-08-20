const semver = require('semver');

module.exports = function hasGasketV7({ pkg }) {
  if (!pkg || !pkg.dependencies) {
    throw new Error('Invalid input: package data must include dependencies.');
  }

  const version = pkg.dependencies['@gasket/core'];

  if (version) {
    const current = semver.minVersion(version);
    return current && semver.satisfies(current.version, '>=7.0.0');
  }
};

module.exports.label = 'Gasket >= v=7/v3';
