import crypto from 'crypto';
import LRUCache from 'lru-cache';
import cloneDeep from 'lodash.clonedeep';
import { nanoid } from 'nanoid';

const isDevOrLocal = /\.dev-/i;
const isTest = /\.test-/i;
const isStage = /\.stg-/i;
const isOte = /\.ote-/i;
const isGoDaddy = /godaddy\.com/i;
const isSecureServer = /secureserver\.net/i;
const isCorpTools = /gdcorp\.tools/i;

const defaultDirectivesCache = new LRUCache({ max: 50 });
const hashCache = new LRUCache({ max: 100 });

/**
 * Create a memoized function to cache results
 * @type {import('.').makeMemoize}
 */
function makeMemoize(cache) {
  return function memoize(fn) {
    return function wrapper(key) {
      let value = cache.get(key);

      if (!value) {
        value = fn(key);
        cache.set(key, value);
      }

      return value;
    };
  };
}

const defaultsMemoize = makeMemoize(defaultDirectivesCache);
const hashMemoize = makeMemoize(hashCache);

const envUrls = {
  dev: ['*.dev-gdcorp.tools', '*.dev-godaddy.com', '*.dev-secureserver.net', '*.dev-wsimg.com'],
  test: ['*.test-gdcorp.tools', '*.test-godaddy.com', '*.test-secureserver.net', '*.dev-wsimg.com', '*.test-wsimg.com'],
  stg: ['*.stg-gdcorp.tools', '*.stg-godaddy.com', '*.stg-secureserver.net'],
  ote: ['*.ote-gdcorp.tools', '*.ote-godaddy.com', '*.ote-secureserver.net'],
  prod: ['*.gdcorp.tools', '*.godaddy.com', '*.secureserver.net', '*.wsimg.com']
};

/**
 * Some of the environments have cross-over with other urls in other environments,
 * so this function will combine sets as needed.
 * @param {string} hostname - Request hostname
 * @returns {string[]} urls
 */
function getEnvUrls(hostname) {
  if (isDevOrLocal.test(hostname)) {
    return envUrls.dev.concat(envUrls.test).concat(envUrls.prod);
  }
  if (isTest.test(hostname)) {
    return envUrls.test.concat(envUrls.prod);
  }
  if (isStage.test(hostname)) {
    return envUrls.stg.concat(envUrls.prod);
  }
  if (isOte.test(hostname)) {
    return envUrls.ote.concat(envUrls.prod);
  }
  return envUrls.prod;
}

/**
 * To simply the env/url matrix, we list them all by env.
 * This function will strip out those not pertinent to for a hostname.
 * @param {string} hostname - Request hostname
 * @param {string[]} urls - env urls
 * @returns {string[]} urls
 */
function trimDomainSet(hostname, urls) {
  if (isGoDaddy.test(hostname)) {
    // do not include gdcorp.tools
    return urls.filter(u => !isCorpTools.test(u));
  }
  if (isSecureServer.test(hostname)) {
    // do not include gdcorp.tools nor godaddy.com
    return urls.filter(u => !isCorpTools.test(u) && !isGoDaddy.test(u));
  }
  return urls;
}

/**
 * Returns the default directives for a hostname - memoized
 * @param {string} hostname - Request hostname
 * @returns {{string: string[]}} directives
 */
const buildDefaultDirectives = defaultsMemoize(
  function getCspDirectives(hostname) {

    const ownUrls = trimDomainSet(hostname, getEnvUrls(hostname));
    ownUrls.unshift('\'self\'');

    const commonUrls = [
      '*.google-analytics.com', // script, img, connect
      '*.doubleclick.net'       // script, img, connect
    ];

    return {
      'default-src': [
        ...ownUrls
      ],
      'script-src': [
        ...ownUrls,
        ...commonUrls,

        '*.googletagmanager.com', // script
        'tags.tiqcdn.com',        // script
        '*.googleapis.com',       // script (workbox)
        '*.liveperson.net',       // script (live person)
        '*.lpsnmedia.net'         // script (live person)
      ],
      'img-src': [
        // TODO: [STGLS-308] Investigate avoiding 'data:' from 3rd party resources
        'data:',
        ...ownUrls,
        ...commonUrls,

        '*.google.com',           // img
        '*.youtube.com',          // img
        'd.agkn.com',             // img
        '*.facebook.com'          // img
      ],
      'style-src': [
        ...ownUrls,

        // TODO: [STGLS-308] Investigate avoiding inline styles from 3rd party resources
        //   - liveEngage and help chiclet add inline styles after the document is loaded
        '\'unsafe-inline\''
      ],
      'connect-src': [
        ...ownUrls,
        ...commonUrls,

        '*.split.io'              // connect
      ],
      'frame-src': [
        ...ownUrls,

        '*.lpsnmedia.net'         // (live person)
      ]
    };
  }
);

/**
 * Make a copy of default directives to allow mutation in lifecycles
 * @param {string} hostname - Request hostname
 * @returns {{string: string[]}} directives
 */
function getDefaultDirectives(hostname) {
  return cloneDeep(buildDefaultDirectives(hostname));
}

/**
 * Create a hash value and directive for a given string.
 * Results are cached to avoid repeated unnecessary calls to crypto.
 * @param {string} str - String to hash
 * @returns {{value: string, directive: string}} object
 */
const createHash = hashMemoize(function getHash(str) {
  const value = crypto.createHash('sha256').update(str).digest('base64');
  return {
    value,
    directive: `'sha256-${ value }'`
  };
});

/**
 * Create a nonce value and formatted directive
 * @returns {{value: string, directive: string}} object
 */
function createNonce() {
  const value = nanoid();
  return {
    value,
    directive: `'nonce-${value}'`
  };
}

/**
 * Parse the content-security-header value to an object for easier updating
 * @param {string} cspString - Header value
 * @returns {object} cspObject
 */
function parseDirectives(cspString) {
  return cspString.trim().split(';').filter(Boolean).reduce((acc, cur) => {
    const s = cur.trim().split(' ');
    acc[s[0]] = s.slice(1);
    return acc;
  }, {});
}

/**
 * Formats an CSP object to a header-ready string value
 * @param {object} cspObject - Object with CSP directives
 * @returns {string} cspString
 */
function stringifyDirectives(cspObject) {
  return Object.keys(cspObject).reduce((acc, cur) => {
    return `${acc}${cur} ${cspObject[cur].join(' ')};`;
  }, '');
}

export {
  getEnvUrls,
  trimDomainSet,
  getDefaultDirectives,
  createHash,
  createNonce,
  parseDirectives,
  stringifyDirectives
};
