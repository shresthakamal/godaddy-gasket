import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enums } from '@godaddy/security-logger';

const { kind, category, outcome } = enums;

const checkAuthLogging = (await import('../lib/check-auth-logging.js')).default;

describe('Init Handler', function () {
  let gasket;
  let authData;
  let secLog;

  beforeEach(function () {
    gasket = {
      config: {
        securityLogger: {}
      },
      logger: {
        security: vi.fn()
      }
    };
    secLog = gasket.logger.security;

    authData = {
      success: true,
      message: 'I did it!',
      req: {
        id: 'some-id',
        method: 'POST',
        url: '/foo/bar',
        headers: {
          'host': 'some.godaddy.com',
          'x-request-id': 'another-id'
        },
        ip: '10.11.12.13'
      },
      other: 'stuff',
      can: 'be here'
    };
  });

  it('throws if no logger.security', async function () {
    delete gasket.logger.security;
    await expect(() => checkAuthLogging(gasket, authData)).rejects.toThrow();
  });

  it('no-ops if securityLogger is disabled', async function () {
    gasket.config.securityLogger.disabled = true;
    await checkAuthLogging(gasket, authData);

    expect(secLog).not.toHaveBeenCalled();
  });

  it('can log successful authentications', async function () {
    await checkAuthLogging(gasket, authData);

    expect(secLog).toHaveBeenCalledWith('Authentication: I did it!', {
      gasketAuth: {
        other: 'stuff',
        can: 'be here'
      },
      http: { request: { method: 'POST' } },
      url: { path: '/foo/bar' },
      client: { ip: '10.11.12.13' },
      event: {
        kind: kind.event,
        category: category.authentication,
        outcome: outcome.success
      },
      host: {
        hostname: 'some.godaddy.com'
      },
      transaction: {
        id: 'some-id'
      }
    });
  });

  it('can log failed authentications', async function () {
    authData.message = 'uh oh spaghettios';
    authData.success = false;
    await checkAuthLogging(gasket, authData);

    expect(secLog).toHaveBeenCalledWith('Authentication: uh oh spaghettios', {
      gasketAuth: {
        other: 'stuff',
        can: 'be here'
      },
      http: { request: { method: 'POST' } },
      url: { path: '/foo/bar' },
      client: { ip: '10.11.12.13' },
      event: {
        kind: kind.event,
        category: category.authentication,
        outcome: outcome.failure
      },
      host: {
        hostname: 'some.godaddy.com'
      },
      transaction: {
        id: 'some-id'
      }
    });
  });

  it('can log request ids from header if no req.id', async function () {
    delete authData.req.id;
    await checkAuthLogging(gasket, authData);

    expect(secLog).toHaveBeenCalledWith(
      'Authentication: I did it!',
      expect.objectContaining({
        gasketAuth: expect.any(Object),
        client: expect.any(Object),
        event: expect.any(Object),
        host: expect.any(Object),
        http: expect.any(Object),
        url: expect.any(Object),
        transaction: expect.any(Object)
      })
    );
  });

  it('can log without request ids', async function () {
    delete authData.req.id;
    delete authData.req.headers['x-request-id'];
    await checkAuthLogging(gasket, authData);

    expect(secLog).toHaveBeenCalledWith(
      'Authentication: I did it!',
      expect.objectContaining({
        gasketAuth: expect.any(Object),
        client: expect.any(Object),
        event: expect.any(Object),
        host: expect.any(Object),
        http: expect.any(Object),
        url: expect.any(Object)
      })
    );
  });

  it('will still log if no req (extra safety check)', async function () {
    // This shouldn't happen, but... just in case, make sure we don't bring down the app
    delete authData.req;
    await checkAuthLogging(gasket, authData);

    expect(secLog).toHaveBeenCalledWith('Authentication: I did it!', {
      gasketAuth: {
        other: 'stuff',
        can: 'be here'
      },
      http: { request: { method: void 0 } },
      url: { path: void 0 },
      client: { ip: void 0 },
      event: {
        kind: kind.event,
        category: category.authentication,
        outcome: outcome.success
      },
      host: {
        hostname: void 0
      }
    });
  });
});
