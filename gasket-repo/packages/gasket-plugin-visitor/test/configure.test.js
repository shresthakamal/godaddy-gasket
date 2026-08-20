import { describe, it, expect } from 'vitest';
import configure from '../lib/configure.js';

const gasket = { logger: { warn: () => {}, error: () => {} } };

describe('configure', () => {
  it('returns baseConfig unchanged when no visitor config is set', () => {
    const baseConfig = { other: 1 };
    expect(configure(gasket, baseConfig)).toBe(baseConfig);
  });

  it('returns baseConfig unchanged when visitor.priority is not set', () => {
    const baseConfig = { visitor: { debug: true } };
    expect(configure(gasket, baseConfig)).toBe(baseConfig);
  });

  it('accepts a fully valid priority config', () => {
    const baseConfig = {
      visitor: {
        priority: {
          hostname: ['x-forwarded', 'x-dsa-host', 'host'],
          plid: ['query', 'cookie', 'hostname'],
          market: ['query', 'header', 'cookie', 'accept-language'],
          currency: ['query', 'header', 'cookie'],
          visitorGuid: ['cookie', 'header']
        }
      }
    };
    expect(() => configure(gasket, baseConfig)).not.toThrow();
  });

  it('accepts a partial priority array', () => {
    const baseConfig = { visitor: { priority: { hostname: ['x-forwarded'] } } };
    expect(() => configure(gasket, baseConfig)).not.toThrow();
  });

  it('accepts an empty array', () => {
    const baseConfig = { visitor: { priority: { hostname: [] } } };
    expect(() => configure(gasket, baseConfig)).not.toThrow();
  });

  it('throws when priority is not an object', () => {
    const baseConfig = { visitor: { priority: ['hostname'] } };
    expect(() => configure(gasket, baseConfig)).toThrow(
      /visitor\.priority must be an object/
    );
  });

  it('throws on unknown field name', () => {
    const baseConfig = { visitor: { priority: { foo: ['query'] } } };
    expect(() => configure(gasket, baseConfig)).toThrow(
      /visitor\.priority\.foo.*Unknown field.*hostname.*plid.*market.*currency.*visitorGuid/s
    );
  });

  it('throws when a field value is not an array', () => {
    const baseConfig = { visitor: { priority: { hostname: 'x-forwarded' } } };
    expect(() => configure(gasket, baseConfig)).toThrow(
      /visitor\.priority\.hostname must be an array/
    );
  });

  it('throws when a key is not a string', () => {
    const baseConfig = { visitor: { priority: { hostname: [123] } } };
    expect(() => configure(gasket, baseConfig)).toThrow(
      /visitor\.priority\.hostname.*must be strings/
    );
  });

  it('throws on unknown source key with field, key, and allowed set in message', () => {
    const baseConfig = { visitor: { priority: { hostname: ['cooky'] } } };
    expect(() => configure(gasket, baseConfig)).toThrow(
      /visitor\.priority\.hostname.*'cooky'.*Allowed.*x-dsa-host.*x-forwarded.*host/s
    );
  });

  it('throws on duplicate keys in array', () => {
    const baseConfig = {
      visitor: { priority: { hostname: ['x-dsa-host', 'x-dsa-host'] } }
    };
    expect(() => configure(gasket, baseConfig)).toThrow(
      /visitor\.priority\.hostname.*duplicate.*x-dsa-host/
    );
  });

  it('throws using the singular cookie key when "cookies" is supplied', () => {
    const baseConfig = { visitor: { priority: { plid: ['cookies'] } } };
    expect(() => configure(gasket, baseConfig)).toThrow(
      /visitor\.priority\.plid.*'cookies'/
    );
  });
});
