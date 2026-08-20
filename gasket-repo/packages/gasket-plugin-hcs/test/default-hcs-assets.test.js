import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mockPackages = require('./wrhs-assets-result.json');

// Mock the createRequire function to intercept package.json requires
vi.mock('module', async () => {
  const actual = await vi.importActual('module');
  return {
    ...actual,
    createRequire: vi.fn((url) => {
      const realRequire = actual.createRequire(url);
      return (modulePath) => {
        // Intercept package.json requires
        if (modulePath.endsWith('package.json')) {
          return {
            name: '@ux/application-sidebar'
          };
        }
        return realRequire(modulePath);
      };
    })
  };
});

import hcsAssets from '../lib/default-hcs-assets.js';

describe('default hcsAssets', () => {
  let mockGasket;
  let mockAssetManager;

  beforeEach(() => {
    mockAssetManager = {
      addScript: vi.fn(),
      addChunk: vi.fn(),
      addCss: vi.fn()
    };
    mockGasket = {
      config: {
        root: '../',
        hcs: {
          devMode: false
        }
      }
    };
  });

  it('calls addScript with bundleUrl', () => {
    hcsAssets(mockGasket, mockAssetManager, mockPackages);
    expect(mockAssetManager.addScript).toHaveBeenCalledTimes(2);
    expect(mockAssetManager.addScript).toHaveBeenNthCalledWith(1, {
      src: 'https://img6.wsimg.com/wrhs-next/sha/application-sidebar.js'
    }, { deferjs: false, prepend: false });
  });

  it('calls addScript with deferjs=true with bundleUrl', () => {
    hcsAssets(mockGasket, mockAssetManager, mockPackages, true);
    expect(mockAssetManager.addScript).toHaveBeenCalledTimes(2);
    expect(mockAssetManager.addScript).toHaveBeenNthCalledWith(1, {
      src: 'https://img6.wsimg.com/wrhs-next/sha/application-sidebar.js'
    }, { deferjs: true, prepend: false });
  });

  it('calls addCss with bundleUrl', () => {
    hcsAssets(mockGasket, mockAssetManager, mockPackages);
    expect(mockAssetManager.addCss).toHaveBeenCalledTimes(1);
    expect(mockAssetManager.addCss).toHaveBeenLastCalledWith({
      href: 'https://img6.wsimg.com/wrhs-next/sha/application-sidebar.css'
    });
  });

  it('calls addChunk for chunks', () => {
    hcsAssets(mockGasket, mockAssetManager, mockPackages);
    expect(mockAssetManager.addChunk).toHaveBeenCalledTimes(2);
    expect(mockAssetManager.addChunk).toHaveBeenCalledWith({
      name: 'opt-out-modal.application-sidebar',
      src: 'https://img6.wsimg.com/wrhs-next/sha/opt-out-modal.application-sidebar.js'
    });
  });

  it('prepends vendor scripts', () => {
    hcsAssets(mockGasket, mockAssetManager, mockPackages);
    expect(mockAssetManager.addScript).toHaveBeenCalledTimes(2);
    expect(mockAssetManager.addScript).toHaveBeenLastCalledWith({
      src: 'https://img6.wsimg.com/wrhs-next/sha/vendor.min.js'
    }, { deferjs: false, prepend: true });
  });

  it('returns without adding assets when packages[name] is undefined', () => {
    hcsAssets(mockGasket, mockAssetManager, {});
    expect(mockAssetManager.addScript).not.toHaveBeenCalled();
    expect(mockAssetManager.addChunk).not.toHaveBeenCalled();
    expect(mockAssetManager.addCss).not.toHaveBeenCalled();
  });

  it('returns without adding assets when packages[name].files is missing', () => {
    hcsAssets(mockGasket, mockAssetManager, { '@ux/application-sidebar': {} });
    expect(mockAssetManager.addScript).not.toHaveBeenCalled();
    expect(mockAssetManager.addChunk).not.toHaveBeenCalled();
    expect(mockAssetManager.addCss).not.toHaveBeenCalled();
  });

  it('skips chunks matching excludeChunks prefix glob (symbol-*)', () => {
    const gasket = { config: { ...mockGasket.config, hcs: { ...mockGasket.config.hcs, excludeChunks: ['symbol-*'] } } };
    hcsAssets(gasket, mockAssetManager, mockPackages);
    const calls = mockAssetManager.addChunk.mock.calls.map(([{ name }]) => name);
    expect(calls).not.toContain('symbol-icons');
  });

  it('skips chunks matching excludeChunks suffix glob (*-sidebar)', () => {
    const gasket = { config: { ...mockGasket.config, hcs: { ...mockGasket.config.hcs, excludeChunks: ['*-sidebar'] } } };
    hcsAssets(gasket, mockAssetManager, mockPackages);
    const calls = mockAssetManager.addChunk.mock.calls.map(([{ name }]) => name);
    expect(calls).not.toContain('opt-out-modal.application-sidebar');
  });

  it('skips chunks matching excludeChunks exact name', () => {
    const gasket = { config: { ...mockGasket.config, hcs: { ...mockGasket.config.hcs, excludeChunks: ['opt-out-modal.application-sidebar'] } } };
    hcsAssets(gasket, mockAssetManager, mockPackages);
    const calls = mockAssetManager.addChunk.mock.calls.map(([{ name }]) => name);
    expect(calls).not.toContain('opt-out-modal.application-sidebar');
  });

  it('does not skip chunks when excludeChunks is empty', () => {
    hcsAssets(mockGasket, mockAssetManager, mockPackages);
    const calls = mockAssetManager.addChunk.mock.calls.map(([{ name }]) => name);
    expect(calls).toContain('opt-out-modal.application-sidebar');
    expect(calls).toContain('symbol-icons');
  });
});

import { matchesGlob } from '../lib/default-hcs-assets.js';

describe('matchesGlob', () => {
  it('matches exact string', () => {
    expect(matchesGlob('foo', 'foo')).toBe(true);
  });

  it('does not match different exact string', () => {
    expect(matchesGlob('foo', 'bar')).toBe(false);
  });

  it('matches prefix glob (symbol-*)', () => {
    expect(matchesGlob('symbol-icons', 'symbol-*')).toBe(true);
    expect(matchesGlob('symbol-arrows', 'symbol-*')).toBe(true);
  });

  it('does not match prefix glob when prefix differs', () => {
    expect(matchesGlob('other-icons', 'symbol-*')).toBe(false);
  });

  it('matches suffix glob (*-sidebar)', () => {
    expect(matchesGlob('opt-out-modal.application-sidebar', '*-sidebar')).toBe(true);
  });

  it('does not match suffix glob when suffix differs', () => {
    expect(matchesGlob('opt-out-modal.application-sidebar', '*-header')).toBe(false);
  });

  it('matches ? wildcard for single character', () => {
    expect(matchesGlob('icon-a', 'icon-?')).toBe(true);
    expect(matchesGlob('icon-ab', 'icon-?')).toBe(false);
  });

  it('matches * in the middle', () => {
    expect(matchesGlob('opt-out-modal.application-sidebar', 'opt-*-sidebar')).toBe(true);
  });

  it('matches empty string against *', () => {
    expect(matchesGlob('', '*')).toBe(true);
  });

  it('does not match empty string against non-wildcard pattern', () => {
    expect(matchesGlob('', 'foo')).toBe(false);
  });
});
