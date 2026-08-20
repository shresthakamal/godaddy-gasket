/**
 * Private label Id table
 * @see https://secureservernet.sharepoint.com/sites/TechHub/SitePages/Private-label-brands.aspx
 * @type {import('.').PlidRow[]}
 */
const plidTable = [
// brand key,              base domain,             prod, [dev], [test], [ote]
  ['godaddy',             'godaddy.com',            1],
  ['gdcorp',              'gdcorp.tools',           1],
  ['bluerazor',           'bluerazor.com',          2], // inactive
  ['wildwestdomains',     'wildwestdomains.com',    1387],
  ['maddogdomains',       'maddogdomains.com',      1941],
  ['domainspricedright',  'domainspricedright.com', 1592],
  ['domainsbyproxy',      'domainsbyproxy.com',     1695],
  ['starfieldtech',       'starfieldtech.com',      504762],
  ['mrsite',              'mrsite.com',             542167],
  ['server4you',          'server4you.com',         549227],
  ['sucuri',              'sucuri.net',             565123],
  ['uniregistry',         'uniregistry.com',        566574],
  ['mediatemple',         'mediatemple.net',        495469, null, null, 1001776],
  ['afternic',            'afternic.com',           497036, null, null, 1001836],
  ['domainfactory',       'df.eu',                  525845, null, null, 1002763],
  ['hosteurope',          'hosteurope.de',          525847, null, null, 1002765],
  ['heartinternet',       'heartinternet.uk',       525848, null, null, 1002766],
  ['hosteuropees',        'hosteurope.es',          525849, null, null, 1002767],
  ['domainbox',           'domainbox.com',          525850, null, null, 1002768],
  ['donhost',             'donhost.co.uk',          525851, null, null, 1002769],
  ['webfusion',           'webfusion.co.uk',        525852, null, null, 1002770],
  ['webhuset',            'webhuset.no',            536004, null, null, 1002914],
  ['meshmedia',           'meshmedia.co.uk',        540723, null, null, 1002986],
  ['velia',               'velia.net',              541136, null, null, 1002992],
  ['reamaze',             'reamaze.com',            579333, 443755, 276950, null],
  ['123reg',              '123-reg.co.uk',          587240, null, null, 1002762]
];

/**
 * Private label id lookup with brand keys as getter properties to assist static analysis
 */
class PlidPicker {
  constructor(values) {
    this._values = values;
    Object.defineProperty(this, '123reg', {
      get() {
        return this.oneTwoThreeReg;
      }
    });
  }

  /**
   * @returns {number} plid
   */
  get godaddy() {
    return this._values.godaddy;
  }

  /**
   * @returns {number} plid
   */
  get gdcorp() {
    return this._values.gdcorp;
  }

  /**
   * @returns {number} plid
   */
  get wildwestdomains() {
    return this._values.wildwestdomains;
  }

  /**
   * @returns {number} plid
   */
  get maddogdomains() {
    return this._values.maddogdomains;
  }

  /**
   * @returns {number} plid
   */
  get domainspricedright() {
    return this._values.domainspricedright;
  }

  /**
   * @returns {number} plid
   */
  get starfieldtech() {
    return this._values.starfieldtech;
  }

  /**
   * @returns {number} plid
   */
  get afternic() {
    return this._values.afternic;
  }

  /**
   * @returns {number} plid
   */
  get mediatemple() {
    return this._values.mediatemple;
  }

  /**
   * @returns {number} plid
   * @deprecated
   */
  get bluerazor() {
    return this._values.bluerazor;
  }

  /**
   * @returns {number} plid
   */
  get domainsbyproxy() {
    return this._values.domainsbyproxy;
  }

  /**
   * @returns {number} plid
   */
  get meshmedia() {
    return this._values.meshmedia;
  }

  /**
   * @returns {number} plid
   */
  get sucuri() {
    return this._values.sucuri;
  }

  /**
   * @returns {number} plid
   */
  get uniregistry() {
    return this._values.uniregistry;
  }

  /**
   * @returns {number} plid
   */
  get reamaze() {
    return this._values.reamaze;
  }

  /**
   * @returns {number} plid
   */
  get oneTwoThreeReg() {
    return this._values['123reg'];
  }

  /**
   * @returns {number} plid
   */
  get domainfactory() {
    return this._values.domainfactory;
  }

  /**
   * @returns {number} plid
   */
  get heartinternet() {
    return this._values.heartinternet;
  }

  /**
   * @returns {number} plid
   */
  get hosteurope() {
    return this._values.hosteurope;
  }

  /**
   * @returns {number} plid
   */
  get hosteuropees() {
    return this._values.hosteuropees;
  }

  /**
   * @returns {number} plid
   */
  get domainbox() {
    return this._values.domainbox;
  }

  /**
   * @returns {number} plid
   */
  get donhost() {
    return this._values.donhost;
  }

  /**
   * @returns {number} plid
   */
  get webfusion() {
    return this._values.webfusion;
  }

