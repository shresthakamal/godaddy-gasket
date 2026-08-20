import { describe, it, expect, beforeEach } from 'vitest';
import configureHook from '../lib/configure.js';

describe('configure', function () {
  let mockGasket, mockConfig;

  beforeEach(function () {
    mockConfig = {};
    mockGasket = {
      config: mockConfig
    };
  });

  it('disables presentationCentral', function () {
    const config = configureHook(mockGasket, mockConfig);
    // @ts-expect-error - custom config property
    expect(config.presentationCentral).toEqual({
      disabled: true
    });
  });

  it('retains existing presentationCentral config', function () {
    mockConfig.presentationCentral = {
      params: {
        app: 'canary.gasket',
        header: 'application-header',
        pwamanifest: '/manifest.json'
      }
    };
    const config = configureHook(mockGasket, mockConfig);
    // @ts-expect-error - custom config property
    expect(config.presentationCentral).toEqual({
      params: {
        app: 'canary.gasket',
        header: 'application-header',
        pwamanifest: '/manifest.json'
      },
      disabled: true
    });
  });
});
