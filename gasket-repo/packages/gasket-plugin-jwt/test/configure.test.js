// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import configure from '../lib/configure.js';

describe('configure lifecycle', () => {
  it('should migrate riskLevel to securityLevel with deprecation warning', () => {
    const mockLogger = { warn: vi.fn() };
    const mockGasket = { logger: mockLogger };
    const config = {
      jwt: {
        'my-service': {
          ssoHost: 'sso.test.com',
          riskLevel: 2,
          auths: ['basic']
        }
      }
    };

    const result = configure(mockGasket, config);

    // Should migrate riskLevel to securityLevel
    expect(result.jwt['my-service']).toHaveProperty('securityLevel', 2);
    expect(result.jwt['my-service']).not.toHaveProperty('riskLevel');

    // Should log deprecation warning
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('riskLevel')
    );
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('securityLevel')
    );
  });

  it('should not migrate if securityLevel is already set', () => {
    const mockLogger = { warn: vi.fn() };
    const mockGasket = { logger: mockLogger };
    const config = {
      jwt: {
        'my-service': {
          ssoHost: 'sso.test.com',
          riskLevel: 1,
          securityLevel: 2,
          auths: ['basic']
        }
      }
    };

    const result = configure(mockGasket, config);

    // Should keep securityLevel and riskLevel as-is
    expect(result.jwt['my-service']).toHaveProperty('securityLevel', 2);
    expect(result.jwt['my-service']).toHaveProperty('riskLevel', 1);

    // Should not log warning if securityLevel is present
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should handle configs without jwt section', () => {
    const mockGasket = { logger: { warn: vi.fn() } };
    const config = { other: 'config' };

    const result = configure(mockGasket, config);

    expect(result).toEqual(config);
  });

  it('should not modify config if no riskLevel is present', () => {
    const mockLogger = { warn: vi.fn() };
    const mockGasket = { logger: mockLogger };
    const config = {
      jwt: {
        'my-service': {
          ssoHost: 'sso.test.com',
          securityLevel: 2,
          auths: ['basic']
        }
      }
    };

    const result = configure(mockGasket, config);

    expect(result).toBe(config); // Should return same reference
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should handle multiple services with mixed configurations', () => {
    const mockLogger = { warn: vi.fn() };
    const mockGasket = { logger: mockLogger };
    const config = {
      jwt: {
        'service-old': {
          ssoHost: 'sso.test.com',
          riskLevel: 1
        },
        'service-new': {
          ssoHost: 'sso.test.com',
          securityLevel: 2
        },
        'service-both': {
          ssoHost: 'sso.test.com',
          riskLevel: 1,
          securityLevel: 3
        }
      }
    };

    const result = configure(mockGasket, config);

    // service-old should be migrated
    expect(result.jwt['service-old']).toHaveProperty('securityLevel', 1);
    expect(result.jwt['service-old']).not.toHaveProperty('riskLevel');

    // service-new should remain unchanged
    expect(result.jwt['service-new']).toHaveProperty('securityLevel', 2);

    // service-both should not be migrated (securityLevel takes precedence)
    expect(result.jwt['service-both']).toHaveProperty('securityLevel', 3);
    expect(result.jwt['service-both']).toHaveProperty('riskLevel', 1);

    // Should warn only for service-old
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('service-old')
    );
  });

  it('should handle missing logger gracefully', () => {
    const mockGasket = {}; // No logger
    const config = {
      jwt: {
        'my-service': {
          ssoHost: 'sso.test.com',
          riskLevel: 2
        }
      }
    };

    // Should not throw
    expect(() => {
      configure(mockGasket, config);
    }).not.toThrow();
  });
});
