import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@godaddy/security-logger');
const { getLoggerOptions } = await import('@godaddy/security-logger');
const actualGetLoggerOptions = (await vi.importActual('@godaddy/security-logger')).getLoggerOptions;

const init = (await import('../lib/init.js')).default.handler;

describe('Init Handler', function () {
  let defaultArg;

  beforeEach(function () {
    defaultArg = {
      config: {
        env: 'production',
        securityLogger: {
          aws: {
            accountId: '123456789',
            accountName: 'mah-aws-account-name'
          },
          serviceFullName: 'some-service'
        },
        winston: {
          level: 'info'
        }
      },
      command: {
        id: 'start'
      }
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('throws if no configuration', function () {
    delete defaultArg.config.securityLogger;
    expect(() => init(defaultArg)).toThrow();
  });


  it('gets winston options from security-logger', function () {
    init(defaultArg);
    expect(getLoggerOptions).toHaveBeenCalledWith({
      aws: {
        accountId: '123456789',
        accountName: 'mah-aws-account-name'
      },
      serviceFullName: 'some-service'
    }, {
      level: 'info'
    });
  });

  it('sets winston in config', function () {
    getLoggerOptions.mockImplementation(actualGetLoggerOptions);

    init(defaultArg);

    expect(defaultArg.config.winston).toEqual(expect.objectContaining({
      level: 'info',
      levels: expect.objectContaining({
        security: 0,
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
      })
    }));
  });

  it('does not require any winston config', function () {
    getLoggerOptions.mockImplementation(actualGetLoggerOptions);
    delete defaultArg.config.winston;

    expect(getLoggerOptions).not.toHaveBeenCalled();
    expect(defaultArg.config.winston).toBeUndefined();

    init(defaultArg);

    expect(getLoggerOptions).toHaveBeenCalled();
    expect(defaultArg.config.winston).toEqual(expect.objectContaining({
      format: expect.any(Object),
      levels: expect.objectContaining({
        security: 0,
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
      })
    }));
  });
});
