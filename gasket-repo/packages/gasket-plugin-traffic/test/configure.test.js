import { describe, it, expect } from 'vitest';
import configure from '../lib/configure.js';
import {
  ATTR_SERVICE_NAME
} from '@opentelemetry/semantic-conventions';

describe('configure', () => {
  const mockGasket = {
    config: {}
  };

  it('returns an object', () => {
    // @ts-expect-error - minimal mock for testing
    const results = configure(mockGasket);
    expect(results).toBeInstanceOf(Object);
  });

  it('adds traceConfig to config', () => {
    // @ts-expect-error - minimal mock for testing
    const results = configure(mockGasket);
    expect(results).toHaveProperty('traceConfig');
  });

  it('traceConfig contains resource with correct service name', () => {
    // @ts-expect-error - minimal mock for testing
    const results = configure(mockGasket);
    // @ts-expect-error - custom config property
    const traceConfig = results.traceConfig;

    expect(traceConfig).toBeDefined();
    expect(traceConfig).toHaveProperty('resource');
    expect(traceConfig.resource).toBeInstanceOf(Object);

    const serviceName =
      traceConfig.resource.attributes[ATTR_SERVICE_NAME];
    expect(serviceName).toBe('gasket-traceid-middleware');
  });
});
