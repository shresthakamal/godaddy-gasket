import { describe, it, expect, beforeEach } from 'vitest';
import switchboardPerRequestParams from '../lib/switchboard-params.js';

describe('switchboardPerRequestParams hook', () => {
  let mockGasket, req, params;

  beforeEach(() => {
    req = { headers: {} };
    params = { visitorGuid: 'abc-123', plid: 1 };
    mockGasket = { config: {} };
  });

  it('returns params unchanged when feature flag is off', () => {
    mockGasket.config.uxp = { features: { 'header-experiment-beta': false } };
    mockGasket.config.presentationCentral = { params: { app: 'my-app' } };

    const result = switchboardPerRequestParams(mockGasket, params, { req });

    expect(result).not.toHaveProperty('app');
  });

  it('returns params unchanged when feature flag is absent', () => {
    const result = switchboardPerRequestParams(mockGasket, params, { req });

    expect(result).toEqual({ visitorGuid: 'abc-123', plid: 1 });
    expect(result).not.toHaveProperty('app');
  });

  it('returns params unchanged when no app is configured', () => {
    mockGasket.config.uxp = { features: { 'header-experiment-beta': true } };

    const result = switchboardPerRequestParams(mockGasket, params, { req });

    expect(result).not.toHaveProperty('app');
  });

  it('returns params unchanged when presentationCentral config is absent', () => {
    mockGasket.config.uxp = { features: { 'header-experiment-beta': true } };
    mockGasket.config.presentationCentral = {};

    const result = switchboardPerRequestParams(mockGasket, params, { req });

    expect(result).not.toHaveProperty('app');
  });

  it('adds app from presentationCentral.params.app to switchboard params', () => {
    mockGasket.config.uxp = { features: { 'header-experiment-beta': true } };
    mockGasket.config.presentationCentral = {
      params: { app: 'storefront-header' }
    };

    const result = switchboardPerRequestParams(mockGasket, params, { req });

    expect(result.app).toBe('storefront-header');
  });

  it('preserves existing params when adding app', () => {
    mockGasket.config.uxp = { features: { 'header-experiment-beta': true } };
    mockGasket.config.presentationCentral = {
      params: { app: 'my-app' }
    };

    const result = switchboardPerRequestParams(mockGasket, params, { req });

    expect(result.visitorGuid).toBe('abc-123');
    expect(result.plid).toBe(1);
    expect(result.app).toBe('my-app');
  });

  it('does not mutate the original params object', () => {
    mockGasket.config.uxp = { features: { 'header-experiment-beta': true } };
    mockGasket.config.presentationCentral = {
      params: { app: 'my-app' }
    };

    const original = { ...params };
    switchboardPerRequestParams(mockGasket, params, { req });

    expect(params).toEqual(original);
  });
});
