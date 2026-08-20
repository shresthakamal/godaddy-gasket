/**
 * Convert object to string using specified pair and equality delimiters
 * @param {object} obj - object to stringify
 * @param {string} pairDelim - delimiter that separates each KVP. ('&' in
 * plid=1&shopperId=123)
 * @param {string} equalityDelim - delimiter that separates the key from the
 * value. ('=' in plid=1&shopperId=123)
 * @returns {string} - String representation of object
 */
export function stringify(obj, pairDelim, equalityDelim) {
  const resultList = [];
  Object.entries(obj).forEach(([key, value]) => {
    resultList.push(`${key}${equalityDelim}${value}`);
  });
  return resultList.join(pairDelim);
}

/**
 * Return value from key/value pair
 * @param {Array.<string>} kvPair - key/value array
 * @returns {string} - value from the key/value pair
 */
function _parseValue(kvPair) {
  if (kvPair.length === 2) {
    return kvPair[1];
  }
  return;
}

/**
 * Parse object from string using specified pair and equality delimiters
 * @param {string} string - string to split
 * @param {string} pairDelim - delimiter that separates each KVP. ('&' in
 * plid=1&shopperId=123)
 * @param {string} equalityDelim - delimiter that separates the key from the
 * value. ('=' in plid=1&shopperId=123)
 * @returns {object} - Object parsed from string
 */
export function parseString(string, pairDelim, equalityDelim) {
  if (typeof string !== 'string') return {};
  return string.split(pairDelim).reduce((acc, pair) => {
    const kvPair = pair.split(equalityDelim);
    acc[kvPair[0]] = _parseValue(kvPair);
    return acc;
  }, {});
}

/**
 * Get base domain from request
 * @param {import('express').Request} req - request object
 * @returns {string} - base domain
 */
export function getBaseDomain({ headers = {} }) {
  // This x-dsa-host is set by akamai and should take precedance since it
  // indicates the domain the user is actually accessing the app on
  let host = headers['x-dsa-host'] || headers.host || '';

  // Ensure host is a string
  if (Array.isArray(host)) {
    host = host[0];
  }

  // Remove port if present
  const domain = host.split(':')[0];
  const parts = domain.split('.');

  // Ensure there are at least two parts for a valid base domain
  if (parts.length < 2) return '';

  return parts.slice(-2).join('.');
}

/**
 * Set a cookie on the response and update the request object
 * @param {import('express').Request} req - request object
 * @param {import('express').Response} res - response object
 * @param {string} name - cookie name
 * @param {string} value - cookie value
 * @param {object} options - options for setting the cookie
 * @param {number} options.minutes - expiration time in minutes
 * @param {string} options.baseDomain - base domain for the cookie
 */
// eslint-disable-next-line max-params
export function setCookie(req, res, name, value, { minutes, baseDomain }) {
  const expires = minutes ? new Date(Date.now() + 60 * 1000 * minutes) : void 0;

  res.cookie(name, value, {
    expires,
    domain: baseDomain,
    // do not encode values
    encode: v => v
  });
  // Update request object so plugin can access it in the same lifecycle
  req.cookies[name] = value;
}
