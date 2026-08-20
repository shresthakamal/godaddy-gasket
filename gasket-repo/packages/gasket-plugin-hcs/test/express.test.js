/* eslint max-statements: 0, no-undefined: 0 */
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up mocks before imports
vi.mock('../lib/pcs', () => ({
  default: vi.fn()
}));

vi.mock('../lib/generate-hydrate-script', () => ({
  default: vi.fn(() => [''])
}));

vi.mock('../lib/render-footer', () => ({
  default: vi.fn(() => ['footer'])
}));

vi.mock('../lib/render-header', () => ({
  default: vi.fn(() => ['header'])
}));

import getSSRInstance from '../lib/ssr.js';
import props from './__test__/props.js';
import fetchPCS from '../lib/pcs.js';
import expressHook from '../lib/express.js';

beforeAll(() => {
  try {
    // remove the wrhs fs cache for tests
    // eslint-disable-next-line no-sync
    fs.rmdirSync(path.join(os.tmpdir(), '.test-wrhs-cache'), { recursive: true });
  } catch {
    // ignore
  }
});

afterAll(async () => {
  return getSSRInstance().destroy();
});

describe('express hook', function () {
  let routeHandler, res;
  let mockFetchPCSReturnValue;
  const execfn = vi.fn();
  const execWaterfallfn = vi.fn();
  const execApplyfn = vi.fn();
  const wrhsClient = {};

  const intlMgrMock = {
    handleLocale: vi.fn().mockReturnThis(),
    getAllMessages: vi.fn(() => ({ 'en-US': 'some message' }))
  };

  const gasket = {
    actions: {
      getIntlManager: vi.fn(() => intlMgrMock),
      getVisitor: vi.fn()
    },
    exec: execfn,
    execWaterfall: execWaterfallfn,
    execApply: execApplyfn,
    config: {
      root: path.join(__dirname, '..', 'generator'),
      hcs: {
        defaultHcsScripts: false,
        defaultWrhsPackageRequest: false,
        hivemind: {
          labels: ['uxp-headers']
        }
      },
      wrhs: {
        fsCachePath: path.join(os.tmpdir(), '.test-wrhs-cache')
      },
      intl: {
        locales: ['en-US', 'fr-FR']
      }
    },
    wrhs: wrhsClient,
    logger: {
      warn: vi.fn(),
      info: vi.fn(),
      error: vi.fn()
    },
    traceRoot: vi.fn(() => gasket)
  };

  const req = {
    method: 'GET',
    originalUrl: '/v3/my-app',
    path: '/v3/my-app',
    params: { appKey: 'my-app' },
    query: { query: 2, market: 'en-US' }
  };

  beforeEach(function () {
    gasket.exec.mockReset();
    gasket.execWaterfall.mockReset();
    gasket.logger.warn.mockClear();
    gasket.logger.error.mockClear();
    gasket.logger.info.mockClear();
    intlMgrMock.handleLocale.mockClear();
    intlMgrMock.getAllMessages.mockClear();

    // Set up the mock return value first
    mockFetchPCSReturnValue = {
      some: 'pcs',
      response: 'here',
      config: { props }
    };

    // Reset fetchPCS mock with default implementation
    fetchPCS.mockReset();
    fetchPCS.mockImplementation(() => Promise.resolve(mockFetchPCSReturnValue));

    req.withLocaleRequired = vi.fn().mockReturnValue({ messages: {} });

    res = {
      json: vi.fn(),
      status: vi.fn()
    };

    const app = {
      get: vi.fn()
    };

    wrhsClient.get = vi.fn();

    expressHook.handler(gasket, app);
    routeHandler = app.get.mock.calls.find(call => call[0] === '/v3/:appKey')[1];
    execfn.mockImplementation((event) => {
      if (event === 'hcsProps') return [];
      return undefined;
    });
    execWaterfallfn.mockImplementation((lifecycle, value) => value);
  });

  afterEach(function () {
    execApplyfn.mockRestore();
  });

  it('fetchPCS is called and returns data', async () => {
    const visitor = { locale: 'en-US' };
    gasket.actions.getVisitor.mockResolvedValue(visitor);
    await routeHandler(req, res);
    expect(fetchPCS).toHaveBeenCalled();
    expect(res.json).toHaveBeenLastCalledWith({
      some: 'pcs',
      response: 'here',
      config: {
        props: {
          header: {},
          footer: {},
          shared: expect.objectContaining({
            enableHivemindProvider: true,
            market: 'en-US',
            messages: { 'en-US': 'some message' },
            requestedHeader: undefined,
            skipToMainContentLink: { caption: 'here is a caption' },
            supportMatrix: {
              Chrome: ['79.0'],
              Edge: ['79.0', '78.0'],
              Firefox: ['67.0'],
              Safari: ['11.0']
            },
            urls: {
              gui: 'http://example.com',
              sso: {
                exitDelegation: 'http://example.com',
                restoreCookie: 'http://example.com'
              }
            }
          })
        }
      },
      components: {
        footer:
          '<footer id="hcs-footer-container">footer</footer><div id="gtm_privacy"></div>',
        header: '<header id="hcs-header-container">header</header>'
      },
      csp: {
        'default-src': ['self'],
        'font-src': ['self'],
        'image-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self']
      },
      hydrate: '<script></script>'
    });
  });

  it('intlMgr.handleLocale is called with visitor locale', async () => {
    const visitor = { locale: 'en-US' };
    gasket.actions.getVisitor.mockResolvedValue(visitor);
    await routeHandler(req, res);
    expect(gasket.actions.getIntlManager).toHaveBeenCalled();
    expect(intlMgrMock.handleLocale).toHaveBeenCalledWith('en-US');
    expect(intlMgrMock.getAllMessages).toHaveBeenCalled();
  });

  it('handles missing visitor gracefully', async () => {
    gasket.actions.getVisitor.mockResolvedValue(undefined);

    await routeHandler(req, res);

    expect(gasket.actions.getIntlManager).toHaveBeenCalled();
    expect(intlMgrMock.handleLocale).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('renders correctly with merged locale messages', async () => {
    const visitor = { locale: 'en-US' };
    gasket.actions.getVisitor.mockResolvedValue(visitor);

    await routeHandler(req, res);

    const mergedMessages =
      res.json.mock.calls[0][0].config.props.shared.messages;
    expect(mergedMessages).toEqual({ 'en-US': 'some message' });
  });

  it('returns 500 status and error message when PCS fails', async () => {
    fetchPCS.mockImplementationOnce(async () => {
      throw new Error('Bad thing happened');
    });
    await routeHandler(req, res);
    expect(res.status).toHaveBeenLastCalledWith(500);
    expect(res.json).toHaveBeenLastCalledWith({
      message: 'Bad thing happened'
    });
  });

  it('still returns a response when WRHS returns 404 for a package variant', async () => {
    const visitor = { locale: 'en-US' };
    gasket.actions.getVisitor.mockResolvedValue(visitor);
    wrhsClient.get.mockRejectedValueOnce(new Error('404 Not Found'));
    execfn.mockImplementation((event) => {
      if (event === 'hcsProps') return [];
      if (event === 'wrhsPackageRequests') return [[{ name: '@org/test-pkg', version: '1.0.0', acceptedVariants: ['branch-abc', '_default'] }]];
      return undefined;
    });

    await routeHandler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();
    expect(gasket.logger.warn).toHaveBeenCalledWith(expect.stringContaining('404 Not Found'));
  });

  it('returns a normal response when WRHS returns valid assets', async () => {
    const visitor = { locale: 'en-US' };
    gasket.actions.getVisitor.mockResolvedValue(visitor);
    wrhsClient.get.mockResolvedValueOnce({
      name: '@org/test-pkg',
      data: { files: [{ url: 'https://img6.wsimg.com/test.js', metadata: {} }] }
    });
    execfn.mockImplementation((event) => {
      if (event === 'hcsProps') return [];
      if (event === 'wrhsPackageRequests') return [[{ name: '@org/test-pkg', version: '1.0.0', acceptedVariants: ['_default'] }]];
      return undefined;
    });

    await routeHandler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();
    expect(gasket.logger.warn).not.toHaveBeenCalledWith(expect.stringContaining('wrhs:'));
    expect(gasket.logger.error).not.toHaveBeenCalled();
  });

  describe('hcsProps hook', () => {
    it('merges lifecycle props into shared, header, and footer props', async () => {
      const pcsProps = { override1: 'pcs', override2: 'pcs', messages: {} };
      mockFetchPCSReturnValue.config.props = pcsProps;
      execfn.mockImplementation((event) => {
        if (event === 'hcsProps') return Promise.resolve([
          {
            header: { headerProp: 'headerPropValue', override1: 'header' },
            footer: { footerProp: 'footerPropValue', override1: 'footer' },
            sharedProp: 'sharedPropValue'
          }
        ]);
        return undefined;
      });
      await routeHandler(req, res);
      expect(res.json).toHaveBeenLastCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            props: expect.objectContaining({
              shared: expect.objectContaining({
                sharedProp: 'sharedPropValue'
              }),
              header: expect.objectContaining({
                headerProp: 'headerPropValue'
              }),
              footer: expect.objectContaining({ footerProp: 'footerPropValue' })
            })
          })
        })
      );
    });
  });

  describe('dangerouslyModifyManifest', () => {
    it('modifies the PCS response asynchronously', async () => {
      const mockHandler = vi.fn().mockImplementation(async (pcsResponse) => {
        pcsResponse.xyz = await Promise.resolve('my-value');
      });
      execApplyfn.mockImplementation(async (name, modifyFn) => {
        if (name === 'dangerouslyModifyManifest') {
          await modifyFn({ name: 'mock-plugin' }, mockHandler);
        }
      });
      await routeHandler(req, res);
      expect(res.json).toHaveBeenLastCalledWith(
        expect.objectContaining({ xyz: 'my-value' })
      );
    });
  });

  it('removes manifest if removeManifest config is set', async () => {
    gasket.config.hcs.removeManifest = true;
    await routeHandler(req, res);
    expect(res.json).toHaveBeenLastCalledWith(
      expect.not.objectContaining({
        manifest: expect.anything()
      })
    );
  });

  describe('registerAssets', () => {
    it('passes params to lifecycle hooks', async () => {
      const params = { testParam: 'testValue' };
      const props = { testProp: 'testValue' };
      const pcsManifest = { test: 'manifest' };

      await expressHook.registerAssets({
        gasket,
        pcsManifest,
        params,
        props
      });

      expect(execfn).toHaveBeenCalledWith(
        'hcsHints',
        expect.any(Object),
        expect.any(Object),
        props,
        params
      );
    });
  });
});
