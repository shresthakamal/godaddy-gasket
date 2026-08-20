/* eslint-disable max-statements */

import presentation from '@ux/presentation-central';
import ms from 'millisecond';
import mkdirp from 'mkdirp';
import path from 'path';
import os from 'os';
import deep from 'deepmerge';
import transformUrl from 'transform-url';
import {
  isCorpTools,
  isSecureServer,
  hasPrivateLabelParam,
  getEnvFromRuntime,
  normalizeEnv,
  fixupPrivateLabelId,
  getShopperInfoFromCookie,
  modifyPcParamsPerSegOpts
} from './utils.js';
import { internalHeaders, version2Headers } from './constants.js';

// Sentinel returned by switchboard/hivemind when a visitor is not in the experiment pool.
// See: https://github.com/gdcorp-uxp/hivemind (cohortId contract)
const COHORT_INELIGIBLE = 'ineligible';


/**
 * Default configuration options.
 * @private
 */
const defaultOptions = {
  /**
   * Enable persisting cache to disk by default so reboots do not need refresh
   * data, but can use cache from disk.
   */
  fsCachePath: path.join(os.tmpdir(), 'presentation-central-cache'),

  /**
   * maxStaleness + maxAge is the maximum age of a single cache item that we
   */
  maxStaleness: '5 minutes',

  /**
   * The maximum number of responses to store in the memory cache.
   */
  memoryCacheMax: 1000,

  /**
   * API version of presentation-central.
   */
  version: '3.0',

  /**
   * Refresh the cache every x amount time.
   */
  maxAge: '30 minutes',

  /**
   * The default timeout of a request.
   */
  timeout: '10 seconds',

  /**
   * Default query string parameters.
   */
  params: {
    /**
     * Which type of header do we want to request by default.
     */
    manifest: 'application-header',
    /**
     * Default market for the requests.
     */
    market: 'en-us',
    /**
     * Default to not bundled uxcore.
     */
    uxcore: false,
    /**
     * Use defer scripts for the loading of the JavaScript.
     */
    deferjs: true
  }
};

/**
 * Generates the options for the presentation-central client.
 * @param {import('@gasket/core').Gasket} gasket Reference to our gasket instance for config access
 * @returns {object} The options for the presentation-central client.
 * @private
 */
function setupClientSettings(gasket) {
  const userOptions = gasket.config.presentationCentral || {};

  const config = deep(
    defaultOptions,
    userOptions
  );

  const envFromRuntime = getEnvFromRuntime(gasket.config);
  let react = '18';

  //
  // React exposes the version number as variable so if the application is
  // using React, we can get the version they use from the React object
  //
  try {
    react = require('react').version.split('.').shift();
  } catch {
    /* pass */
  }

  //
  // auto-default to version 2.0 if the header only supports version 2 header
  //
  if (!userOptions.version && version2Headers.includes(userOptions.params?.header ?? userOptions.params?.manifest)) {
    config.version = '2.0';
  }

  if (config.version?.startsWith('3')) {
    if (userOptions.params?.header) {
      config.params.manifest = userOptions.params.header;
      gasket.logger.warn(
        'Use `manifest` instead of `header` with version 3.0 of Presentation Central config.'
      );
      delete config.params.header;
    }
  } else {
    if (userOptions.params?.manifest) {
      config.params.header = userOptions.params.manifest;
      gasket.logger.warn(
        'Use `header` instead of `manifest` with version 2.0 of Presentation Central config.'
      );
      delete config.params.manifest;
    }

    if (userOptions.params.deferjs) {
      gasket.logger.warn(
        'deferjs is only supported in version 3.0 of Presentation Central. ' +
        'Update your Gasket config with `presentationCentral.version: \'3.0\'`'
      );
    }
  }

  //
  // Create the directory for the file cache if does not exist.
  //
  if (config.fsCachePath) mkdirp.sync(config.fsCachePath);

  if (config.env) {
    if (typeof config.env === 'string') {
      config.env = normalizeEnv(config.env);
    } else {
      throw new Error('presentationCentral.env must be one of: "dev", "test", or "prod"');
    }
  }

  const settings = {
    log: gasket.logger.debug.bind(gasket.logger),
    env: envFromRuntime,
    ...config,
    params: {
      react: react,
      ...(config.params || {})
    },
    maxAge: ms(config.maxAge),
    maxStaleness: ms(config.maxStaleness),
    timeout: ms(config.timeout)
  };

  return settings;
}

/**
 * Formats experiment cohorts as a `split` param fragment for Presentation Central.
 * Format: `experiments:exp1=cohortA;exp2=cohortB`
 * @param {Record<string, string>} cohorts
 * @returns {string | null}
 */
function formatExperiments(cohorts) {
  const eligible = Object.entries(cohorts)
    .filter(([, cohortId]) => cohortId !== COHORT_INELIGIBLE)
    .sort(([a], [b]) => a.localeCompare(b));

  if (!eligible.length) return null;

  return 'experiments:' + eligible.map(([id, cohortId]) => `${id}=${cohortId}`).join(';');
}

