import { describe, it, expect, beforeEach, vi } from 'vitest';
import getContentSecurityPolicy from '../lib/get-content-security-policy.js';
import { createHash, createNonce } from '../lib/utils.js';

describe('getContentSecurityPolicy', function () {
  let gasket, req, res;

  beforeEach(function () {
    gasket = {
      config: {},
      execWaterfall: vi.fn().mockImplementation((_, csp) => csp),
      logger: {
        warn: vi.fn()
      }
    };

    req = {
      hostname: 'www.godaddy.com'
    };

    res = {};
  });

  it('returns default policy', async function () {
    const results = await getContentSecurityPolicy(gasket, { req, res });
    expect(results).toHaveProperty('default-src');
    expect(results).toHaveProperty('script-src');
  });

  it('invokes lifecycle with context and utils', async function () {
    const context = { req, res };
    await getContentSecurityPolicy(gasket, context);
    expect(gasket.execWaterfall).toHaveBeenCalled();
    expect(gasket.execWaterfall.mock.calls[0][2]).toEqual(context);
    expect(gasket.execWaterfall.mock.calls[0][3]).toEqual({ createHash, createNonce });
  });

  it('returns policy modified by lifecycle', async function () {
    gasket.execWaterfall.mockImplementationOnce((_, csp) => ({ ...csp, 'fake-src': ['bogus'] }));
    const results = await getContentSecurityPolicy(gasket, { req, res });
    expect(results).toHaveProperty('default-src');
    expect(results).toHaveProperty('script-src');
    expect(results).toHaveProperty('fake-src');
    expect(results['fake-src']).toEqual(['bogus']);
  });
});
