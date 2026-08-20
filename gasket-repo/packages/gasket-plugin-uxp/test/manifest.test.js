import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fetch from '@gasket/fetch';

vi.mock('@gasket/fetch', () => ({
  default: vi.fn().mockResolvedValue({
    json: async () => ({ icons: [1, 2, 3, 4] })
  })
}));

import hook from '../lib/manifest.js';

describe('manifest', function () {
  let gasket, req, res, manifest, mockPC, mockVisitor;

  function setup({
    icons = ['Beyoncé', 'Stan Lee', 'Ignaz Semmelweis'],
    privateLabel = 1,
    hostname = 'dev-godaddy.com'
  }) {
    mockPC = {
      data: {
        pwamanifest: {
          start_url: '/?source=pwa',
          theme_color: '#FF0000'
        }
      }
    };
    mockVisitor = { plid: privateLabel, hostname };


    if (icons) {
      mockPC.data.pwamanifest.icons = icons;
    }

    manifest = {};
    gasket = {
      actions: {
        getPresentationCentral: vi.fn().mockResolvedValue(mockPC),
        getVisitor: vi.fn().mockResolvedValue(mockVisitor)
      },
      config: {
        presentationCentral: { app: 'lication' }
      },
      logger: {
        debug: vi.fn()
      }
    };
    req = {};
  }

  beforeEach(() => setup({}));

  afterEach(function () {
    vi.clearAllMocks();
  });

  it('should be a function', function () {
    expect(typeof hook).toBe('function');
    expect(hook).toHaveLength(3);
  });

  it('returns manifest when no req provided', async function () {
    const result = await hook(gasket, manifest, {});
    expect(result).toEqual(manifest);
  });

  it('sets the UXP app as the name', async function () {
    const { name } = await hook(gasket, manifest, { req, res });
    expect(name).toEqual(gasket.config.presentationCentral.app);
  });

  it('ferries the entire pwa manifest response from pc', async function () {
    const result = await hook(gasket, manifest, { req, res });
    expect(result.start_url).toBeDefined();
    expect(result.theme_color).toBeDefined();
  });

  it('uses icons from the remote manifest', async function () {
    const mockedFetch = vi.mocked(fetch);
    setup({ icons: false });
    const { icons } = await hook(gasket, manifest, { req, res });
    expect(icons).toHaveLength(4);
    expect(mockedFetch).toHaveBeenCalled();
  });

  it('uses icons from pwamanifest if they are present', async function () {
    const mockedFetch = vi.mocked(fetch);
    const { icons } = await hook(gasket, manifest, { req, res });
    expect(icons).toHaveLength(3);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('does not use the icons from the remote manifest if plid != 1', async function () {
    setup({ icons: false, privateLabel: 2 });
    const mockedFetch = vi.mocked(fetch);
    const { icons } = await hook(gasket, manifest, { req, res });
    expect(icons).toBeUndefined();
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  describe('start_url', () => {

    it('fixes up plid query param for secureserver.net', async () => {
      setup({ icons: [], privateLabel: 2, hostname: 'dev-secureserver.net' });
      const results = await hook(gasket, manifest, { req, res });
      expect(results).toHaveProperty('start_url', '/?plid=2&source=pwa');
    });

    it('ignores if not secureserver.net', async () => {
      setup({ icons: [], privateLabel: 2 });
      const results = await hook(gasket, manifest, { req, res });
      expect(results).toHaveProperty('start_url', '/?source=pwa');
    });

    it('ignores if no start_url', async () => {
      setup({ icons: [], privateLabel: 2, hostname: 'dev-secureserver.net' });
      delete mockPC.data.pwamanifest.start_url;
      const results = await hook(gasket, manifest, { req, res });
      expect(results).not.toHaveProperty('start_url');
    });

    it('ignores if plid already set for start_url', async () => {
      setup({ icons: [], privateLabel: 2, hostname: 'dev-secureserver.net' });
      mockPC.data.pwamanifest.start_url = '/home?plid=123';
      const results = await hook(gasket, manifest, { req, res });
      expect(results).toHaveProperty('start_url', '/home?plid=123');
    });
  });
});
