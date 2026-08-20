import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getProxies } from '../lib/actions.js';

vi.mock('../lib/configure-proxy.js');
vi.mock('../lib/request-adapter.js');
vi.mock('../lib/log.js');

describe('getProxies', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        proxy: {
          proxies: {
            testProxy: { url: 'http://example.com' }
          }
        }
      },
      symbol: Symbol('test')
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an object with proxy functions', () => {
    const proxies = getProxies(mockGasket);
    expect(proxies).toBeInstanceOf(Object);
    // @ts-expect-error - dynamic proxy property
    expect(proxies.testProxy).toBeInstanceOf(Function);
  });

  it('returns cached proxies if already created', () => {
    const firstCall = getProxies(mockGasket);
    const secondCall = getProxies(mockGasket);
    expect(firstCall).toBe(secondCall);
  });

  it('returns empty object if no proxies configured', () => {
    mockGasket.config.proxy.proxies = null;
    const proxies = getProxies(mockGasket);
    expect(proxies).toEqual({});
  });
});
