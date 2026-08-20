import type { IncomingMessage, ServerResponse } from 'http';
import type { GasketConfigDefinition } from '@gasket/core';
import type { Options as CacheConfigOptions } from 'lru-cache';
import '@godaddy/gasket-plugin-proxy';
import {
  MaybeDynamic,
  AdapterRequest,
  ConfigContext,
  LogLevelsConfig,
  OptionsConfig,
  ProxyResponse,
  RequestContext
} from '@godaddy/gasket-plugin-proxy';
import type { NextFunction } from 'express';

describe('@godaddy/gasket-plugin-proxy', function () {
  it('allows proxy section in Gasket config', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      proxy: {
        proxies: {},
        options: {
          headers: {
            'x-always': 'use this header'
          }
        },
        cache: {
          max: 10,
          maxAge: 1000
        },
        logLevels: {
          200: 'info'
        },
        requestAdapter: (adapterRequest: AdapterRequest) => {
          return new Promise((resolve, reject) => {
            const response: ProxyResponse = {
              status: 200,
              headers: {
                'x-custom': 'value'
              },
              body: 'some response'
            };
            resolve(response);
          });
        }
      }
    };

    const configWithCb: GasketConfigDefinition = {
      plugins: [],
      proxy: {
        proxies: {},
        options: (ctx) => {
          const { req, gasket } = ctx;
          const results: OptionsConfig = {
            headers: {
              'x-always': 'use this header'
            },
            // @ts-expect-error - OptionsConfig is not typed
            bogus: true
          };
          return results;
        },
        cache: (ctx: ConfigContext) => {
          const { req, gasket } = ctx;
          const results: MaybeDynamic<CacheConfigOptions<string, number>> = {
            max: 10,
            maxAge: 1000,
            // @ts-expect-error - MaybeDynamic is not typed
            bogus: true
          };
          return results;
        },
        logLevels: (ctx) => {
          const { req, gasket } = ctx;
          const results: LogLevelsConfig = {
            200: 'info',
            // @ts-expect-error - LogLevelsConfig is not typed
            bogus: true
          };
          return results;
        }
      }
    };
  });

  it('allows proxies to be configured in Gasket config', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      proxy: {
        proxies: {
          getBasic: {
            url: '/api/proxies/doodads',
            targetUrl: 'https://api.my-service.com/doodads'
          },
          postWithMiddleware: {
            method: 'POST',
            url: '/api/proxies/doodads',
            targetUrl: 'https://api.my-service.com/doodads',
            middleware: [(req: IncomingMessage, res: ServerResponse<IncomingMessage>, next: NextFunction) => {
              next();
            }],
            options: {
              headers: {
                'x-more': 'custom header jazz'
              }
            }
          },
          getWithRequestTx: {
            url: '/api/proxies/doodads',
            targetUrl: (ctx) => {
              const { req, gasket } = ctx;
              const host = 'host' in req.headers ? req.headers.host : 'unknown';
              return `https://api.my-service.com/doodads?from=${host}`;
            },
            requestTransform: (request: AdapterRequest) => {
              const results: AdapterRequest = {
                ...request,
                headers: {
                  'x-custom-value': 'MyValue'
                }
              };
              return results;
            }
          },
          getWithRequestTxCb: {
            url: '/api/proxies/doodads',
            targetUrl: 'https://api.my-service.com/doodads',
            requestTransform: (ctx: ConfigContext) => (request: AdapterRequest) => {
              const { req, gasket } = ctx;
              const results: AdapterRequest = {
                ...request,
                headers: {
                  'x-custom-host': 'example.com'
                }
              };
              return results;
            }
          },
          getWithResponseTx: {
            url: '/api/proxies/doodads',
            targetUrl: 'https://api.my-service.com/doodads',
            responseTransform: (response: ProxyResponse) => {
              const results: ProxyResponse = {
                status: 200,
                headers: { 'x-custom-awesome': 'yes' },
                body: JSON.parse(response.body)
              };
              return results;
            }
          },
          getWithResponseTxCb: {
            url: '/api/proxies/doodads',
            targetUrl: 'https://api.my-service.com/doodads',
            responseTransform: (ctx: ConfigContext) => (response: ProxyResponse) => {
              const { req, gasket } = ctx;

              let custom = 'host' in req.headers ? req.headers.host : 'unknown';
              if (Array.isArray(custom)) {
                custom = custom.join(',');
              }

              const results: ProxyResponse = {
                status: 200,
                headers: {
                  'x-custom-awesome': 'yes',
                  'x-custom-host': custom
                },
                body: JSON.parse(response.body)
              };
              return results;
            }
          },
          getWithBufferInResponse: {
            targetUrl: 'https://usi-ss-chatterbox.int.dev-godaddy.com/v1/jobs/User/:key',
            url: '/webhookProxy/v1/jobs/User/:key',
            method: 'GET'
          }
        }
      }
    };
  });

  it('supports req.proxies', function () {
    /**
     *
     * @param req
     * @param res
     * @param next
     */
    function middleware(
      req: IncomingMessage,
      res: ServerResponse<IncomingMessage>,
      next: (err?: Error) => void
    ) {
      req.proxies?.getDoodadList?.();
      req.proxies?.getDoodadList?.(req);
    }
  });
});
