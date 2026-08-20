import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import configure, { getReactMajorVersion } from '../lib/configure.js';

// eslint-disable-next-line no-process-env
const processEnv = process.env;

const FEATURE_FLAG = 'header-experiment-beta';

describe('configure', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {};
    delete processEnv.NEXT_TELEMETRY_DISABLED;
  });

  it('sets NEXT_TELEMETRY_DISABLED=1 if not already set', () => {
    const config = {};

    expect(processEnv).not.toHaveProperty('NEXT_TELEMETRY_DISABLED');

    configure(mockGasket, config);

    expect(processEnv).toHaveProperty('NEXT_TELEMETRY_DISABLED', '1');
  });

  describe('getReactMajorVersion', () => {
    it('resolves React major from the app root', () => {
      expect(getReactMajorVersion(path.join(__dirname, '..'))).toBe(19);
    });

    it('defaults to 18 when react cannot be resolved', () => {
      expect(getReactMajorVersion('/nonexistent-app-root')).toBe(18);
    });
  });

  describe('switchboard hivemind wiring', () => {
    it('does not modify switchboard config when feature flag is off', () => {
      const config = {
        uxp: { features: { [FEATURE_FLAG]: false } },
        switchboard: { app: 'my-app' }
      };

      const result = configure(mockGasket, config);

      expect(result.switchboard).not.toHaveProperty('appLabels');
    });

    it('does not modify switchboard config when feature flag is absent', () => {
      const config = { uxp: {} };

      const result = configure(mockGasket, config);

      expect(result.switchboard).toBeUndefined();
    });

    it('adds hivemindLabels to switchboard.appLabels["@hivemind"] when feature flag is on', () => {
      const config = {
        uxp: {
          features: { [FEATURE_FLAG]: true },
          hivemindLabels: ['experiment-1', 'experiment-2']
        }
      };

      const result = configure(mockGasket, config);

      expect(result.switchboard.appLabels['@hivemind']).toEqual(['experiment-1', 'experiment-2']);
    });

    it('merges hivemindLabels with existing switchboard.appLabels["@hivemind"]', () => {
      const config = {
        uxp: {
          features: { [FEATURE_FLAG]: true },
          hivemindLabels: ['new-experiment']
        },
        switchboard: {
          appLabels: { '@hivemind': ['existing-experiment'] }
        }
      };

      const result = configure(mockGasket, config);

      expect(result.switchboard.appLabels['@hivemind']).toEqual(['existing-experiment', 'new-experiment']);
    });

    it('preserves other switchboard config when wiring hivemind', () => {
      const config = {
        uxp: {
          features: { [FEATURE_FLAG]: true },
          hivemindLabels: ['experiment-1']
        },
        switchboard: {
          app: 'my-app',
          appLabels: { 'other-app': ['other-label'] }
        }
      };

      const result = configure(mockGasket, config);

      expect(result.switchboard.app).toBe('my-app');
      expect(result.switchboard.appLabels['other-app']).toEqual(['other-label']);
      expect(result.switchboard.appLabels['@hivemind']).toEqual(['experiment-1']);
    });

    it('does not inject @hivemind when hivemindLabels is empty and no existing labels', () => {
      const config = {
        uxp: {
          features: { [FEATURE_FLAG]: true }
        }
      };

      const result = configure(mockGasket, config);

      expect(result.switchboard?.appLabels?.['@hivemind']).toBeUndefined();
    });
  });

  describe('externalizeJsxRuntime', () => {
    it('sets externalizeJsxRuntime true for React 19 apps', () => {
      const config = { root: path.join(__dirname, '..') };

      configure(mockGasket, config);

      expect(config.uxp.externalizeJsxRuntime).toBe(true);
    });

    it('sets externalizeJsxRuntime false when react cannot be resolved', () => {
      const config = { root: '/nonexistent-app-root' };

      configure(mockGasket, config);

      expect(config.uxp.externalizeJsxRuntime).toBe(false);
    });

    it('merges with existing uxp config', () => {
      const config = {
        root: path.join(__dirname, '..'),
        uxp: { externals: false }
      };

      configure(mockGasket, config);

      expect(config.uxp.externals).toBe(false);
      expect(config.uxp.externalizeJsxRuntime).toBe(true);
    });
  });
});
