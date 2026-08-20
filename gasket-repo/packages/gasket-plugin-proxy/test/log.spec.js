import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  logResponse,
  getLevel
} from '../lib/log.js';

describe('log', function () {
  let results;
  let gasket;

  beforeEach(() => {
    gasket = {
      logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn()
      },
      config: {}
    };
  });

  describe('#getLevel', function () {

    it('returns exact match from an unsorted list', function () {
      results = getLevel({ 500: 'error', 400: 'warn1', 399: 'warn2', 300: 'info' }, 399);
      expect(results).toEqual('warn2');
    });

    it('returns exact match from a sorted list', function () {
      results = getLevel({ 300: 'info', 399: 'warn2', 400: 'warn1', 500: 'error' }, 399);
      expect(results).toEqual('warn2');
    });

    it('returns previous number if no exact match', function () {
      results = getLevel({ 500: 'error', 400: 'warn1', 399: 'warn2', 300: 'info' }, 390);
      expect(results).toEqual('info');
      results = getLevel({ 500: 'error', 400: 'warn1', 399: 'warn2', 300: 'info' }, 404);
      expect(results).toEqual('warn1');
    });

    it('returns default if nothing matches', function () {
      results = getLevel({ 300: 'info', 399: 'warn2', 400: 'warn1', 500: 'error' }, 1);
      expect(results).toEqual('none');
    });
  });

  describe('#logResponse', function () {
    let logLevels;

    beforeEach(() => {
      logLevels = {
        200: 'none',
        300: 'info',
        400: 'warn',
        500: 'error'
      };
    });

    it('uses error level for logging 5xx errors by default', function () {
      logResponse({ gasket, logLevels, response: { status: 500 } });
      expect(gasket.logger.error.mock.calls).toHaveLength(1);
    });

    it('uses warn level for logging 4xx errors by default', function () {
      logResponse({ gasket, logLevels, response: { status: 400 } });
      expect(gasket.logger.warn.mock.calls).toHaveLength(1);
    });

    it('uses info level for logging 3xx responses by default', function () {
      logResponse({ gasket, logLevels, response: { status: 300 } });
      expect(gasket.logger.info.mock.calls).toHaveLength(1);
    });

    it('does not log 2xx responses by default', function () {
      logResponse({ gasket, logLevels, response: { status: 200 } });
      expect(gasket.logger.error.mock.calls).toHaveLength(0);
      expect(gasket.logger.warn.mock.calls).toHaveLength(0);
      expect(gasket.logger.info.mock.calls).toHaveLength(0);
      expect(gasket.logger.debug.mock.calls).toHaveLength(0);
    });

    it('supports a custom logging function', function () {
      const customLogger = vi.fn();
      const response = { status: 404 };

      logResponse({ gasket, logLevels, response, customLogger });

      expect(customLogger)
        .toHaveBeenCalledWith({ gasket, level: 'warn', response });
    });

    it('does not attempt circular serialization', function () {
      const request = {
        method: 'get',
        url: 'https://some.url/',
        headers: { authorization: 'sso-jwt blahblahblah' }
      };
      const response = {
        request,
        status: 500,
        body: { message: 'You are a bad person and should feel bad.' }
      };
      request.response = response;

      expect(() => logResponse({ gasket, logLevels, response })).not.toThrow(Error);
    });
  });
});
