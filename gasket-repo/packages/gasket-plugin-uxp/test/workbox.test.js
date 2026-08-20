/* eslint-disable max-nested-callbacks, max-len */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { workbox, parseCdnAssets } from '../lib/workbox.js';

describe('workbox', () => {
  let result, mockGasket, mockConfig, mockContext, mockPC;

  beforeEach(() => {
    mockPC = {
      data: {
        assets: 'some assets'
      }
    };
    mockGasket = {
      actions: {
        getPresentationCentral: vi.fn().mockResolvedValue(mockPC)
      },
      config: {
        root: '/some-root'
      }
    };
    mockConfig = {};
    mockContext = {
      req: {}
    };
  });

  it('returns workbox config partial', async () => {
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result).toBeInstanceOf(Object);
  });

  it('config partial contains expected properties', async () => {
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result).toHaveProperty('manifestTransforms');
    expect(result).toHaveProperty('runtimeCaching');
  });

  it('does not contain manifestTransforms for static sw', async () => {
    result = await workbox(mockGasket, mockConfig, {});

    expect(result).not.toHaveProperty('manifestTransforms');
    expect(result).toHaveProperty('runtimeCaching');
  });

  describe('runtimeCaching', () => {

    it('adds 2 runtimeCache entries', () => {
      expect(result.runtimeCaching).toHaveLength(2);
    });

    describe('uxp-runtime', () => {
      let runtimeCaching, urlPattern;

      beforeAll(async () => {
        const wb = await workbox(mockGasket, mockConfig, mockContext);
        runtimeCaching = wb.runtimeCaching[0];
        urlPattern = runtimeCaching.urlPattern;
      });

      it('sets expected cacheName option', () => {
        expect(runtimeCaching.options).toHaveProperty('cacheName', 'uxp-runtime');
      });

      it('sets expected strategy', () => {
        expect(runtimeCaching).toHaveProperty('handler', 'StaleWhileRevalidate');
      });

      it('matches ux and favicon URLs', () => {
        [
          'https://img1.wsimg.com/ux/some-asset.jpg',
          'https://img1.wsimg.com/ux/favicon/favicon-32x32.png',
          'https://img1.wsimg.com/ux/favicon/manifest.json'
        ].forEach(url => {
          expect(urlPattern.test(url)).toBeTruthy();
        });
      });

      it('matches polyfill URLs', () => {
        [
          'https://img1.wsimg.com/poly/v2/polyfill.js?features=Promise,Promise.prototype.finally,Intl.~locale.fr-FR&rum=0&unknown=polyfill&flags=gated'
        ].forEach(url => {
          expect(urlPattern.test(url)).toBeTruthy();
        });
      });

      it('does not match non-favicon URLs', () => {
        [
          'https://img1.wsimg.com/some/asset.png',
          'https://godaddy.com/ux/asset.js'
        ].forEach(url => {
          expect(urlPattern.test(url)).toBeFalsy();
        });
      });

      it('matches dev and test CDN URLs', () => {
        [
          'https://img1.dev-wsimg.com/ux/favicon/favicon-32x32.png',
          'https://img1.dev-wsimg.com/ux/favicon/manifest.json',
          'https://img1.test-wsimg.com/ux/favicon/favicon-32x32.png',
          'https://img1.test-wsimg.com/ux/favicon/manifest.json'
        ].forEach(url => {
          expect(urlPattern.test(url)).toBeTruthy();
        });
      });
    });

    describe('wrhs-runtime', () => {
      let runtimeCaching, urlPattern;

      beforeAll(async () => {
        const wb = await workbox(mockGasket, mockConfig, mockContext);
        runtimeCaching = wb.runtimeCaching[1];
        urlPattern = runtimeCaching.urlPattern;
      });

      it('sets expected cacheName option', () => {
        expect(runtimeCaching.options).toHaveProperty('cacheName', 'wrhs-runtime');
      });

      it('sets expected strategy', () => {
        expect(runtimeCaching).toHaveProperty('handler', 'CacheFirst');
      });

      it('matches CDN URLs', () => {
        [
          'https://img1.wsimg.com/wrhs-assets/asset.css',
          'https://img1.wsimg.com/wrhs-assets/asset.js'
        ].forEach(url => {
          expect(urlPattern.test(url)).toBeTruthy();
        });
      });

      it('does not match non-CDN URLs', () => {
        [
          'https://fake.img1.wsimg.com/some/asset.png',
          'https://godaddy.com/wrhs-assets/asset.js'
        ].forEach(url => {
          expect(urlPattern.test(url)).toBeFalsy();
        });
      });

      it('matches dev and test CDN URLs', () => {
        [
          'https://img1.dev-wsimg.com/wrhs-assets/asset.css',
          'https://img1.dev-wsimg.com/wrhs-assets/asset.js',
          'https://img1.test-wsimg.com/wrhs-assets/asset.css',
          'https://img1.test-wsimg.com/wrhs-assets/asset.js'
        ].forEach(url => {
          expect(urlPattern.test(url)).toBeTruthy();
        });
      });
    });
  });

  describe('parseCdnAssets', () => {

    it('returns array of URLs', () => {
      const manifest = {
        assets: `
        <link href="https://img1.dev-wsimg.com/wrhs-assets/12345/uxcore2.css"/>
        <script src="https://img1.dev-wsimg.com/wrhs-assets/12345/vendor.js"/>
      `
      };

      result = parseCdnAssets(manifest);
      expect(Array.isArray(result)).toBe(true);
    });

    it('parses from hydra prod manifest', () => {
      const manifest = require('./fixtures/hydra-prod');

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(11);
    });

    it('parses from hydra test manifest', () => {
      const manifest = require('./fixtures/hydra-test');

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(11);
    });

    it('parses from hydra dev manifest', () => {
      const manifest = require('./fixtures/hydra-dev');

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(11);
    });

    it('matches CDN URLs from tag attributes', () => {
      const manifest = {
        assets: `
        <link href="https://img1.dev-wsimg.com/wrhs-assets/12345/uxcore2.css"/>
        <script src="https://img1.dev-wsimg.com/wrhs-assets/12345/vendor.js"/>
      `
      };

      result = parseCdnAssets(manifest);
      expect(result).toEqual([
        'https://img1.dev-wsimg.com/wrhs-assets/12345/uxcore2.css',
        'https://img1.dev-wsimg.com/wrhs-assets/12345/vendor.js'
      ]);
    });

    it('does not match non-CDN URLs', () => {
      const manifest = {
        assets: `
        <link href="https://godaddy.com/12345/uxcore2.css"/>
        <script src="https://secureserver.net/vendor.js"/>
      `
      };

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(0);
    });

    it('matches dev and test CDN URLs', () => {
      const manifest = {
        assets: `
        <link href="https://img1.dev-wsimg.com/wrhs-assets/12345/uxcore2.css"/>
        <script src="https://img1.dev-wsimg.com/wrhs-assets/12345/vendor.js"/>
        <link href="https://img1.test-wsimg.com/wrhs-assets/12345/uxcore2.css"/>
        <script src="https://img1.test-wsimg.com/wrhs-assets/12345/vendor.js"/>
      `
      };

      result = parseCdnAssets(manifest);
      expect(result).toEqual([
        'https://img1.dev-wsimg.com/wrhs-assets/12345/uxcore2.css',
        'https://img1.dev-wsimg.com/wrhs-assets/12345/vendor.js',
        'https://img1.test-wsimg.com/wrhs-assets/12345/uxcore2.css',
        'https://img1.test-wsimg.com/wrhs-assets/12345/vendor.js'
      ]);
    });

    it('does not match style urls()', () => {
      const manifest = {
        assets: `
<style>
@font-face {
  font-family: uxfont;
  src: url(//img1.wsimg.com/ux/fonts/uxfont/1.4/uxfont.woff2) format("woff2"), url(//img1.wsimg.com/ux/fonts/uxfont/1.4/uxfont.woff) format("woff");
  font-display: block;
}
@font-face {
  font-family: uxfont-2;
  src: url(//img1.wsimg.com/ux/fonts/uxfont/1.4/uxfont-2.woff2) format("woff2"), url(//img1.wsimg.com/ux/fonts/uxfont/1.4/uxfont-2.woff) format("woff");
  font-display: block;
}
</style>`
      };

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(0);
    });

    it('does not match "loose" urls', () => {
      const manifest = {
        assets: `
        https://img1.dev-wsimg.com/wrhs-assets/12345/uxcore2.css
        src:"https://img1.dev-wsimg.com/wrhs-assets/12345/vendor.js"
      `
      };

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(0);
    });

    it('does not include favicon assets', () => {
      const manifest = {
        assets: `
<link rel="apple-touch-icon" sizes="180x180" href="//img1.dev-wsimg.com/ux/favicon/apple-icon-180x180.png"/>
<link rel="icon" type="image/png" sizes="192x192" href="//img1.dev-wsimg.com/ux/favicon/android-icon-192x192.png"/>
      `
      };

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(0);
    });

    it('does not include unexpected assets', () => {
      const manifest = {
        assets: `
<link href="//img1.dev-wsimg.com/something.bogus"/>
<img src="//img1.dev-wsimg.com/some-giant.mp4"/>
      `
      };

      result = parseCdnAssets(manifest);
      expect(result).toHaveLength(0);
    });
  });

  describe('manifestTransforms', () => {
    let manifestTransforms, addCdnAssets;

    beforeAll(async () => {
      mockPC.data = require('./fixtures/hydra-prod');
      const wb = await workbox(mockGasket, mockConfig, mockContext);
      manifestTransforms = wb.manifestTransforms;
      addCdnAssets = manifestTransforms[0];
    });

    it('includes addCdnAssets function', () => {
      expect(typeof addCdnAssets).toBe('function');
    });

    describe('addCdnAssets', () => {

      it('returns an object with manifest', () => {
        result = addCdnAssets([]);
        expect(Array.isArray(result.manifest)).toBe(true);
      });

      it('adds the assets parsed from manifest', () => {
        result = addCdnAssets([]);
        expect(result.manifest).toHaveLength(11);
        expect(result.manifest[0]).toHaveProperty('url');
      });

      it('retains existing assets', () => {
        result = addCdnAssets([
          {
            url: 'path/to/some.js'
          }, {
            url: 'path/to/some.css'
          }]);
        expect(result.manifest).toHaveLength(13);
      });
    });
  });
});
