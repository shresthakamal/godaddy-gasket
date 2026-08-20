import pkg from 'lodash';
const { get } = pkg;

/**
 * This function looks at the log levels, and the error code, and tries to get the best match and decides
 * which type of log entry to create.
 * @param {object} logLevels - log levels as returned from mergeLevels
 * @param {object} status - response status code.
 * @returns {string} log level that will apply for this error.
 * @private
 */
function getLevel(logLevels, status) {
  const logLevelsArray = Object.keys(logLevels).map(k => parseInt(k, 10)).sort((a, b) => a - b);
  const smallerNumbers = logLevelsArray.filter(k => k <= status);
  if (smallerNumbers.length === 0) {
    return 'none';
  }
  const last = smallerNumbers[smallerNumbers.length - 1];
  return logLevels[last];
}

/**
 * This function checks the error level and finds the right logging function and logs the error.
 * @param {object} args - arguments object.
 * @param {object} args.gasket - gasket object containing config and logger.
 * @param {object} args.logLevels - status code to log level mapping
 * @param {object} args.response - error data including status code and message.
 * @param {Function} [args.customLogger] - custom logging function.
 * @private
 */
function logResponse({ gasket, logLevels, response, customLogger }) {
  const { status } = response;
  const level = getLevel(logLevels, status);
  if (level !== 'none') {
    customLogger
      ? customLogger({ gasket, level, response })
      : gasket.logger[level](serializeResponse(response));
  }
}

/**
 * This function serializes the response object into a string.
 * @param {object} response - response object.
 * @returns {string} - serialized response object.
 */
function serializeResponse(response) {
  return JSON.stringify({
    request: {
      method: get(response, 'request.method'),
      url: get(response, 'request.url'),
      headers: get(response, 'request.headers'),
      body: get(response, 'request.body')
    },
    response: {
      status: response.status,
      headers: response.headers,
      body: response.body
    }
  });
}

export {
  logResponse,
  getLevel
};
