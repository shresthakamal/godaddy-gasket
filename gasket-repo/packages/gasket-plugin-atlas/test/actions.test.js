import { vi } from 'vitest';

const mockAtlas = {
  findBrandByDomain: vi.fn(),
  resolveBrandByPlid: vi.fn(),
  findCurrencyByCode: vi.fn(),
  version: '1.0.0',
  env: 'test'
};

const mockBuilder = {
  setVersion: vi.fn().mockReturnThis(),
  setUrl: vi.fn().mockReturnThis(),
  setLogger: vi.fn().mockReturnThis(),
  setJson: vi.fn().mockReturnThis(),
  setUpdateInterval: vi.fn().mockReturnThis(),
  setNoUpdate: vi.fn().mockReturnThis(),
  build: vi.fn().mockResolvedValue(mockAtlas)
};

vi.mock('@godaddy/atlas', () => ({
  Atlas: {
    builder: vi.fn().mockReturnValue(mockBuilder)
  }
}));

const { getAtlas, _resetAtlasForTesting } = await import('../lib/actions.js');
const { Atlas } = await import('@godaddy/atlas');

describe('actions', () => {
  let mockGasket;

  beforeEach(() => {
    // Clear any cached atlas instance
    _resetAtlasForTesting();

    // Mock gasket
    mockGasket = {
      config: {
        env: 'test',
        atlas: {}
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
    };

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    _resetAtlasForTesting();
  });

  describe('getAtlas', () => {
    it('should create atlas with default configuration', async () => {
      const result = await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledWith('test');
      expect(mockBuilder.setLogger).toHaveBeenCalledWith(mockGasket.logger);
      expect(mockBuilder.build).toHaveBeenCalled();
      expect(result).toBe(mockAtlas);
    });

    it('should use atlas.env when provided', async () => {
      mockGasket.config.atlas.env = 'dev';

      await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledWith('dev');
    });

    it('should fallback to gasket.config.env when atlas.env not provided', async () => {
      mockGasket.config.env = 'prod';
      delete mockGasket.config.atlas.env;

      await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledWith('prod');
    });

    it('should set version when provided', async () => {
      mockGasket.config.atlas.version = '2.1.0';

      await getAtlas(mockGasket);

      expect(mockBuilder.setVersion).toHaveBeenCalledWith('2.1.0');
    });

    it('should set URL when provided', async () => {
      mockGasket.config.atlas.url = 'http://localhost:3000/atlas.json';

      await getAtlas(mockGasket);

      expect(mockBuilder.setUrl).toHaveBeenCalledWith('http://localhost:3000/atlas.json');
    });

    it('should use custom logger when provided', async () => {
      const customLogger = {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn()
      };
      mockGasket.config.atlas.logger = customLogger;

      await getAtlas(mockGasket);

      expect(mockBuilder.setLogger).toHaveBeenCalledWith(customLogger);
    });

    it('should use gasket logger when no custom logger provided', async () => {
      await getAtlas(mockGasket);

      expect(mockBuilder.setLogger).toHaveBeenCalledWith(mockGasket.logger);
    });

    it('should set JSON when provided', async () => {
      const customJson = {
        version: '1.0.0',
        brands: [],
        markets: []
      };
      mockGasket.config.atlas.json = customJson;

      await getAtlas(mockGasket);

      expect(mockBuilder.setJson).toHaveBeenCalledWith(customJson);
    });

    it('should disable updates when updateInterval is 0', async () => {
      mockGasket.config.atlas.updateInterval = 0;

      await getAtlas(mockGasket);

      expect(mockBuilder.setNoUpdate).toHaveBeenCalled();
      expect(mockBuilder.setUpdateInterval).not.toHaveBeenCalled();
    });

    it('should set custom update interval when provided', async () => {
      mockGasket.config.atlas.updateInterval = 30000;

      await getAtlas(mockGasket);

      expect(mockBuilder.setUpdateInterval).toHaveBeenCalledWith(30000);
      expect(mockBuilder.setNoUpdate).not.toHaveBeenCalled();
    });

    it('should cache atlas instance and reuse it', async () => {
      const firstResult = await getAtlas(mockGasket);
      const secondResult = await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledTimes(1);
      expect(mockBuilder.build).toHaveBeenCalledTimes(1);
      expect(firstResult).toBe(secondResult);
      expect(firstResult).toBe(mockAtlas);
    });

    it('should handle missing atlas config', async () => {
      delete mockGasket.config.atlas;

      const result = await getAtlas(mockGasket);

      expect(Atlas.builder).toHaveBeenCalledWith('test');
      expect(mockBuilder.setLogger).toHaveBeenCalledWith(mockGasket.logger);
      expect(result).toBe(mockAtlas);
    });
  });

});
