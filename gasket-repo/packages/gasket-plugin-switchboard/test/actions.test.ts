/* eslint-disable max-nested-callbacks */
import { vi, describe, expect, beforeEach, afterEach, it } from 'vitest';
import type { Gasket } from '@gasket/core';
import actions, { testClearSwitchboardClient } from '../src/actions.js';
import { RequestLike, GasketRequest } from '@gasket/request';

vi.spyOn(console, 'warn').mockImplementation(() => {
});

const mockClient = {};
const startClientMock = vi.fn();
vi.mock('@switchboard/client', () => (
  {
    startClient: (...args: any[]) => {
      startClientMock(...args);
      return new Promise(resolve => setTimeout(() => resolve(mockClient), 100));
    }
  }
));

const mockSwitchboardConfig = {
  mock: 'config',
  setting: 'value'
};

const mockVisitor = {
  locale: 'en-CA',
  plid: 1,
  market: 'en-CA',
  visitorGuid: '123456789',
  visitGuid: '4321'
} as any;

const mockTrace = {
  traceId: '123456789'
};

const mockShopper = {
  shopperId: '987654321',
  customerId: '100000'
};

/** Deferred promise helper for isReady waiting tests. */
function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('actions', function () {
  let gasket: Gasket;
  let req: RequestLike;
  let getValuesTreeMock: ReturnType<typeof vi.fn>;
  let expectedContext: { req: any };

  beforeEach(function () {
    getValuesTreeMock = vi.fn(() => mockSwitchboardConfig);

    gasket = {
      symbol: Symbol('gasket'),
      isReady: Promise.resolve(),
      execWaterfall: vi.fn().mockImplementation(async(hookName, data) => ({
        fromLifecycle: hookName,
        ...data
      })),
      actions: {
        getTraceId: vi.fn().mockResolvedValue(mockTrace.traceId),
        getVisitor: vi.fn(() => mockVisitor),
        checkShopperAuth: vi.fn().mockResolvedValue({ valid: true, details: mockShopper }),
        getSwitchboardClient: vi.fn().mockResolvedValue({
          getValuesTree: getValuesTreeMock
        })
      }
    } as unknown as Gasket;
    gasket.config = {
      env: 'test',
      switchboard: {
        enable: true,
        callingService: 'mock-service',
        dataRetrieval: { 'default|mockApp': {} }
      }
    } as any;

    req = {
      headers: { 'x-example': 'example' }
    };

    expectedContext = expect.objectContaining({
      req: expect.any(GasketRequest)
    });
  });

  afterEach(function () {
    vi.resetAllMocks();
    testClearSwitchboardClient();
  });

  describe('isReady', function () {
    it('getSwitchboardClient waits for gasket.isReady before starting the client', async () => {
      const { promise, resolve } = createDeferred<void>();
      gasket.isReady = promise;

      const actionPromise = actions.getSwitchboardClient(gasket);
      await new Promise(r => setTimeout(r, 10));

      expect(startClientMock).not.toHaveBeenCalled();

      resolve();
      await actionPromise;

      expect(startClientMock).toHaveBeenCalled();
    });

    it('getSwitchboardConfig waits for gasket.isReady before proceeding', async () => {
      const { promise, resolve } = createDeferred<void>();
      gasket.isReady = promise;
      gasket.config.switchboard!.overrides = {
        'default|mockApp': { setting: 'override' }
      };

      const actionPromise = actions.getSwitchboardConfig(gasket, req);
      await new Promise(r => setTimeout(r, 10));

      expect(gasket.execWaterfall).not.toHaveBeenCalled();

      resolve();
      await actionPromise;

      expect(gasket.execWaterfall).toHaveBeenCalled();
    });

    it('getPublicSwitchboardConfig waits for gasket.isReady before proceeding', async () => {
      const { promise, resolve } = createDeferred<void>();
      gasket.isReady = promise;
      gasket.actions.getSwitchboardConfig = vi.fn().mockResolvedValue(mockSwitchboardConfig);

      const actionPromise = actions.getPublicSwitchboardConfig(gasket, req);
      await new Promise(r => setTimeout(r, 10));

      expect(gasket.actions.getSwitchboardConfig).not.toHaveBeenCalled();

      resolve();
      await actionPromise;

      expect(gasket.actions.getSwitchboardConfig).toHaveBeenCalled();
    });

    it('getExperimentCohorts waits for gasket.isReady before proceeding', async () => {
      const { promise, resolve } = createDeferred<void>();
      gasket.isReady = promise;
      gasket.config.switchboard!.overrides = {
        hivemind: {
          experiment1: { cohortId: 'override-cohort1' }
        }
      };

      const actionPromise = actions.getExperimentCohorts(gasket, req);
      await new Promise(r => setTimeout(r, 10));

      expect(gasket.actions.getSwitchboardClient).not.toHaveBeenCalled();

      resolve();
      const result = await actionPromise;

      expect(result).toEqual({
        experiment1: 'override-cohort1'
      });
    });
  });

  describe('getSwitchboardClient', function () {
    it('returns null when when switchboard is disabled', async () => {
      (gasket.config.switchboard as any).enable = false;

      const result = await actions.getSwitchboardClient(gasket);

      expect(startClientMock).not.toHaveBeenCalled();
      expect(result).toBe(null);
    });

    it('only starts the client once', async () => {
      await Promise.all([
        actions.getSwitchboardClient(gasket),
        actions.getSwitchboardClient(gasket),
        actions.getSwitchboardClient(gasket)
      ]);

      expect(startClientMock).toHaveBeenCalledTimes(1);
    });

    it('passes through switchboard gasket config settings', async () => {
      gasket.config.switchboard = {
        callingService: 'my-app',
        auth: {
          certPath: [
            '/etc/pki/tls/certs/my.client.crt',
            '/etc/pki/tls/certs/my.client_intermediate_chain.crt'
          ],
          keyPath: '/etc/pki/tls/private/my.client.key'
        },
        cacheRefreshMs: 600_000,
        env: 'manual',
        envSettings: {
          apiUrls: {
            reporting: 'https://some.service/',
            sso: 'https://fake.url/',
            switchboard: 'https://not.real.url/',
            switchboardFailover: 'https://not.real.url/'
          }
        },
        eventBus: {
          batchSize: 1000,
          flushQueueEveryMs: 50,
          queueLimit: 3_000_000
        },
        dataRetrieval: {
          'default|foo': {
            settings: ['a', 'b', 'c']
          }
        }
      };

      await actions.getSwitchboardClient(gasket);

      expect(startClientMock).toHaveBeenCalledWith({
        ...gasket.config.switchboard,
        reuseExisting: true,
        alias: 'gasket'
      });
    });

    it('does not pass through gasket-only configuration', async () => {
      gasket.config.switchboard = {
        callingService: 'my-app',
        app: 'mockApp',
        apps: ['mockApp', '@hivemind'],
        appLabels: {
          '@hivemind': ['some-label']
        },
        appSettings: {
          '@hivemind': ['some-experiment']
        },
        auth: {
          certPath: [
            '/etc/pki/tls/certs/my.client.crt',
            '/etc/pki/tls/certs/my.client_intermediate_chain.crt'
          ],
          keyPath: '/etc/pki/tls/private/my.client.key'
        },
        cacheRefreshMs: 600_000,
        env: 'manual',
        envSettings: {
          apiUrls: {
            reporting: 'https://some.service/',
            sso: 'https://fake.url/',
            switchboard: 'https://not.real.url/',
            switchboardFailover: 'https://not.real.url/'
          }
        },
        enableGasketData: true,
        enableRedux: true,
        overrides: {
          'default|mockApp': { setting: 'override' }
        },
        enable: true,
        output: {
          multiApp: 'merge'
        }
      };

      await actions.getSwitchboardClient(gasket);

      const configKeys = new Set(Object.keys(startClientMock.mock.calls[0][0]));
      const expectedOmissions = [
        'app',
        'apps',
        'appLabels',
        'appSettings',
        'enable',
        'enableGasketData',
        'enableRedux',
        'output',
        'overrides'
      ];
      expectedOmissions.forEach(key => {
        expect(configKeys).not.toContain(key);
      });
    });

    describe('client option', () => {
      describe('alias', () => {
        it('is set to `gasket`', async () => {
          await actions.getSwitchboardClient(gasket);

          expect(startClientMock).toHaveBeenCalledWith(
            expect.objectContaining({ alias: 'gasket' })
          );
        });
      });

      describe('env', () => {
        it('is set to the gasket environment, if valid', async () => {
          gasket.config.env = 'development';

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.env).toEqual('development');
        });

        it('uses development if the gasket env is local', async () => {
          gasket.config.env = 'local';
          gasket.config.switchboard = {};

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.env).toEqual('development');
        });

        it('uses production if the gasket env is "prod"', async () => {
          gasket.config.env = 'prod';
          gasket.config.switchboard = {};

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.env).toEqual('production');
        });

        it('allows explicitly specified environments', async () => {
          gasket.config.env = 'development';
          gasket.config.switchboard = { env: 'test' };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.env).toEqual('test');
        });

        it('throws if a valid environment could not be resolved', async () => {
          gasket.config.env = 'localTest';
          gasket.config.switchboard = {};

          await expect(actions.getSwitchboardClient(gasket)).rejects.toThrow(Error);
        });
      });

      describe('dataRetrieval', () => {
        it('can be established with a simple app config option', async () => {
          gasket.config.env = 'development';
          gasket.config.switchboard = {
            app: 'mock-app'
          };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.dataRetrieval).toEqual({
            'default|mock-app': {}
          });
        });

        it('allows a fqAppId', async () => {
          gasket.config.env = 'development';
          gasket.config.switchboard = {
            app: 'default|mock-app'
          };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.dataRetrieval).toEqual({
            'default|mock-app': {}
          });
        });

        it('can be established with a list of apps', async () => {
          gasket.config.env = 'development';
          gasket.config.switchboard = {
            apps: ['app1', 'app2']
          };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.dataRetrieval).toEqual({
            'default|app1': {},
            'default|app2': {}
          });
        });

        it('can be established via appSettings', async () => {
          gasket.config.env = 'development';
          gasket.config.switchboard = {
            appSettings: {
              'mockApp': ['foo', 'bar'],
              '@hivemind': ['experiment1', 'experiment2']
            }
          };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.dataRetrieval).toEqual({
            'default|mockApp': {
              settings: ['foo', 'bar']
            },
            'hivemind': {
              settings: ['experiment1', 'experiment2']
            }
          });
        });

        it('can use labels', async () => {
          gasket.config.env = 'development';
          gasket.config.switchboard = {
            appLabels: {
              '@hivemind': ['label1', 'label2']
            }
          };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.dataRetrieval).toEqual({
            hivemind: {
              labels: ['label1', 'label2']
            }
          });
        });

        it('can be set directly', async () => {
          const dataRetrieval = {
            'default|mockApp': {
              settings: ['foo', 'bar']
            },
            'hivemind': {
              settings: ['experiment1', 'experiment2']
            }
          };
          gasket.config.env = 'development';
          gasket.config.switchboard = { dataRetrieval };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.dataRetrieval).toEqual(dataRetrieval);
        });

        it('does not allow retrieval of all hivemind settings', async () => {
          gasket.config.env = 'development';
          gasket.config.switchboard = {
            apps: ['some-app', '@hivemind']
          };

          await expect(actions.getSwitchboardClient(gasket)).rejects.toThrow(Error);
        });
      });

      describe('auth', () => {
        describe('environment merge handler', () => {
          it('prefers certPath and keyPath over IAM auth config', async () => {
            gasket.config.switchboard = {
              auth: {
                primaryRegion: 'us-west-2',
                secondaryRegion: 'us-east-1',
                certPath: ['/some/cert.crt'],
                keyPath: '/some/cert.key'
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              certPath: ['/some/cert.crt'],
              keyPath: '/some/cert.key'
            });
          });

          it('prefers cert and key over IAM auth config', async () => {
            gasket.config.switchboard = {
              auth: {
                primaryRegion: 'us-west-2',
                secondaryRegion: 'us-east-1',
                cert: ['MOCK CERT'],
                key: 'MOCK KEY'
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              cert: ['MOCK CERT'],
              key: 'MOCK KEY'
            });
          });

          it('allows nulls to cancel cert auth settings', async () => {
            gasket.config.switchboard = {
              auth: {
                primaryRegion: 'us-west-2',
                secondaryRegion: 'us-east-1',
                // @ts-expect-error - mockWebpackConfig.externals is not typed
                cert: null,
                // @ts-expect-error - mockWebpackConfig.externals is not typed
                key: null
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              primaryRegion: 'us-west-2',
              secondaryRegion: 'us-east-1'
            });
          });
        });

        it('changes relative cert file paths to absolute', async () => {
          gasket.config.root = '/mock/absolute/path';
          gasket.config.switchboard = {
            env: 'development',
            auth: {
              keyPath: './certs/some.key',
              certPath: ['./certs/some.crt', './certs/some.intermediates.crt']
            }
          };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.auth).toEqual({
            keyPath: '/mock/absolute/path/certs/some.key',
            certPath: [
              '/mock/absolute/path/certs/some.crt',
              '/mock/absolute/path/certs/some.intermediates.crt'
            ]
          });
        });

        it('preserve cert file paths that are already absolute', async () => {
          gasket.config.root = '/mock/absolute/path';
          gasket.config.switchboard = {
            env: 'development',
            auth: {
              keyPath: '/secrets/some.key',
              certPath: ['/secrets/some.crt', '/secrets/some.intermediates.crt']
            }
          };

          await actions.getSwitchboardClient(gasket);
          const clientOptions = startClientMock.mock.calls[0][0];

          expect(clientOptions.auth).toEqual({
            keyPath: '/secrets/some.key',
            certPath: ['/secrets/some.crt', '/secrets/some.intermediates.crt']
          });
        });

        describe('oauth', () => {
          it('passes through oauth_client_credentials auth', async () => {
            gasket.config.switchboard = {
              auth: {
                type: 'oauth_client_credentials',
                clientId: 'my-client-id',
                clientSecret: 'my-client-secret',
                scope: ['switchboard.setting:read']
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_client_credentials',
              clientId: 'my-client-id',
              clientSecret: 'my-client-secret',
              scope: ['switchboard.setting:read']
            });
          });

          it('strips null fields left by environment deep-merge', async () => {
            gasket.config.switchboard = {
              auth: {
                type: 'oauth_client_credentials',
                clientId: 'my-client-id',
                clientSecret: 'my-client-secret',
                // gasket env deep-merge can leave an explicit null behind to
                // cancel an inherited field; `@switchboard/client` rejects nulls
                oauthTokenUrl: null
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_client_credentials',
              clientId: 'my-client-id',
              clientSecret: 'my-client-secret'
            });
          });

          it('passes through oauth_manual auth', async () => {
            gasket.config.switchboard = {
              auth: {
                type: 'oauth_manual',
                initialToken: 'eyJ...'
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_manual',
              initialToken: 'eyJ...'
            });
          });

          it('passes through oauth_iam_exchange auth', async () => {
            gasket.config.switchboard = {
              auth: {
                type: 'oauth_iam_exchange',
                primaryRegion: 'us-west-2',
                secondaryRegion: 'us-east-1'
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_iam_exchange',
              primaryRegion: 'us-west-2',
              secondaryRegion: 'us-east-1'
            });
          });

          it('passes through oauth_cert_exchange auth without collapsing it to cert auth', async () => {
            gasket.config.switchboard = {
              auth: {
                type: 'oauth_cert_exchange',
                cert: ['MOCK CERT'],
                key: 'MOCK KEY'
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_cert_exchange',
              cert: ['MOCK CERT'],
              key: 'MOCK KEY'
            });
          });

          it('resolves relative cert file paths for oauth_cert_path_exchange auth', async () => {
            gasket.config.root = '/mock/absolute/path';
            gasket.config.switchboard = {
              env: 'development',
              auth: {
                type: 'oauth_cert_path_exchange',
                certPath: ['./certs/some.crt', './certs/some.intermediates.crt'],
                keyPath: './certs/some.key',
                scope: ['switchboard.setting:read']
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_cert_path_exchange',
              certPath: [
                '/mock/absolute/path/certs/some.crt',
                '/mock/absolute/path/certs/some.intermediates.crt'
              ],
              keyPath: '/mock/absolute/path/certs/some.key',
              scope: ['switchboard.setting:read']
            });
          });

          it('passes through oauth_cert_path_exchange auth unresolved when keyPath is missing', async () => {
            gasket.config.root = '/mock/absolute/path';
            gasket.config.switchboard = {
              env: 'development',
              // @ts-expect-error - keyPath intentionally omitted to exercise a
              // partial config left behind by env deep-merge
              auth: {
                type: 'oauth_cert_path_exchange',
                certPath: ['./certs/some.crt']
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_cert_path_exchange',
              certPath: ['./certs/some.crt']
            });
          });

          it('routes oauth_iam_exchange past the legacy IAM branch instead of stripping its type', async () => {
            // primaryRegion/secondaryRegion also satisfy the legacy IAM branch's
            // condition; the OAuth check must be reached first or `type` is lost.
            gasket.config.switchboard = {
              auth: {
                type: 'oauth_iam_exchange',
                primaryRegion: 'us-west-2',
                secondaryRegion: 'us-east-1',
                scope: ['switchboard.setting:read']
              }
            };

            await actions.getSwitchboardClient(gasket);
            const clientOptions = startClientMock.mock.calls[0][0];

            expect(clientOptions.auth).toEqual({
              type: 'oauth_iam_exchange',
              primaryRegion: 'us-west-2',
              secondaryRegion: 'us-east-1',
              scope: ['switchboard.setting:read']
            });
          });

          it('throws for a legacy auth configuration that matches no recognized branch', async () => {
            gasket.config.switchboard = {
              // @ts-expect-error - exercising the unrecognized-shape throw path
              auth: { foo: 'bar' }
            };

            await expect(actions.getSwitchboardClient(gasket)).rejects.toThrow(Error);
          });
        });
      });
    });
  });

  describe('getSwitchboardConfig', function () {
    it('returns the data from the getValuesTree method of switchboardClient', async () => {
      const result = await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.actions.getSwitchboardClient).toHaveBeenCalled();
      expect(result).toEqual({
        fromLifecycle: 'switchboardConfigOverride',
        ...mockSwitchboardConfig
      });
    });

    it('uses normalized dataRetrieval config from getClientOptions rather than raw gasket config', async () => {
      // Set up a scenario where the raw config has different apps than the normalized config
      // The raw config only has 'app' but getClientOptions should normalize it to 'dataRetrieval'
      gasket.config.switchboard = {
        app: 'test-app',  // This should be normalized to 'default|test-app' in dataRetrieval
        appSettings: {
          'another-app': ['setting1', 'setting2']  // This should be normalized to 'default|another-app'
        }
      };

      // Mock getValuesTree to track which app IDs are actually requested
      const requestedAppIds: string[] = [];
      getValuesTreeMock.mockImplementation((fqAppId: string) => {
        requestedAppIds.push(fqAppId);
        return { [`${fqAppId}-data`]: 'value' };
      });

      await actions.getSwitchboardConfig(gasket, req);

      // Verify that getValuesTree was called with the normalized app IDs from getClientOptions
      // rather than trying to use the raw config properties directly
      expect(requestedAppIds).toContain('default|test-app');
      expect(requestedAppIds).toContain('default|another-app');

      // Verify it was NOT called with the raw app name
      expect(requestedAppIds).not.toContain('test-app');
      expect(requestedAppIds).not.toContain('another-app');
    });

    it('returns an empty object when disabled', async () => {
      (gasket.config.switchboard as any).enable = false;
      const result = await actions.getSwitchboardConfig(gasket, req);
      expect(result).toEqual({});
    });

    it('can be disabled on a per-request basis', async () => {
      const enableCallback = vi.fn(async () => false);
      gasket.config.switchboard!.enable = enableCallback;

      const result = await actions.getSwitchboardConfig(gasket, req);

      expect(result).toEqual({});
      expect(enableCallback).toHaveBeenCalledWith(expectedContext);
    });

    it('handles empty switchboard config retrieval', async () => {
      delete gasket.config.switchboard;

      const result = await actions.getSwitchboardConfig(gasket, req);

      expect(result).toEqual({
        fromLifecycle: 'switchboardConfigOverride'
      });
    });

    it('executes switchboardPerRequestParams', async () => {
      // @ts-expect-error - gasket.execWaterfall is not typed
      gasket.execWaterfall.mockImplementation(async (_, data) => ({ ...data, favoriteColor: 'blue' }));

      await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith(
        'switchboardPerRequestParams',
        {
          ...mockTrace,
          ...mockVisitor,
          ...mockShopper
        },
        expectedContext
      );
      expect(getValuesTreeMock).toHaveBeenCalledWith(
        'default|mockApp',
        '',
        { ...mockVisitor, ...mockTrace, ...mockShopper, favoriteColor: 'blue' });
    });

    it('supports outputting values keyed by app ID', async () => {
      gasket.config.switchboard!.dataRetrieval = {
        'default|SERP': {},
        'hivemind': {
          labels: ['some-label']
        }
      };
      (getValuesTreeMock as ReturnType<typeof vi.fn>).mockImplementation(fqAppId => {
        switch (fqAppId) {
          case 'default|SERP':
            return { a: 'b' };
          case 'hivemind':
            return { c: 'd' };
          default:
            throw new Error('Unexpected fqAppId');
        }
      });

      gasket.config.switchboard!.output = {
        multiApp: 'group'
      };

      const result = await actions.getSwitchboardConfig(gasket, req);

      expect(result).toEqual({
        fromLifecycle: 'switchboardConfigOverride',
        SERP: { a: 'b' },
        hivemind: { c: 'd' }
      });
    });

    it('handles missing parameters from @godaddy/gasket-plugin-visitor', async () => {
      (gasket.actions.getVisitor as ReturnType<typeof vi.fn>).mockImplementation(() => ({}));

      await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith(
        'switchboardPerRequestParams',
        {
          ...mockTrace,
          ...mockShopper
        },
        expectedContext);
      expect(getValuesTreeMock).toHaveBeenCalledWith(
        'default|mockApp',
        '',
        {
          fromLifecycle: 'switchboardPerRequestParams',
          ...mockTrace,
          ...mockShopper
        });
    });

    it('handles missing parameters from @godaddy/gasket-plugin-traffic', async () => {
      (gasket.actions.getTraceId as ReturnType<typeof vi.fn>).mockImplementation(() => (null));

      await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith(
        'switchboardPerRequestParams',
        {
          ...mockVisitor,
          ...mockShopper
        },
        expectedContext);
      expect(getValuesTreeMock).toHaveBeenCalledWith(
        'default|mockApp',
        '',
        {
          fromLifecycle: 'switchboardPerRequestParams',
          ...mockVisitor,
          ...mockShopper
        });
    });

    it('handles invalid auth from @godaddy/gasket-plugin-auth', async () => {
      (gasket.actions.checkShopperAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ valid: false });

      await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith(
        'switchboardPerRequestParams',
        {
          ...mockVisitor,
          ...mockTrace
        },
        expectedContext);
      expect(getValuesTreeMock).toHaveBeenCalledWith(
        'default|mockApp',
        '',
        {
          fromLifecycle: 'switchboardPerRequestParams',
          ...mockTrace,
          ...mockVisitor
        });
    });

    it('handles missing parameters from @godaddy/gasket-plugin-auth', async () => {
      // @ts-expect-error - gasket.actions.checkShopperAuth is not typed
      delete gasket.actions.checkShopperAuth;

      await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith(
        'switchboardPerRequestParams',
        {
          ...mockVisitor,
          ...mockTrace
        },
        expectedContext);
      expect(getValuesTreeMock).toHaveBeenCalledWith(
        'default|mockApp',
        '',
        {
          fromLifecycle: 'switchboardPerRequestParams',
          ...mockTrace,
          ...mockVisitor
        });
    });

    it('handles missing all standard parameters', async () => {
      (gasket.actions.getTraceId as ReturnType<typeof vi.fn>).mockImplementation(() => (null));
      (gasket.actions.getVisitor as ReturnType<typeof vi.fn>).mockImplementation(() => ({}));
      (gasket.actions.checkShopperAuth as ReturnType<typeof vi.fn>).mockImplementation(() => ({ valid: false }));

      await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith('switchboardPerRequestParams', {}, expectedContext);
      expect(getValuesTreeMock).toHaveBeenCalledWith(
        'default|mockApp',
        '',
        {
          fromLifecycle: 'switchboardPerRequestParams'
        });
    });

    it('executes switchboardConfigOverride', async () => {
      const result = await actions.getSwitchboardConfig(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith('switchboardConfigOverride', mockSwitchboardConfig, expectedContext);
      expect(result).toEqual({
        fromLifecycle: 'switchboardConfigOverride',
        ...mockSwitchboardConfig
      });
    });

    it('returns data in the `switchboard.overrides` Gasket config, if present', async () => {
      gasket.config.switchboard!.overrides = {
        'default|mockApp': { setting: 'override' }
      };

      const result = await actions.getSwitchboardConfig(gasket, req);

      expect(result).toEqual({
        fromLifecycle: 'switchboardConfigOverride',
        setting: 'override'
      });
    });
  });

  describe('getPublicSwitchboardConfig', function () {
    it('calls switchboardBrowserState lifecycle and returns public config', async () => {
      gasket.actions.getSwitchboardConfig = vi.fn(async () => ({
        fromAction: 'getSwitchboardConfig',
        ...mockSwitchboardConfig
      }) as any);

      const result = await actions.getPublicSwitchboardConfig(gasket, req);

      const expectedContent = expect.objectContaining({
        fromAction: 'getSwitchboardConfig',
        ...mockSwitchboardConfig
      });

      expect(gasket.execWaterfall).toHaveBeenCalledWith('switchboardBrowserState', expectedContent, expectedContext);
      expect(result).toEqual({
        fromAction: 'getSwitchboardConfig',
        fromLifecycle: 'switchboardBrowserState',
        ...mockSwitchboardConfig
      });
    });
  });

  describe('getExperimentCohorts', function () {
    beforeEach(() => {
      gasket.config.switchboard!.dataRetrieval!.hivemind = {
        labels: ['some-label']
      };
    });

    it('returns the cohort assignments for Hivemind experiments', async () => {
      getValuesTreeMock.mockImplementation(() => ({
        experiment1: { cohortId: 'cohort1' },
        experiment2: { cohortId: 'cohort2' }
      }));

      const result = await actions.getExperimentCohorts(gasket, req);

      expect(getValuesTreeMock).toHaveBeenCalledWith('hivemind', '', expect.any(Object));
      expect(result).toEqual({
        experiment1: 'cohort1',
        experiment2: 'cohort2'
      });
    });

    it('uses overrides when configured instead of calling switchboard client', async () => {
      // Set up overrides in the gasket config
      gasket.config.switchboard!.overrides = {
        hivemind: {
          experiment1: { cohortId: 'override-cohort1' },
          experiment2: { cohortId: 'override-cohort2' }
        }
      };

      const result = await actions.getExperimentCohorts(gasket, req);

      // Should not call the switchboard client when overrides are present
      expect(getValuesTreeMock).not.toHaveBeenCalled();
      expect(gasket.actions.getSwitchboardClient).not.toHaveBeenCalled();

      // Should return the override values
      expect(result).toEqual({
        experiment1: 'override-cohort1',
        experiment2: 'override-cohort2'
      });
    });
  });
});
