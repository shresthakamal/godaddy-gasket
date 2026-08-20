import { CreateClientParams } from 'contentful';
import { Query } from '../types.js';

// Reference: https://www.contentful.com/developers/docs/references/errors/
const ERROR = {
  BAD_REQUEST: 'BadRequest',
  INVALID_QUERY: 'InvalidQuery',
  ACCESS_TOKEN_INVALID: 'AccessTokenInvalid',
  ACCESS_DENIED: 'AccessDenied',
  NOT_FOUND: 'NotFound',
  RATE_LIMIT_EXCEEDED: 'RateLimitExceeded',
  SERVER_ERROR: 'ServerError'
} as const;

/**
 *
 */
function tryParseError(error: Error) {
  try {
    return JSON.parse(error.message);
  } catch (parseError: any) {
    if (typeof error === 'string') return { error };
    throw new Error(`contentful: failed to parse error message.`);
  }
}

/**
 *
 */
function parseNotFound(message: Record<string, any>, clientParams: CreateClientParams) {
  const { details } = message;
  if (!details || !details.type) {
    return {
      error: `contentful: resource not found, but reason is unknown.`
    };
  }
  switch (details.type) {
    case 'Environment':
      return {
        error: `contentful: environment ${details.id} does not exist for spaceId: ${clientParams.space} or the access token is not enabled for it.`
      };
    default:
      return {
        error: `contentful: ${details.type} ${details.id} not found.`
      };
  }
}

export type ParsedContentfulError = {
  query?: Query;
  error: any;
}

/**
 *
 */
export function parseContentfulError(error: Error, query: Query, clientParams: CreateClientParams): ParsedContentfulError {
  const message = tryParseError(error);

  switch (error.name) {
    case ERROR.INVALID_QUERY:
      return {
        query,
        error: message.message
      };
    case ERROR.NOT_FOUND:
      return parseNotFound(message, clientParams);
    default:
      return { error: error.message };
  }
}