  /**
   * @returns {number} plid
   */
  get webhuset() {
    return this._values.webhuset;
  }

  /**
   * @returns {number} plid
   */
  get velia() {
    return this._values.velia;
  }

  /**
   * @returns {number} plid
   */
  get mrsite() {
    return this._values.mrsite;
  }

  /**
   * @returns {number} plid
   */
  get server4you() {
    return this._values.server4you;
  }
}

const isDevOrLocal = /dev|local/i;
const isTest = /test/i;
const isStg = /sta?g/i;
const isOte = /ote/i;

/**
 * Get the short env key from the provided hostname or environment name
 * @param {string| import('.').EnvName} hostOrEnv - Hostname or environment name
 * @returns {string} short env name
 */
function getEnvKey(hostOrEnv) {
  let env = 'prod';

  if (isTest.test(hostOrEnv)) {
    env = 'test';
  } else if (isStg.test(hostOrEnv)) {
    env = 'stg';
  } else if (isOte.test(hostOrEnv)) {
    env = 'ote';
  } else if (isDevOrLocal.test(hostOrEnv)) {
    env = 'dev';
  }
  return env;
}

/**
 * Determines the correct plid based off the hostname
 * @param {string} host - Hostname to check
 * @returns {string} plid
 */
function getBrandKey(host) {
  const row = plidTable.find(([, baseDomain]) => host.includes(baseDomain));
  const [brandKey] = row ?? [];
  return brandKey;
}

/**
 * Production plids
 * @type {PlidPicker}
 */
const prodPlids = new PlidPicker(
  plidTable.reduce((acc, [key,, prodPlid]) => {
    acc[key] = prodPlid;
    return acc;
  }, {})
);

/**
 * Development plids
 * @type {PlidPicker}
 */
const devPlids = new PlidPicker(
  plidTable.reduce((acc, [key,, prodPlid, devPlid]) => {
    acc[key] = devPlid ?? prodPlid;
    return acc;
  }, {})
);

/**
 * Test plids
 * @type {PlidPicker}
 */
const testPlids = new PlidPicker(
  plidTable.reduce((acc, [key,, prodPlid, , testPlid]) => {
    acc[key] = testPlid ?? prodPlid;
    return acc;
  }, {})
);

/**
 * OTE plids
 * @type {PlidPicker}
 */
const otePlids = new PlidPicker(
  plidTable.reduce((acc, [key,, prodPlid, , , otePlid]) => {
    acc[key] = otePlid ?? prodPlid;
    return acc;
  }, {})
);

/**
 * Environment plids
 * @type {Record<string, PlidPicker>}
 */
const envPlids = {
  prod: prodPlids,
  stg: prodPlids,
  dev: devPlids,
  test: testPlids,
  ote: otePlids
};

/**
 * Get the correct plid lookup object for the provided environment
 * @param {string} env - Deployment environment
 * @returns {PlidPicker} plids
 */
function getEnvPlids(env) {
  const envKey = getEnvKey(env);
  return envPlids[envKey];
}

/**
 * Get the prod plid for the provided ote plid if found
 * @param {number} plid - OTE plid to compare
 * @returns {number} plid
 */
function getProdPlidFromOte(plid) {
  for (const [brandKey, value] of Object.entries(otePlids._values)) {
    if (value === plid) {
      return prodPlids[brandKey];
    }
  }

  return plid;
}

/**
 * Determines the correct plid based off the hostname
 * @param {string} host - Hostname to check
 * @returns {number} plid
 */
function getPlidFromHost(host) {
  const brandKey = getBrandKey(host);
  const envKey = getEnvKey(host);
  return getEnvPlids(envKey)[brandKey];
}

/**
 * Determines the correct plid based off the base domain and environment
 * @param {import('.').BaseDomain} baseDomain - Hostname to check
 * @param {string} env - Deployment environment
 * @returns {number} plid
 */
function getPlidFromDomain(baseDomain, env) {
  const brandKey = getBrandKey(baseDomain);
  const envKey = getEnvKey(env);
  return getEnvPlids(envKey)[brandKey];
}

/**
 * Determines if the hostname is a private label
 * @param {string} host - Hostname to check
 * @returns {boolean} isPrivateLabel
 */
function isPrivateLabelHost(host) {
  for (const [, baseDomain] of plidTable) {
    if (host.includes(baseDomain)) return true;
  }
  return false;
}

/**
 * Determines if the hostname is a secureserver.net host
 * @param {string} host - Hostname to check
 * @returns {boolean} isSecureServerHost
 */
function isSecureServerHost(host) {
  return host.includes('secureserver.net');
}

export {
  prodPlids,
  devPlids,
  testPlids,
  otePlids,
  envPlids,
  getEnvPlids,
  getPlidFromHost,
  getProdPlidFromOte,
  getPlidFromDomain,
  isPrivateLabelHost,
  isSecureServerHost
};
