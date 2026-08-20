/**
 * Default log levels configuration
 * @type {{'200': string, '400': string, '500': string}}
 * @private
 */
export const defaultLogLevels = {
  200: 'none',
  400: 'warn',
  500: 'error'
};

/**
 * Default cache config
 * @type {{max: number, maxAge: number}}
 * @private
 */
export const defaultCache = {
  max: 50,
  maxAge: 360000
};
