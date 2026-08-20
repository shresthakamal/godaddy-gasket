/* eslint-disable no-console, no-process-env */
import lodash from 'lodash';
import fetch from 'node-fetch';
import { getJomaxJwtWithOauth } from '@gd-internal/ssojwt';
const { memoize } = lodash;

/**
 * Get a JWT token
 * @returns {Promise<string>} - JWT token
 */
const getJwt = memoize(async () => {
  if (process.env.CERT_API_TOKEN) {
    console.log('Using CERT_API_TOKEN from environment');
    return process.env.CERT_API_TOKEN;
  }

  if (process.env.CI) {
    throw new Error(
      'CERT_API_TOKEN is required in CI. Cannot run interactive login.'
    );
  }

  console.log('Need to download new dev certificates.');
  return getJomaxJwtWithOauth({ env: 'prod' });
});


/**
 * Fetch a URL with the JWT header
 * @type {import('.').authorizedFetch}
 */
async function authorizedFetch(url) {
  const jwt = await getJwt();
  const res = await fetch(url, {
    headers: {
      authorization: `sso-jwt ${jwt}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  return res;
}

export {
  authorizedFetch,
  getJwt
};
