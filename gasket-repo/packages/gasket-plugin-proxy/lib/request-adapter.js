import { normalizeHeaders } from './utils.js';

/**
 * Encapsulates a proxied API response.
 * @type {import('.').ProxyResponse}
 */
class ProxyResponse {
  constructor(status, headers, body = '') {
    if (!status) throw new Error('Missing status response property');
    if (!headers) throw new Error('Missing headers response property');

    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}

/**
 * Checks if the provided error object resembles a Response from fetch.
 * @param {any} error - The error thrown by fetch
 * @returns {boolean} - True if the error is a Response object
 */
function isHttpResponse(error) {
  return (
    error &&
    typeof error.status === 'number' &&
    typeof error.headers?.get === 'function'
  );
}

/**
 * Attempts to parse the body of a fetch error response.
 * @param {Response} error - The error thrown by fetch
 * @returns {Promise<string|object>} Parsed body content or fallback string
 */
async function parseErrorBody(error) {
  try {
    const contentType = error.headers.get('content-type') || '';
    return contentType.includes('application/json')
      ? await error.json()
      : await error.text();
  } catch (err) {
    return `Failed to parse error body: ${err.message}`;
  }
}

/**
 * Creates a ProxyResponse from a failed fetch or thrown error.
 * @param {any} error - The error thrown by fetch
 * @returns {Promise<ProxyResponse>} - A ProxyResponse object
 */
async function handleErrorResponse(error) {
  if (isHttpResponse(error)) {
    const status = error.status;
    const responseHeaders = normalizeHeaders(error.headers);
    const responseBody = await parseErrorBody(error);
    return new ProxyResponse(status, responseHeaders, responseBody);
  }

  const fallbackMessage = error.message || 'Unknown error';
  const fallbackBody = error.stack || fallbackMessage;
  return new ProxyResponse(500, {}, fallbackBody);
}

/**
 * Default adapter to make HTTP requests for the proxy.
 * @type {import('.').RequestAdapter}
 */
// eslint-disable-next-line no-unused-vars
async function defaultRequestAdapter(adapterRequest, requestContext) {
  const { method, url, body, headers } = adapterRequest;

  const requestOptions = {
    method,
    headers: normalizeHeaders(headers)
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const apiResponse = await fetch(url, requestOptions);

    if (!apiResponse.ok) {
      throw apiResponse;
    }

    const contentType = apiResponse.headers.get('content-type');
    const contentLength = apiResponse.headers.get('content-length');

    const isNotJson = !!contentType && !contentType.includes('application/json');
    const isEmptyBody = contentLength === '0' || (apiResponse.status === 204 && !contentLength);

    const responseBody = isNotJson || isEmptyBody
      ? await apiResponse.text()
      : await apiResponse.json();

    // Remove problematic headers (like content-encoding)
    const filteredHeaders = normalizeHeaders(apiResponse.headers, ([key]) =>
      key.toLowerCase() !== 'content-encoding'
    );

    return new ProxyResponse(apiResponse.status, filteredHeaders, responseBody);

  } catch (error) {
    return await handleErrorResponse(error);
  }
}

/**
 * Executes a proxy request using a config and optional transforms.
 * @type {import('.').makeRequest}
 * @private
 */
async function makeRequest(proxyConfig, requestContext) {
  const { originalReq } = requestContext;
  const {
    method,
    url,
    options,
    requestAdapter,
    requestTransform,
    responseTransform
  } = proxyConfig;

  /** @type {import('.').AdapterRequest} */
  let reqConfig = {
    ...options,
    url,
    method
  };

  if (requestTransform) {
    reqConfig = await requestTransform(reqConfig, { originalReq });
  }

  const response = await requestAdapter(reqConfig, requestContext);

  return responseTransform
    ? await responseTransform(response, { req: reqConfig, originalReq })
    : response;
}

export {
  defaultRequestAdapter,
  ProxyResponse,
  makeRequest
};
