/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-intl" />
/// <reference types="@godaddy/gasket-plugin-visitor" />

import deepFreeze from 'deep-freeze-strict';
import deepMerge from 'deepmerge';
import { default as produce } from 'immer';
import express from 'express';
import { performance } from 'node:perf_hooks';
import { SpanStatusCode, trace } from '@opentelemetry/api';

import createAssetManager from './asset-manager/asset-manager.js';
import renderManifest from './asset-manager/render-manifest.js';
import getSSRInstance from './ssr.js';
import wrhsAssets from './wrhs-assets.js';
import registerDefaultHcsAssets from './default-hcs-assets.js';
import wrhsBasePackageRequest from './wrhs-base-package-request.js';

import fetchPCS from './pcs.js';
import renderHeader from './render-header.js';
import renderFooter from './render-footer.js';
import generateHydrateScript from './generate-hydrate-script.js';

const hcsTracer = trace.getTracer('@godaddy/gasket-plugin-hcs');

/**
 * Run async work inside an OpenTelemetry span (child of the active HTTP request span when present).
 * @template T
 * @param {string} spanName - Span name (e.g. `gasket.hcs.fetchPCS`).
 * @param {(span: import('@opentelemetry/api').Span) => Promise<T>} fn - Async work; receives the span for attributes.
 * @returns {Promise<T>} Resolves with the callback result.
 */
function withHcsSpan(spanName, fn) {
  return hcsTracer.startActiveSpan(spanName, async (span) => {
    try {
      return await fn(span);
    } catch (err) {
      span.recordException(err);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err)
      });
      throw err;
    } finally {
      span.end();
    }
  });
}

/**
 * @param {{ info: (msg: string) => void }} logger
 * @param {import('express').Request} req
 * @param {number} start - `performance.now()` when the request handler started
 */
function logHcsRequest(logger, req, start) {
  const ms = (performance.now() - start).toFixed(3);
  const path = (req.originalUrl && req.originalUrl.split('?')[0]) || req.path || '';
  logger.info(`[gasket-hcs] ${req.method} ${path} - ${ms} ms`);
}

export default {
  getMergedProps,
  registerAssets,
  timing: {
    after: ['@gasket/plugin-express']
  },
  /** @type {import('@gasket/core').HookHandler<'express'>} */
  handler: (gasket, app) => {
    // eslint-disable-next-line max-statements
    app.get('/v3/:appKey', async (req, res) => {
      const start = performance.now();
      const { execApply, execWaterfall, config, logger } = gasket.traceRoot();
      /** @type {Record<string, string>} */
      let params = { ...req.params, ...req.query };
      const { format } = params;
      try {
        params = await execWaterfall('hcsParams', params);
        const pcsResponse = await withHcsSpan('gasket.hcs.fetchPCS', async () => {
          let response = await fetchPCS(gasket, params);

          // WARNING: 'dangerouslyModifyManifest' is just a temporary lifecycle to solve certain early HCS issues and will go
          // away at some point in the near future. Please do not use.

          response = await produce(response, async (pcsResponseDraft) => {
            await execApply('dangerouslyModifyManifest', async function modify(plugin, handler) {
              const name = plugin ? plugin.name || 'unnamed plugin' : 'app lifecycles';
              logger.warn(`DEPRECATED \`dangerouslyModifyManifest\` lifecycle hook in \`${name}\``);
              await handler(pcsResponseDraft);
            });
          });

          if (config.hcs.removeManifest) {
            response = produce(response, (pcsResponseDraft) => {
              delete pcsResponseDraft.css.manifest;
              delete pcsResponseDraft.js.manifest;
            });
          }

          return response;
        });

        const visitor = await gasket.actions.getVisitor(req);
        let intlMessages = {};
        if (gasket.config.intl) {
          const intlMgr = await gasket.actions.getIntlManager();
          intlMessages = intlMgr.handleLocale(visitor.locale).getAllMessages();
        }

        const baseProps = {
          ...pcsResponse.config.props,
          requestedHeader: params.manifest
        };

        baseProps.enableHivemindProvider =
          config.hcs?.hivemind?.labels?.length > 0 || false;

        if (baseProps.messages) {
          // HCS localized strings should override any strings from the PCS
          baseProps.messages = {
            ...baseProps.messages,
            ...intlMessages
          };
        } else {
          baseProps.messages = intlMessages;
        }

        // Combine HCS and PCS manifest React render props.
        const props = await withHcsSpan('gasket.hcs.getMergedProps', () =>
          getMergedProps(gasket, baseProps, req)
        );

        const ssr = getSSRInstance();

        let headerReactMarkup = '';
        let footerReactMarkup = '';

        await withHcsSpan('gasket.hcs.ssr', async (span) => {
          if (config.hcs?.skipSSR) {
            span.setAttribute('gasket.hcs.ssr.skipped', true);
            return;
          }
          headerReactMarkup =
            (await renderHeader(gasket, ssr, {
              props: deepMerge(props.shared, props.header)
            })) || '';
          footerReactMarkup =
            (await renderFooter(gasket, ssr, {
              props: deepMerge(props.shared, props.footer)
            })) || '';
        });
        const header = `<header id="hcs-header-container">${headerReactMarkup}</header>`;
        const footer = `<footer id="hcs-footer-container">${footerReactMarkup}</footer><div id="gtm_privacy"></div>`;

        const pcsManifest = {
          ...pcsResponse,
          config: {
            ...pcsResponse.config,
            props
          },
          components: {
            header,
            footer
          }
        };

        const rawManifest = await withHcsSpan('gasket.hcs.registerAssets', () =>
          registerAssets({
            gasket,
            pcsManifest,
            params,
            props,
            locale: visitor.locale
          })
        );
        const renderedManifest = renderManifest(rawManifest, format);

        return res.json(renderedManifest);
      } catch (err) {
        res.status(500);

        const responseJson = {
          message: err.message
        };

        if (['local', 'development', 'test'].includes(config.env)) {
          responseJson.stack = err.stack;
        }

        res.json(responseJson);
      } finally {
        logHcsRequest(logger, req, start);
      }
    });

    // Katana needs to get a healthy response for the root path
    app.get('/', async (req, res) => {
      res.status(200).json({ message: 'ok' });
    });

    // for local development, expose the build directory at /static with CORS headers
    if (gasket.config.env === 'local') {
      // Add CORS headers for static assets (needed for shell app cross-origin requests)
      app.use('/static', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
          return;
        }

        next();
      }, express.static(`${gasket.config.root}/build`));
    }
  }
};

