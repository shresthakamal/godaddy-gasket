/* eslint-disable no-undefined, @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect } from 'vitest';
import configure from '../src/configure.js';

describe('configure', () => {

  it('throws when sources is undefined', () => {
    const mockConfig = {
      content: {},
      contentful: {
        spaces: {}
      }
    };

    expect(() => {
      // @ts-expect-error
      configure({}, mockConfig);
    }).toThrow();
  });

  it('allows other plugin sources', () => {
    const mockConfig = {
      contentful: {
        spaces: {
          source1: {
            space: 'space',
            mainEnvironment: 'master',
            deliveryToken: 'delivery123',
            previewToken: 'preview456',
            contentSettings: {}
          }
        }
      }
    };

    expect(() => {
      // @ts-expect-error
      configure({}, mockConfig);
    }).not.toThrow();
  });

  describe('remote mainEnvironment', () => {
    it('throws when each source does not have a space declaration', () => {
      const mockConfig = {
        contentful: {
          spaces: {
            source1: {
              space: 'space',
              mainEnvironment: 'master',
              deliveryToken: 'delivery123',
              previewToken: 'preview456',
              contentSettings: {}
            },
            source2: {
              space: undefined,
              mainEnvironment: 'master',
              deliveryToken: 'delivery123',
              previewToken: 'preview456',
              contentSettings: {}
            }
          }
        }
      };

      expect(() => {
        // @ts-expect-error
        configure({}, mockConfig);
      }).toThrow();
    });

    it('throws for invalid Contentful config', () => {
      const mockConfig = {
        contentful: {
          spaces: {
            source1: {
              space: undefined,
              mainEnvironment: 'master',
              deliveryToken: 'deliveryToken123',
              previewToken: 'previewToken123',
              contentSettings: {}
            }
          }
        }
      };

      expect(() => {
        // @ts-expect-error
        configure({}, mockConfig);
      }).toThrow('missing config (space)');
    });
  });

  describe('local mainEnvironment', () => {
    const mockGasket = {
      logger: {
        warn: vi.fn()
      }
    } as any;

    it('throws when without one valid space config', () => {
      const mockConfig = {
        env: 'local',
        contentful: {
          spaces: {
            source1: {
              space: undefined,
              mainEnvironment: 'master',
              deliveryToken: 'delivery123',
              previewToken: 'preview456',
              contentSettings: {}
            }
          }
        }
      };


      expect(() => {
        configure(mockGasket, mockConfig as any);
      }).toThrow('At least one Contentful space needs to be configured.');
    });

    it('removes invalid space configurations', async () => {
      const mockConfig = {
        env: 'local',
        contentful: {
          spaces: {
            source1: {
              space: 'space',
              mainEnvironment: 'master',
              deliveryToken: 'delivery123',
              previewToken: 'preview456',
              contentSettings: {}
            },
            source2: {
              space: undefined,
              mainEnvironment: 'master',
              deliveryToken: 'delivery123',
              previewToken: 'preview456',
              contentSettings: {}
            }
          }
        }
      };

      // @ts-expect-error
      const config = configure(mockGasket, mockConfig);
      expect(config.contentful.spaces?.source2).toBe(undefined);
    });
  });
});