/** @type {import('./internal').setupRequestParams} */
async function setupRequestParams(gasket, client, req) {
  const visitor = await gasket.actions.getVisitor(req);

  const { plid, market = 'en-US', hostname, currency = 'USD' } = visitor;
  const privateLabelId = fixupPrivateLabelId(hostname, plid);
  const params = { market, currency };

  const isVersion3 = client.version?.startsWith('3');

  if (isVersion3) {
    params.privateLabelId = privateLabelId;
  } else {
    params.privateLabel = privateLabelId;
  }

  const { params: baseParams = {} } = client;

  const getHeader = () => {
    if (isVersion3) {
      return params.manifest ?? baseParams.manifest;
    }
    return params.header ?? baseParams.header;
  };

  const hasHeader = (name) => {
    return getHeader() === name;
  };

  const setHeader = (name) => {
    if (isVersion3) {
      params.manifest = name;
    } else {
      params.header = name;
    }
  };

  //
  // Fixups attempting to use application-header internally
  //
  if (isCorpTools.test(hostname)) {
    const configuredHeader = getHeader();
    //
    // Shoppers should never access gdcorp.tools apps so use internal-header
    //
    if (!internalHeaders.includes(configuredHeader)) {
      gasket.logger.warn(
        `"${configuredHeader}" is for shoppers and should not be used with gdcorp.tools. ` +
        'Requesting "internal-header" instead. ' +
        'Update your Gasket config `presentationCentral.params` to remove this warning.'
      );
      setHeader('internal-header');
    }
  }

  //
  // Fixups for partners-header
  //
  if (gasket.config.presentationCentral?.enablePartnersHeaderOverride) {
    const infoIdp = getShopperInfoFromCookie(req);
    if (infoIdp.pcx) {
      setHeader('partners-header');
      params.theme = 'godaddy-pxpro';
    }
    modifyPcParamsPerSegOpts(params, infoIdp.segopts);
  }
  if (hasHeader('partners-header')) {
    // Get the app-sidebar for partners header
    if (!baseParams.split?.includes('sidebar')) {
      params.split = 'sidebar';
    }
  }

  //
  // Execute the `presentationCentral` hook, this allows people to introduce
  // extra params into the request that is made to presentation central e.g.
  // navigation.
  //
  await gasket.exec('presentationCentral', params, { req });

  if (gasket.config.uxp?.features?.['header-experiment-beta']) {
    if (!gasket.actions.getExperimentCohorts) {
      gasket.logger.warn('gasket-plugin-uxp: header-experiment-beta is enabled but gasket-plugin-switchboard is not available');
    } else {
      try {
        const cohorts = await gasket.actions.getExperimentCohorts(req);
        const expStr = cohorts && Object.keys(cohorts).length ? formatExperiments(cohorts) : null;
        if (expStr) {
          const existingSplit = params.split ?? baseParams.split;
          params.split = existingSplit ? `${existingSplit},${expStr}` : expStr;
        }
      } catch (err) {
        gasket.logger.warn('gasket-plugin-uxp: failed to fetch experiment cohorts', err);
      }
    }
  }

  //
  // For secureserver.net, make sure the plid is on the manifest url if being
  // sent
  //
  if (isSecureServer.test(hostname)) {
    const { pwamanifest = baseParams.pwamanifest } = params;
    if (pwamanifest && !hasPrivateLabelParam.test(pwamanifest) && plid) {
      params.pwamanifest = transformUrl(pwamanifest, { plid });
    }
  }

  return params;
}

let _clientInstance;

const setupClient = (gasket) => {
  if (!_clientInstance) {
    _clientInstance = presentation(setupClientSettings(gasket));
  }
  return _clientInstance;
};

/** @type {import('./internal').setupRequestOptions} */
function setupRequestOptions(gasket, req, params) {
  const { pcStuntDoubleUrl } = gasket.config.presentationCentral || {};
  const { headers = {}, cookies = {} } = req;

  // `url` and `env` are routing-level options consumed by the PC client itself,
  // not query-string params sent to the API. Extract them so they reach the
  // client as top-level request options rather than being serialised into the
  // query string (where the client would ignore them for routing purposes).
  const { url, env, ...queryParams } = params;

  const options = {
    requestUserAgent: headers['user-agent'],
    params: queryParams
  };

  if (url) options.url = url;
  if (env) options.env = normalizeEnv(env);

  // Integration with Stunt Double
  // https://github.com/gdcorp-uxp/hydra#hydra-rest-api
  if (queryParams.stuntDouble || cookies.pcStuntDoubleUrl) {
    options.stuntDouble = {
      url: cookies.pcStuntDoubleUrl || pcStuntDoubleUrl,
      remoteIP: headers['x-forwarded-for']
    };
  }

  if ('cache' in queryParams) {
    options.cache = queryParams.cache;
  }

  return options;
}

/** @type {import('./internal').getContent} */
async function getContent(gasket, req) {
  const { disabled } = gasket.config?.presentationCentral || {};

  if (disabled) {
    return {};
  }

  const client = setupClient(gasket);
  const params = await setupRequestParams(gasket, client, req);
  const options = setupRequestOptions(gasket, req, params);

  const { meta, ...data } = await client.request(options);
  return { data, meta };
}

export {
  getContent,
  // -- exported for tests --
  setupClient,
  setupClientSettings,
  setupRequestParams,
  setupRequestOptions
};
