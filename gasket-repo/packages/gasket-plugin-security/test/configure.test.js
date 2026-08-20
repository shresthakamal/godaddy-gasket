import { describe, it, expect } from 'vitest';
import configure from '../lib/configure.js';

describe('The configure lifecycle handler', () => {
  it('adds XSFR-TOKEN to the sensitive cookies list for elastic APM', () => {
    // @ts-expect-error - minimal mock for testing
    const config = configure({}, {});

    // @ts-expect-error - custom config property
    expect(config.elasticAPM).toHaveProperty('sensitiveCookies');
    // @ts-expect-error - custom config property
    expect(config.elasticAPM.sensitiveCookies).toContain('XSRF-TOKEN');
  });
});
