import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockClientResults = vi.fn().mockResolvedValue({ assets: {} });

vi.mock('@ux/presentation-central', () => ({
  default: function () {
    return {
      request: mockClientResults
    };
  }
}));

vi.mock('mkdirp', () => ({
  default: {
    sync: vi.fn()
  }
}));

import {
  getContent,
  setupClient,
  setupClientSettings,
  setupRequestParams,
  setupRequestOptions
} from '../lib/presentation.js';

describe('Presentation', () => {
  let mockGasket, mockVisitor, req;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      version: '3.0',
      params: {}
    };

    mockVisitor = {};

    req = {
      headers: {
        'user-agent': 'FakeAgent'
      }
    };

    mockGasket = {
      actions: {
        getVisitor: vi.fn().mockResolvedValue(mockVisitor)
      },
      config: {},
      logger: {
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn()
      },
      metadata: {
        app: {
          name: 'test-app'
        }
      },
      exec: vi.fn().mockImplementation((nameArg, reqArg, dataArg) => Promise.resolve(dataArg))
    };
  });

  describe('setupClient', () => {
    it('reuses same instance', async () => {
      expect(setupClient(mockGasket)).toBe(setupClient(mockGasket));
    });
  });

  describe('setupClientSettings', function () {
    it('memoryCacheMax defaults to 1000', function () {
      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('memoryCacheMax', 1000);
    });

    it('memoryCacheMax can be overridden', function () {
      mockGasket.config.presentationCentral ??= {};
      mockGasket.config.presentationCentral.memoryCacheMax = 500;

      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('memoryCacheMax', 500);
    });

    it('fsCachePath defaults to 1000', function () {
      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('fsCachePath', expect.stringContaining('presentation-central-cache'));
    });

    it('fsCachePath can be overridden', function () {
      mockGasket.config.presentationCentral ??= {};
      mockGasket.config.presentationCentral.memoryCacheMax = 500;
      mockGasket.config.presentationCentral.fsCachePath = '/custom/path/to/cache';

      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('fsCachePath', '/custom/path/to/cache');
      expect(settings).toHaveProperty('memoryCacheMax', 500);
    });

    it('warns if using params.deferjs without version 3.0', function () {
      mockGasket.config.presentationCentral = {
        version: '2.0',
        params: { deferjs: true }
      };
      setupClientSettings(mockGasket);

      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('deferjs is only supported in version 3.0 of Presentation Central')
      );
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Update your Gasket config with `presentationCentral.version')
      );
    });

    it('warns if using `header` on version 3.0', function () {
      mockGasket.config.presentationCentral = {
        version: '3.0',
        params: { header: 'brand-header' }
      };
      const settings = setupClientSettings(mockGasket);

      // check if normalized to manifest
      expect(settings.params).toHaveProperty('manifest', 'brand-header');

      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Use `manifest` instead of `header` with version 3.0 of Presentation Central config')
      );
    });

    it('defaults params to deferjs: true', function () {
      mockGasket.config.presentationCentral ??= {};

      const settings = setupClientSettings(mockGasket);
      expect(settings.params).toHaveProperty('deferjs', true);
    });

    it('defaults params to uxcore: false', function () {
      mockGasket.config.presentationCentral ??= {};

      const settings = setupClientSettings(mockGasket);
      expect(settings.params).toHaveProperty('uxcore', false);
    });

    it('defaults to version: 3.0', function () {
      mockGasket.config.presentationCentral ??= {};

      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('version', '3.0');
    });

    it('falls back client version to 2.0 for certain headers', function () {
      mockGasket.config.presentationCentral ??= {};
      mockGasket.config.presentationCentral.params = { header: 'sales-header' };

      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('version', '2.0');
    });

    it('does not fall back client version if explicitly sets', function () {
      mockGasket.config.presentationCentral ??= {};
      mockGasket.config.presentationCentral.version = '3.0';
      mockGasket.config.presentationCentral.params = { header: 'sales-header' };

      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('version', '3.0');
    });

    it('normalizes env from gasket config', function () {
      mockGasket.config.presentationCentral ??= {};
      mockGasket.config.presentationCentral.env = 'developini';
      const settings = setupClientSettings(mockGasket);
      expect(settings).toHaveProperty('env', 'dev');
      mockGasket.config.presentationCentral.env = 'testeroo';
      const settings2 = setupClientSettings(mockGasket);
      expect(settings2).toHaveProperty('env', 'test');
      mockGasket.config.presentationCentral.env = 'producteroni';
      const settings3 = setupClientSettings(mockGasket);
      expect(settings3).toHaveProperty('env', 'prod');
    });
  });

  describe('setupRequestParams', () => {
    beforeEach(function () {
      req = {
        headers: {},
        hostname: 'local.gasket.dev-godaddy.com'
      };
    });
    //
    it('executes the `presentationCentral` lifecycle event', async function () {
      await setupRequestParams(mockGasket, mockClient, req);

      const expectedData = { market: 'en-US', currency: 'USD', privateLabelId: 1 };

      expect(mockGasket.exec).toHaveBeenCalledWith(
        'presentationCentral',
        expectedData,
        expect.objectContaining({ req: req })
      );
    });

    it('set the privateLabel param (v2 client)', async function () {
      mockClient.version = '2.0';
      const params = await setupRequestParams(mockGasket, mockClient, req);

      expect(params).toHaveProperty('privateLabel', 1);
      expect(params).not.toHaveProperty('privateLabelId');
      expect(params).toHaveProperty('currency', 'USD');
    });

    it('set the privateLabelId param for (v3 client)', async function () {
      const params = await setupRequestParams(mockGasket, mockClient, req);

      expect(params).toHaveProperty('privateLabelId', 1);
      expect(params).not.toHaveProperty('privateLabel');
      expect(params).toHaveProperty('currency', 'USD');
    });

    it('defaults currency to USD when not provided in visitor', async function () {
      const params = await setupRequestParams(mockGasket, mockClient, req);

      expect(params).toHaveProperty('currency', 'USD');
    });

    it('uses currency from visitor when provided', async function () {
      mockVisitor.currency = 'EUR';
      const params = await setupRequestParams(mockGasket, mockClient, req);

      expect(params).toHaveProperty('currency', 'EUR');
    });

    it('uses custom currency values like GBP, CAD, etc.', async function () {
      mockVisitor.currency = 'GBP';
      const params = await setupRequestParams(mockGasket, mockClient, req);

      expect(params).toHaveProperty('currency', 'GBP');
    });

    it('set application-header to internal-header for gdcorp.tools', async () => {
      mockVisitor.hostname = 'local.gasket.dev-gdcorp.tools';
      mockClient.params.header = 'application-header';
      const params = await setupRequestParams(mockGasket, mockClient, req);

      expect(params).toHaveProperty('manifest', 'internal-header');
    });

    it('logs warning for application-header with gdcorp.tools', async () => {
      mockVisitor.hostname = 'local.gasket.dev-gdcorp.tools';
      mockClient.params.header = 'application-header';
      await setupRequestParams(mockGasket, mockClient, req);

      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('should not be used with gdcorp.tools.')
      );
      expect(mockGasket.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Update your Gasket config')
      );
    });

    describe('partners-header logic', () => {

      it('all version 2 conditions satisfied', async () => {
        mockClient.version = '2.0';
        mockGasket.config.presentationCentral = {
          enablePartnersHeaderOverride: true
        };

        req.cookies = {
          info_idp: JSON.stringify({ pcx: true, auth: 'basic' })
        };

        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).toHaveProperty('header', 'partners-header');
        expect(params).toHaveProperty('theme', 'godaddy-pxpro');
      });

      it('all version 3 conditions satisfied', async () => {
        mockGasket.config.presentationCentral = {
          enablePartnersHeaderOverride: true
        };

        req.cookies = {
          info_idp: JSON.stringify({ pcx: true, auth: 'basic' })
        };

        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).toHaveProperty('manifest', 'partners-header');
        expect(params).toHaveProperty('theme', 'godaddy-pxpro');
      });

      it('all conditions satisfied, e2s cookie', async () => {
        mockGasket.config.presentationCentral = {
          enablePartnersHeaderOverride: true
        };

        req.cookies = {
          info_idp: JSON.stringify({ auth: 'e2s', e2s: { pcx: true } })
        };

        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).toHaveProperty('manifest', 'partners-header');
        expect(params).toHaveProperty('theme', 'godaddy-pxpro');
      });

      it('not opted in', async () => {
        mockGasket.config.presentationCentral = {
          enablePartnersHeaderOverride: false
        };

        req.cookies = {
          info_idp: JSON.stringify({ pcx: true, auth: 'basic' })
        };

        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).not.toHaveProperty('header', 'partners-header');
      });

      it('malformed cookie', async () => {
        mockGasket.config.presentationCentral = {
          enablePartnersHeaderOverride: true
        };

        req.cookies = {
          info_idp: 'malformed JSON'
        };

        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).not.toHaveProperty('manifest');
        // just to be thorough
        expect(params).not.toHaveProperty('header');
      });


      it('changes theme to godaddy-pxpro-dark for matching segopts', async () => {
        mockGasket.config.presentationCentral = {
          enablePartnersHeaderOverride: true
        };

        req.cookies = {
          info_idp: JSON.stringify({ pcx: true, auth: 'basic', segopts: 17 })
        };

        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).toHaveProperty('manifest', 'partners-header');
        expect(params).toHaveProperty('theme', 'godaddy-pxpro-dark');
      });

      it('does not change theme to godaddy-pxpro-dark for nonmatching segopts', async () => {
        mockGasket.config.presentationCentral = {
          enablePartnersHeaderOverride: true
        };

        req.cookies = {
          info_idp: JSON.stringify({ pcx: true, auth: 'basic', segopts: 2 })
        };

        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).toHaveProperty('manifest', 'partners-header');
        expect(params).toHaveProperty('theme', 'godaddy-pxpro');
      });

    });

    describe('experiment cohort injection', () => {
      beforeEach(() => {
        mockGasket.config.uxp = { features: { 'header-experiment-beta': true } };
        mockGasket.actions.getExperimentCohorts = vi.fn().mockResolvedValue({
          'experiment-1': 'cohort-a',
          'experiment-2': 'cohort-b'
        });
      });

      it('does nothing when feature flag is off', async () => {
        mockGasket.config.uxp.features['header-experiment-beta'] = false;
        await setupRequestParams(mockGasket, mockClient, req);
        expect(mockGasket.actions.getExperimentCohorts).not.toHaveBeenCalled();
      });

      it('does nothing when feature flag is absent', async () => {
        mockGasket.config.uxp = {};
        await setupRequestParams(mockGasket, mockClient, req);
        expect(mockGasket.actions.getExperimentCohorts).not.toHaveBeenCalled();
      });

      it('does nothing when uxp config is absent', async () => {
        delete mockGasket.config.uxp;
        await setupRequestParams(mockGasket, mockClient, req);
        expect(mockGasket.actions.getExperimentCohorts).not.toHaveBeenCalled();
      });

      it('logs a warning when gasket-plugin-switchboard is not installed', async () => {
        delete mockGasket.actions.getExperimentCohorts;
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params).not.toHaveProperty('split');
        expect(mockGasket.logger.warn).toHaveBeenCalledWith(
          expect.stringContaining('gasket-plugin-switchboard is not available')
        );
      });

      it('calls getExperimentCohorts with req when feature flag is on', async () => {
        await setupRequestParams(mockGasket, mockClient, req);
        expect(mockGasket.actions.getExperimentCohorts).toHaveBeenCalledWith(req);
      });

      it('appends experiments to params.split in sorted key order', async () => {
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params.split).toBe('experiments:experiment-1=cohort-a;experiment-2=cohort-b');
      });

      it('appends to existing params.split', async () => {
        // partners-header logic sets params.split = 'sidebar' before experiment injection
        mockGasket.config.presentationCentral = { enablePartnersHeaderOverride: true };
        req.cookies = { info_idp: JSON.stringify({ pcx: true, auth: 'basic' }) };
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params.split).toBe('sidebar,experiments:experiment-1=cohort-a;experiment-2=cohort-b');
      });

      it('appends experiments to comma-separated consumer split', async () => {
        mockClient.params.split = 'sidebar,nearstar';
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params.split).toBe('sidebar,nearstar,experiments:experiment-1=cohort-a;experiment-2=cohort-b');
      });

      it('appends experiments to space-separated consumer split', async () => {
        mockClient.params.split = 'sidebar nearstar';
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params.split).toBe('sidebar nearstar,experiments:experiment-1=cohort-a;experiment-2=cohort-b');
      });

      it('does not set params.split when getExperimentCohorts returns null', async () => {
        mockGasket.actions.getExperimentCohorts.mockResolvedValue(null);
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params).not.toHaveProperty('split');
      });

      it('filters out ineligible cohorts from params.split', async () => {
        mockGasket.actions.getExperimentCohorts.mockResolvedValue({
          'experiment-1': 'cohort-a',
          'experiment-2': 'ineligible'
        });
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params.split).toBe('experiments:experiment-1=cohort-a');
      });

      it('does not set params.split when all cohorts are ineligible', async () => {
        mockGasket.actions.getExperimentCohorts.mockResolvedValue({
          'experiment-1': 'ineligible',
          'experiment-2': 'ineligible'
        });
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params).not.toHaveProperty('split');
      });

      it('does not set params.split when getExperimentCohorts returns empty object', async () => {
        mockGasket.actions.getExperimentCohorts.mockResolvedValue({});
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params).not.toHaveProperty('split');
      });

      it('logs a warning and does not throw when getExperimentCohorts fails', async () => {
        mockGasket.actions.getExperimentCohorts.mockRejectedValue(new Error('switchboard unavailable'));
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(mockGasket.logger.warn).toHaveBeenCalledWith(
          expect.stringContaining('failed to fetch experiment cohorts'),
          expect.any(Error)
        );
        expect(params).not.toHaveProperty('split');
      });

      it('preserves existing params when injecting cohorts', async () => {
        const params = await setupRequestParams(mockGasket, mockClient, req);
        expect(params.market).toBe('en-US');
        expect(params.privateLabelId).toBe(1);
      });
    });

    describe('pwamanifest', () => {
      it('fixes up plid query param for secureserver.net', async () => {
        mockClient.params.pwamanifest = '/manifest.json';
        mockVisitor.hostname = 'local.gasket.dev-secureserver.net';
        mockVisitor.plid = 321;
        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).toHaveProperty('pwamanifest', '/manifest.json?plid=321');
      });

      it('ignores if not secureserver.net', async () => {
        mockClient.params.pwamanifest = '/manifest.json';
        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).not.toHaveProperty('pwamanifest');
      });

      it('ignores if not set', async () => {
        mockVisitor.hostname = 'local.gasket.dev-secureserver.net';
        const params = await setupRequestParams(mockGasket, mockClient, req);

        expect(params).not.toHaveProperty('pwamanifest');
      });
    });
  });

  describe('setupRequestOptions', () => {
    it('should do things', async () => {
      const results = await getContent(mockGasket, req);
      expect(results).toEqual(expect.objectContaining({
        data: { assets: {} }
      }));
    });

    it('merges the supplied options with the params', async () => {
      const results = setupRequestOptions(mockGasket, req, { hello: 'world' });
      expect(results).toEqual({ requestUserAgent: 'FakeAgent', params: { hello: 'world' } });
    });

    it('merges cache param to base options if set', async () => {
      const results = setupRequestOptions(mockGasket, req, { hello: 'world', cache: false });
      expect(results).toEqual({ requestUserAgent: 'FakeAgent', cache: false, params: { hello: 'world', cache: false } });
    });

    it('fetches a stunt double url from gasket config when params.stuntDouble=true', async () => {
      mockGasket.config.presentationCentral = {
        pcStuntDoubleUrl: 'https://stunt-double.com'
      };
      const results = setupRequestOptions(mockGasket, req, { hello: 'world', stuntDouble: true });
      expect(results).toEqual({
        requestUserAgent: 'FakeAgent',
        stuntDouble: {
          url: 'https://stunt-double.com'
        },
        params: {
          hello: 'world',
          stuntDouble: true
        }
      });
    });

    it('extracts url from params and sets it as a top-level client option', () => {
      const results = setupRequestOptions(mockGasket, req, { market: 'en-US', url: 'http://localhost:9211/v3' });
      expect(results.url).toBe('http://localhost:9211/v3');
      expect(results.params).not.toHaveProperty('url');
    });

    it('extracts env from params, normalizes it, and sets it as a top-level client option', () => {
      const results = setupRequestOptions(mockGasket, req, { market: 'en-US', env: 'development' });
      expect(results.env).toBe('dev');
      expect(results.params).not.toHaveProperty('env');
    });

    it('normalizes env variations correctly', () => {
      expect(setupRequestOptions(mockGasket, req, { env: 'local' }).env).toBe('dev');
      expect(setupRequestOptions(mockGasket, req, { env: 'testing' }).env).toBe('test');
      expect(setupRequestOptions(mockGasket, req, { env: 'production' }).env).toBe('prod');
    });

    it('omits url and env from top-level options when not present in params', () => {
      const results = setupRequestOptions(mockGasket, req, { market: 'en-US' });
      expect(results).not.toHaveProperty('url');
      expect(results).not.toHaveProperty('env');
    });
  });

  describe('getContent', () => {
    let requestSpy;

    beforeEach(() => {
      const client = setupClient(mockGasket);
      requestSpy = vi.spyOn(client, 'request').mockImplementation(() => ({}));
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('makes client request with expected options', async () => {
      await getContent(mockGasket, req);

      expect(requestSpy).toHaveBeenCalledWith({
        requestUserAgent: 'FakeAgent',
        params: {
          market: 'en-US',
          currency: 'USD',
          privateLabel: 1
        }
      });
    });

    it('returns expected content', async () => {
      requestSpy.mockResolvedValueOnce({ assets: {}, meta: { more: 'data' } });

      const content = await getContent(mockGasket, req);

      expect(content).toEqual({
        data: { assets: {} },
        meta: { more: 'data' }
      });
    });

    it('passes url set by presentationCentral hook as a top-level client option', async () => {
      mockGasket.exec.mockImplementationOnce((event, params) => {
        if (event === 'presentationCentral') params.url = 'http://localhost:9211/v3';
        return Promise.resolve();
      });

      await getContent(mockGasket, req);

      expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({ url: 'http://localhost:9211/v3' }));
      expect(requestSpy.mock.calls[0][0].params).not.toHaveProperty('url');
    });

    it('passes env set by presentationCentral hook as a top-level client option', async () => {
      mockGasket.exec.mockImplementationOnce((event, params) => {
        if (event === 'presentationCentral') params.env = 'test';
        return Promise.resolve();
      });

      await getContent(mockGasket, req);

      expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({ env: 'test' }));
      expect(requestSpy.mock.calls[0][0].params).not.toHaveProperty('env');
    });
  });
});
