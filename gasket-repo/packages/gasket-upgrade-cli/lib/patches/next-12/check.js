const semver = require('semver');

module.exports = function hasNext12({ pkg }) {
  const version = pkg.dependencies.next;
  if (version) {
    const current = semver.minVersion(version).version;
    return semver.satisfies(current, '>=12.0.0');
  }
};

module.exports.label = 'Next >= 12';
