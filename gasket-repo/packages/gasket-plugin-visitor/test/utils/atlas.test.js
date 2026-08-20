import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAtlas, clearAtlas } from '../../lib/utils/atlas.js';
import { Atlas } from '@godaddy/atlas';

// Mock @godaddy/atlas
vi.mock('@godaddy/atlas', () => ({
  Atlas: {
    builder: vi.fn()
  }
}));

describe('utils/atlas', () => {
  let mockGasket, mockBuilder, mockAtlas;

  beforeEach(() => {
    // Clear any cached atlas instance
    clearAtlas();

    // Mock atlas instance
    mockAtlas = {
      findBrandByDomain: vi.fn(),
      resolveBrandByPlid: vi.fn(),
      findCurrencyByCode: vi.fn()
    };

    // Mock builder
    mockBuilder = {
      setLogger: vi.fn().mockReturnThis(),
      build: vi.fn().mockResolvedValue(mockAtlas)
    };

    // Mock Atlas.builder
    Atlas.builder.mockReturnValue(mockBuilder);

    // Mock gasket
    mockGasket = {
      config: {
        env: 'test'
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      },
      actions: {}
    };

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearAtlas();
  });

  describe('getAtlas', () => {
    it('should create atlas using gasket.actions.getAtlas when available', async () => {
      const mockActionAtlas = { id: 'action-atlas' };
      mockGasket.actions.getAtlas = vi.fn().mockResolvedValue(mockActionAtlas);

      const result = await getAtlas(mockGasket);

      expect(mockGasket.actions.getAtlas).toHaveBeenCalledWith();
      expect(result).toBe(mockActionAtlas);
      expect(Atlas.builder).not.toHaveBeenCalled();
    });

    it('should create atlas using Atlas.builder when gasket action not available', async () => {
      const result = await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledWith('test');
      expect(mockBuilder.setLogger).toHaveBeenCalledWith(mockGasket.logger);
      expect(mockBuilder.build).toHaveBeenCalled();
      expect(result).toBe(mockAtlas);
    });

    it('should use gasket.config.env for builder environment', async () => {
      mockGasket.config.env = 'dev';

      await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledWith('dev');
    });

    it('should set gasket logger on builder', async () => {
      await getAtlas(mockGasket);

      expect(mockBuilder.setLogger).toHaveBeenCalledWith(mockGasket.logger);
    });

    it('should cache atlas instance and reuse it', async () => {
      const firstResult = await getAtlas(mockGasket);
      const secondResult = await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledTimes(1);
      expect(mockBuilder.build).toHaveBeenCalledTimes(1);
      expect(firstResult).toBe(secondResult);
      expect(firstResult).toBe(mockAtlas);
    });

    it('should prioritize gasket action over builder when available', async () => {
      const mockActionAtlas = { id: 'action-atlas' };
      mockGasket.actions.getAtlas = vi.fn().mockResolvedValue(mockActionAtlas);

      const result = await getAtlas(mockGasket);

      expect(mockGasket.actions.getAtlas).toHaveBeenCalled();
      expect(Atlas.builder).not.toHaveBeenCalled();
      expect(result).toBe(mockActionAtlas);
    });

    it('should handle missing logger gracefully', async () => {
      delete mockGasket.logger;

      const result = await getAtlas(mockGasket);

      expect(mockBuilder.setLogger).toHaveBeenCalledWith(void 0);
      expect(result).toBe(mockAtlas);
    });
  });

  describe('clearAtlas', () => {
    it('should clear cached atlas instance', async () => {
      // First call to cache an atlas
      await getAtlas(mockGasket);
      expect(Atlas.builder).toHaveBeenCalledTimes(1);

      // Clear the cache
      clearAtlas();

      // Second call should create a new atlas
      await getAtlas(mockGasket);
      expect(Atlas.builder).toHaveBeenCalledTimes(2);
      expect(mockBuilder.build).toHaveBeenCalledTimes(2);
    });

    it('should not throw when called multiple times', () => {
      expect(() => {
        clearAtlas();
        clearAtlas();
        clearAtlas();
      }).not.toThrow();
    });

    it('should not throw when called before any atlas creation', () => {
      expect(() => {
        clearAtlas();
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should propagate builder errors', async () => {
      const buildError = new Error('Builder failed');
      mockBuilder.build.mockRejectedValue(buildError);

      await expect(getAtlas(mockGasket)).rejects.toThrow('Builder failed');
    });

    it('should propagate gasket action errors', async () => {
      const actionError = new Error('Action failed');
      mockGasket.actions.getAtlas = vi.fn().mockRejectedValue(actionError);

      await expect(getAtlas(mockGasket)).rejects.toThrow('Action failed');
    });
  });

  describe('integration scenarios', () => {
    it('should work with different environments', async () => {
      const environments = ['dev', 'test', 'prod', 'stg', 'ote'];

      for (const env of environments) {
        clearAtlas();
        mockGasket.config.env = env;

        await getAtlas(mockGasket);

        expect(Atlas.builder).toHaveBeenCalledWith(env);
      }
    });

    it('should handle gasket action availability check correctly', async () => {
      // Test when getAtlas is not in actions
      delete mockGasket.actions.getAtlas;

      await getAtlas(mockGasket);
      expect(Atlas.builder).toHaveBeenCalled();

      clearAtlas();

      Atlas.builder.mockClear();

      // Test when getAtlas is a function
      mockGasket.actions.getAtlas = vi.fn().mockResolvedValue(mockAtlas);

      await getAtlas(mockGasket);
      expect(Atlas.builder).not.toHaveBeenCalled();
      expect(mockGasket.actions.getAtlas).toHaveBeenCalled();
    });
  });
});
