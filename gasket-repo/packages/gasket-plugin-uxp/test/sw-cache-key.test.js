import { describe, it, expect, beforeEach, vi } from 'vitest';
import serviceWorkerCacheKey from '../lib/sw-cache-key.js';

describe('serviceWorkerCacheKey', () => {
  let result, mockReq, mockGasket, mockPC;

  beforeEach(() => {
    mockReq = {};
    mockPC = {
      meta: {
        headers: {
          etag: 'abcd1234'
        }
      }
    };
    mockGasket = {
      actions: {
        getPresentationCentral: vi.fn().mockResolvedValue(mockPC)
      },
      config: {
        presentationCentral: {}
      }
    };
  });

  it('returns meta etag as cache key function', async () => {
    result = await serviceWorkerCacheKey(mockGasket);

    expect(result).toBeInstanceOf(Function);
  });

  it('does not return cache key function if disabled', async () => {
    mockGasket.config.presentationCentral.disabled = true;
    result = await serviceWorkerCacheKey(mockGasket);

    expect(typeof result).toBe('undefined');
  });

  it('cache key function returns a string', async () => {
    const getId = await serviceWorkerCacheKey(mockGasket);

    result = await getId(mockReq);
    expect(typeof result).toBe('string');
  });
});
