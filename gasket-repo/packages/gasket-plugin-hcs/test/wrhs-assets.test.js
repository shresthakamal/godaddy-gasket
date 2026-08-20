import { describe, it, expect, beforeEach, vi } from 'vitest';
import wrhsAssets from '../lib/wrhs-assets.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

beforeAll(() => {
  try {
    // remove the wrhs fs cache for tests
    // eslint-disable-next-line no-sync
    fs.rmdirSync(path.join(os.tmpdir(), '.test-wrhs-cache'), { recursive: true });
  } catch {
    // ignore
  }
});

describe('Warehouse Assets lifecycle', () => {
  let mockGasket;

  beforeEach(() => {
    const wrhsClient = {};
    wrhsClient.get = vi.fn();
    mockGasket = {
      config: {
        root: path.join(__dirname, '..', 'generator'),
        hcs: {
          devMode: false
        },
        wrhs: {
          fsCachePath: path.join(os.tmpdir(), '.test-wrhs-cache')
        }
      },
      wrhs: wrhsClient,
      logger: console
    };
  });

  it('fetches the package', async () => {
    mockGasket.wrhs.get.mockResolvedValueOnce({
      name: '@org/pkgName',
      version: '1.0.0',
      variant: 'en-US',
      data: {
        files: [{
          url: 'https://example.com/myfile.js',
          metadata: {
            chunk: false
          }
        }],
        fingerprints: ['abcdefg.gz'],
        recommended: ['https://example.com/myfile.js']
      }
    });
    mockGasket.wrhs.get.mockResolvedValueOnce({
      name: '@org/pkgName2',
      version: '1.0.0',
      variant: 'it-IT',
      data: {
        files: [{
          url: 'https://example.com/myfile_it.js',
          metadata: {
            chunk: false
          }
        }],
        fingerprints: ['beepboop123.gz'],
        recommended: ['https://example.com/myfile_it.js']
      }
    });

    const wrhsReqs = [{
      name: '@org/pkgName',
      version: '1.0.0',
      acceptedVariants: ['fr-FR', 'en-US']
    }, {
      name: '@org/pkgName2',
      version: '1.0.0',
      acceptedVariants: ['it-IT', 'en-US']
    }];

    const assets = await wrhsAssets(mockGasket, wrhsReqs);

    expect(mockGasket.wrhs.get).toHaveBeenCalledWith(`/objects/${encodeURIComponent('@org/pkgName')}`, {
      accepted_variants: 'fr-FR,en-US',
      env: 'development',
      version: '1.0.0'
    });

    expect(mockGasket.wrhs.get).toHaveBeenCalledWith(`/objects/${encodeURIComponent('@org/pkgName2')}`, {
      accepted_variants: 'it-IT,en-US',
      env: 'development',
      version: '1.0.0'
    });

    expect(assets).toEqual({
      '@org/pkgName': {
        files: [{
          url: 'https://example.com/myfile.js',
          metadata: {
            chunk: false
          }
        }],
        fingerprints: ['abcdefg.gz'],
        recommended: ['https://example.com/myfile.js']
      },
      '@org/pkgName2': {
        files: [{
          url: 'https://example.com/myfile_it.js',
          metadata: {
            chunk: false
          }
        }],
        fingerprints: ['beepboop123.gz'],
        recommended: ['https://example.com/myfile_it.js']
      }
    });
  });

  it('uses default accepted variants', async () => {
    mockGasket.wrhs.get.mockResolvedValueOnce({
      name: '@org/pkgName-no-variants',
      version: '1.0.0',
      variant: 'en-US',
      data: {
        files: [{
          url: 'https://example.com/pkgName.js',
          metadata: {
            chunk: false
          }
        }],
        fingerprints: ['a12345.gz'],
        recommended: ['https://example.com/pkgName.js']
      }
    });

    const wrhsReqs = [{
      name: '@org/pkgName-no-variants',
      env: 'test',
      version: '1.0.0'
    }];

    await wrhsAssets(mockGasket, wrhsReqs);

    expect(mockGasket.wrhs.get).toHaveBeenCalledWith(`/objects/${encodeURIComponent('@org/pkgName-no-variants')}`, {
      accepted_variants: '_default',
      env: 'test',
      version: '1.0.0'
    });
  });

  it('returns empty object and warns (not errors) when WRHS returns 404', async () => {
    mockGasket.wrhs.get.mockRejectedValueOnce(new Error('404 Not Found'));
    mockGasket.logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const wrhsReqs = [{ name: '@org/missing-pkg', version: '1.0.0', acceptedVariants: ['branch-variant', '_default'] }];
    const assets = await wrhsAssets(mockGasket, wrhsReqs);

    expect(assets).toEqual({});
    expect(mockGasket.logger.warn).toHaveBeenCalledWith(expect.stringContaining('404 Not Found'));
    expect(mockGasket.logger.error).not.toHaveBeenCalled();
  });

  it('returns empty object and errors (not warns) when WRHS returns a non-404 error', async () => {
    mockGasket.wrhs.get.mockRejectedValueOnce(new Error('503 Service Unavailable'));
    mockGasket.logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const wrhsReqs = [{ name: '@org/pkg', version: '1.0.0', acceptedVariants: ['_default'] }];
    const assets = await wrhsAssets(mockGasket, wrhsReqs);

    expect(assets).toEqual({});
    expect(mockGasket.logger.error).toHaveBeenCalledWith(expect.stringContaining('503 Service Unavailable'));
    expect(mockGasket.logger.warn).not.toHaveBeenCalled();
  });

  it('returns partial results when one of multiple WRHS fetches fails', async () => {
    mockGasket.logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    mockGasket.wrhs.get
      .mockRejectedValueOnce(new Error('404 Not Found'))
      .mockResolvedValueOnce({
        name: '@org/pkgGood',
        version: '1.0.0',
        variant: '_default',
        data: { files: [{ url: 'https://example.com/good.js', metadata: {} }] }
      });

    const wrhsReqs = [
      { name: '@org/pkgBad', version: '1.0.0', acceptedVariants: ['branch-variant', '_default'] },
      { name: '@org/pkgGood', version: '1.0.0', acceptedVariants: ['_default'] }
    ];
    const assets = await wrhsAssets(mockGasket, wrhsReqs);

    expect(assets['@org/pkgBad']).toBeUndefined();
    expect(assets['@org/pkgGood']).toBeDefined();
    expect(mockGasket.logger.warn).toHaveBeenCalledTimes(1);
    expect(mockGasket.logger.error).not.toHaveBeenCalled();
  });

  describe('wrhs cache', () => {
    it('resolves the package from cache', async () => {
      mockGasket.wrhs.get = vi.fn(() => ({
        name: '@org/pkgName-for-cache',
        env: 'test',
        version: '1.0.0',
        variant: 'en-US',
        data: {}
      }));

      const wrhsReqs = [{
        name: '@org/pkgName-for-cache',
        env: 'test',
        version: '1.0.0',
        acceptedVariants: ['fr-FR', 'en-US']
      }];

      // call twice
      await wrhsAssets(mockGasket, wrhsReqs);
      await wrhsAssets(mockGasket, wrhsReqs);

      expect(mockGasket.wrhs.get).toHaveBeenCalledTimes(1);
    });

    it('respects the ttl', async () => {
      mockGasket.wrhs.get = vi.fn(() => ({
        name: '@org/pkgName-for-cache2',
        env: 'test',
        version: '1.0.0',
        variant: 'en-US',
        data: {}
      }));

      const wrhsReqs = [{
        name: '@org/pkgName-for-cache2',
        env: 'test',
        version: '1.0.0',
        acceptedVariants: ['fr-FR', 'en-US'],
        ttl: 0
      }];

      // call twice
      await wrhsAssets(mockGasket, wrhsReqs);
      await wrhsAssets(mockGasket, wrhsReqs);

      expect(mockGasket.wrhs.get).toHaveBeenCalledTimes(2);
    });
  });
});
