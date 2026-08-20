/* eslint-disable no-bitwise */
import { getProdPlidFromOte } from '@godaddy/gasket-private-labels';

const isDevOrLocal = /dev|local/i;
const isTest = /test/i;
const isOte = /ote/i;
const isSecureServer = /secureserver\.net/i;
const isCorpTools = /gdcorp\.tools/i;
const hasPrivateLabelParam = /pl_?id=/i;

/**
 * Unbranded private label id for secureserver.net hostnames
 * @type {number}
 */
const unbrandedPlId = 3153;

/**
 * Fixup private label id based on the hostname and private label id
 * @type {import('./internal').fixupPrivateLabelId}
 */
function fixupPrivateLabelId(hostname, privateLabel) {
  let plId = privateLabel;

  // Make sure to not show GoDaddy green for *secureserver.net hostnames
  if (!plId) {
    plId = isSecureServer.test(hostname) ? unbrandedPlId : 1;
  }

  // If this is the OTE env, we need to find the PROD plId for internal resellers
  plId = !isOte.test(hostname) ? plId : getProdPlidFromOte(plId) || plId;

  return plId;
}

/**
 * Derives an acceptable PC env from a user-supplied env.
 * Valid PresentationCentral env values are `dev`, `test`, or `prod`.
 * Unless otherwise overridden by `gasket.config.presentationCentral.env`
 * @type {import('./internal').normalizeEnv}
 */
function normalizeEnv(env = 'prod') {
  // dev, development, local, localhost
  if (isDevOrLocal.test(env)) return 'dev';

  // test, testing
  if (isTest.test(env)) return 'test';

  // prod, production, stage, stg, staging, ote, *
  return 'prod';
}

/**
 * Derives an acceptable PC env from the gasket runtime env.
 * Valid PresentationCentral env values are `dev`, `test`, or `prod`.
 * Unless otherwise overridden by `gasket.config.presentationCentral.env`
 * @type {import('./internal').getEnvFromRuntime}
 */
function getEnvFromRuntime(gasketConfig) {
  const { env } = gasketConfig;
  return normalizeEnv(env);
}

/**
 * Parses info_idp cookie shopper info, delegation safe
 * @type {import('./internal').getShopperInfoFromCookie}
 */
function getShopperInfoFromCookie(req) {
  const {
    cookies: {
      info_idp: infoIdp = ''
    } = {}
  } = req;

  if (typeof infoIdp === 'undefined') {
    return {};
  }

  try {
    const infoIdpJson = JSON.parse(infoIdp);
    return infoIdpJson.auth === 'basic' ? infoIdpJson : infoIdpJson[infoIdpJson.auth];
  } catch {
    return {};
  }

}

/**
 * Parse a bitfield integer segment
 * @type {import('./internal').parseBitSegment}
 */
function parseBitSegment(value, offset, bitWidth) {
  // create a binary number that is all 1s of bitWidth digits
  let mask = Math.pow(2, bitWidth) - 1;
  // move it to the right offset

  mask = mask << offset;
  // use the mask to get just the portion of bitfield that we want

  let result = value & mask;
  // move our value back to the beginning

  result = result >> offset;
  return result;
}

const THEME_SEGOPTS_MAPPING = {
  1: {
    'godaddy-pxpro': 'godaddy-pxpro-dark'
  }
};

/**
 * Modifies PC params as per info_idp.segopts value
 * @param {object} data - the current PC params (props may be modified)
 * @param {number} segopts - info_idp cookie segopts value
 */
function modifyPcParamsPerSegOpts(data = {}, segopts) {
  if (typeof segopts !== 'number') {
    return;
  }

  // lowest 3 bits are the theme modifier
  const themeModifier = parseBitSegment(segopts, 0, 3);
  if (THEME_SEGOPTS_MAPPING[themeModifier] && THEME_SEGOPTS_MAPPING[themeModifier][data.theme]) {
    data.theme = THEME_SEGOPTS_MAPPING[themeModifier][data.theme];
  }
}

export {
  isCorpTools,
  isSecureServer,
  hasPrivateLabelParam,
  fixupPrivateLabelId,
  getEnvFromRuntime,
  normalizeEnv,
  getShopperInfoFromCookie,
  parseBitSegment,
  modifyPcParamsPerSegOpts
};
