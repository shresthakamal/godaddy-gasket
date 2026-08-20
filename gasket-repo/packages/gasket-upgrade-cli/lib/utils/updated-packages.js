const { gasketVersion } = require('../patches/v7/update-dependencies');

module.exports = {
  add: {
    '@gasket/core': gasketVersion,
    '@gasket/data': {
      version: gasketVersion,
      when: (dependencies) => !!dependencies['@gasket/plugin-data']
    },
    '@gasket/intl': {
      version: gasketVersion,
      when: (dependencies) => !!dependencies['@gasket/plugin-intl']
    },
    '@gasket/react-intl': {
      version: gasketVersion,
      when: (dependencies) => !!dependencies['@gasket/plugin-intl']
    }
  },
  remove: {
    '@gasket/log': true,
    '@gasket/cli': true
  }
};
