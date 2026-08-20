import { describe, it, expect, beforeEach } from 'vitest';
import wrhsBasePackageRequest from '../lib/wrhs-base-package-request.js';

describe('wrhs base package request', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '../',
        hcs: {
          devMode: false
        }
      }
    };
  });

  it('returns default base package', () => {
    const wrhsRequests = wrhsBasePackageRequest(mockGasket);
    expect(wrhsRequests).toEqual({
      acceptedVariants: [
        '_default'
      ],
      name: '@godaddy/gasket-plugin-hcs',
      version: expect.any(String)
    });
  });

  it('accepts non default variants defined through gasket config', () => {
    mockGasket.config.wrhs = {
      variant: 'abcde1234'
    };
    const wrhsRequests = wrhsBasePackageRequest(mockGasket);
    expect(wrhsRequests).toEqual({
      acceptedVariants: [
        'abcde1234',
        '_default'
      ],
      name: '@godaddy/gasket-plugin-hcs',
      version: expect.any(String)
    });
  });
});
