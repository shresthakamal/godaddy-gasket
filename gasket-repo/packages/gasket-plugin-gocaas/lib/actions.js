
/// <reference types="@godaddy/gasket-plugin-jwt" />

import * as caas from '@godaddy/caas';
const DEV = 'development';
const LOCAL = 'local';
const PROD = 'production';

/**
 * @typedef {import("@gasket/core").Gasket} Gasket
 * @typedef {import("@godaddy/caas").Client} Client
 */

/**
 * Gets the JWT for the GoCaas client.
 * @param {Gasket} gasket - The Gasket object.
 * @param {string} env - The current environment.
 * @param {string} jomaxJwt - The JOMAX JWT.
 * @returns {Promise<string>} The JWT for the GoCaas client.
 */
async function getGoCaasJwt(gasket, env, jomaxJwt) {
  if (!gasket.config?.jwt?.goCaas && env !== PROD) {
    if (!jomaxJwt) {
      throw new Error('No JWT found for GoCaas client');
    }
    return jomaxJwt;
  }
  return await gasket.actions.getJwt('goCaas');
}

/**
 * Generates a GoCaas client.
 * @param {Gasket} gasket - The Gasket object.
 * @param {string} [jomaxJwt] - Optional JOMAX JWT used when there is no JWT config in the Gasket Config.
 * @returns {Promise<Client>} A Promise resolving to GoCaas client.
 */
export async function getGoCaasClient(gasket, jomaxJwt) {
  const env = gasket.config.env === LOCAL ? DEV : gasket.config.env;
  const jwt = await getGoCaasJwt(gasket, env, jomaxJwt);
  const goCaasClientConfig = { jwt,  env };
  if (gasket.config?.goCaas?.headers) {
    goCaasClientConfig.headers = gasket.config.goCaas.headers;
  }
  return caas.createClient(goCaasClientConfig);
}
