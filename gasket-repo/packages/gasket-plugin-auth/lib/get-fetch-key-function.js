import { fetchKey } from 'gd-auth';

/**
 * Get fetch key function
 * @type {import('./internal').getFetchKeyFunction}
 */
export default function getFetchKeyFunction({ host, cert, key }) {
  /** @type {import('./internal').fetchKeyThroughProxy} */
  return async function fetchKeyThroughProxy(useragent, ignored, kid) {
    const httpsOptions = { cert, key };
    return await fetchKey(useragent, host, kid, httpsOptions);
  };
}