/**
 * Registers assets with the assetManager and returns a complete raw manifest
 * with CSP directives merged
 * @type {import('./internal').registerAssets}
 */
// eslint-disable-next-line max-statements,complexity
export async function registerAssets({ gasket, pcsManifest, params, props, locale }) {
  const { exec } = gasket;
  const assetManager = createAssetManager({
    memoize: gasket.config.hcs?.memoizeCSPHashes
  });

  const hydrateScript = await generateHydrateScript(gasket, { props, params });
  const hydrateScriptProps = params.deferjs === 'true' ? { type: 'module' } : {};
  assetManager.addHydrateScript(hydrateScript, hydrateScriptProps);

  const { defaultHcsScripts = true, defaultWrhsPackageRequest = true } =
    gasket.config.hcs;
  const deferjs = params.deferjs === 'true';

  // Note that we pass in the params from the HCS call here so that consuming plugins can choose
  // whether to load packages based on params
  const wrhsPackageRequests = await exec('wrhsPackageRequests', { params, locale });
  const wrhsRequests = (wrhsPackageRequests && wrhsPackageRequests.flat()) || [];
  // append base package request to lifecycle results
  if (defaultWrhsPackageRequest && !(gasket.config.hcs.devMode || gasket.config.env === 'local')) {
    wrhsRequests.push(wrhsBasePackageRequest(gasket));
  }
  /** @type {import('./internal').WrhsAssetsResult} */
  let wrhsAssetsResult = {};
  if (wrhsRequests.length) {
    wrhsAssetsResult = await wrhsAssets(gasket, wrhsRequests);
  }

  // run these lifecycles serially to safely use assetManager
  await exec('hcsHints', assetManager.hintMethods, wrhsAssetsResult, props, params);
  if (defaultHcsScripts) {
    await registerDefaultHcsAssets(gasket, assetManager, wrhsAssetsResult, deferjs);
  }
  await exec('hcsScripts', assetManager.scriptMethods, wrhsAssetsResult, props, params);
  await exec('hcsCss', assetManager.cssMethods, wrhsAssetsResult, props, params);

  // Ensure chunks are added into an inline script
  assetManager.renderChunks();

  const pcsManifestWithCSP = assetManager.addCSPDirectives(pcsManifest);
  return assetManager.merge(pcsManifestWithCSP);
}

/**
 * Merge props returned by props lifecycle hooks into base props
 * @type {import('./internal').getMergedProps}
 * @private
 */
export async function getMergedProps(gasket, baseProps, req) {
  let validBaseProps = baseProps || {};
  const propsLayers = await withHcsSpan('gasket.hcs.hcsProps', () =>
    gasket.exec('hcsProps', deepFreeze(validBaseProps), req)
  );

  let sharedProps = validBaseProps;
  let headerProps = {};
  let footerProps = {};

  for (const layer of propsLayers) {
    const { header: layerHeader = {}, footer: layerFooter = {}, ...layerShared } = layer;
    sharedProps = deepMerge(sharedProps, layerShared);
    headerProps = deepMerge(headerProps, layerHeader);
    footerProps = deepMerge(footerProps, layerFooter);
  }
  return {
    shared: sharedProps,
    header: headerProps,
    footer: footerProps
  };
}
