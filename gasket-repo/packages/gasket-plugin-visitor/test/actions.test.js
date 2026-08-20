import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as actions from '../lib/actions.js';
import { Atlas } from '@godaddy/atlas';
import { clearAtlas, getAtlas } from '../lib/utils/atlas.js';
import { assembleVisitor } from '../lib/utils/visitor.js';

// Mock the utils getVisitor function
vi.mock('../lib/utils/visitor.js', () => ({
  assembleVisitor: vi.fn()
}));

describe('actions', () => {
  let mockGasket, mockReq, mockVisitor;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {},
      query: {},
      path: ''
    };

    mockGasket = {
      actions: {},
      config: {
        env: 'test'
      },
      execWaterfall: vi.fn().mockImplementation(async (name, content) => content)
    };

    mockVisitor = {
      plid: 1,
      market: 'en-US',
      locale: 'en',
      currency: 'USD'
    };

    // Setup default mock return
    assembleVisitor.mockReturnValue(mockVisitor);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns expected actions', () => {
    expect(actions).toHaveProperty('getVisitor', expect.any(Function));
  });

  describe('getVisitor', () => {

    it('returns expected visitor', async () => {
      const results = await actions.getVisitor(mockGasket, mockReq);

      expect(results).toEqual(mockVisitor);
      expect(assembleVisitor).toHaveBeenCalledWith(mockReq, expect.any(Atlas), false, void 0);
    });

    it('invokes visitor Gasket lifecycle', async () => {
      await actions.getVisitor(mockGasket, mockReq);

      expect(mockGasket.execWaterfall).toHaveBeenCalledWith(
        'visitor',
        mockVisitor,
        { req: mockReq }
      );
    });

    it('execs a waterfall for populating visitor details', async function () {
      const modifiedVisitor = { ...mockVisitor, market: 'de-DE' };
      mockGasket.execWaterfall = vi.fn().mockImplementationOnce(() => modifiedVisitor);

      const results = await actions.getVisitor(mockGasket, mockReq);

      expect(mockGasket.execWaterfall).toHaveBeenCalledTimes(1);
      expect(results).toEqual(modifiedVisitor);
    });

    it('uses Atlas from gasket.actions.getAtlas when available', async () => {
      clearAtlas();

      const customAtlas = await Atlas.builder('test').setNoUpdate().build();
      mockGasket.actions = {
        getAtlas: vi.fn().mockResolvedValue(customAtlas)
      };

      await actions.getVisitor(mockGasket, mockReq);

      expect(mockGasket.actions.getAtlas).toHaveBeenCalled();
      expect(assembleVisitor).toHaveBeenCalledWith(mockReq, customAtlas, false, void 0);
    });

    it('falls back to Atlas builder when gasket.actions.getAtlas not available', async () => {
      const atlas = await getAtlas(mockGasket);

      await actions.getVisitor(mockGasket, mockReq);

      expect(assembleVisitor).toHaveBeenCalledWith(mockReq, atlas, false, void 0);
    });

    describe('debug configuration', () => {
      it('enables debug for local environment by default', async () => {
        mockGasket.config.env = 'local';

        await actions.getVisitor(mockGasket, mockReq);

        expect(assembleVisitor).toHaveBeenCalledWith(mockReq, expect.any(Atlas), true, void 0);
      });

      it('disables debug for non-local environment by default', async () => {
        mockGasket.config.env = 'production';

        await actions.getVisitor(mockGasket, mockReq);

        expect(assembleVisitor).toHaveBeenCalledWith(mockReq, expect.any(Atlas), false, void 0);
      });

      it('respects explicit debug config true', async () => {
        mockGasket.config.visitor = { debug: true };

        await actions.getVisitor(mockGasket, mockReq);

        expect(assembleVisitor).toHaveBeenCalledWith(mockReq, expect.any(Atlas), true, void 0);
      });

      it('respects explicit debug config false', async () => {
        mockGasket.config.env = 'local';
        mockGasket.config.visitor = { debug: false };

        await actions.getVisitor(mockGasket, mockReq);

        expect(assembleVisitor).toHaveBeenCalledWith(mockReq, expect.any(Atlas), false, void 0);
      });
    });

    it('passes correct parameters to getVisitor utility', async () => {
      mockReq.headers = {
        'x-dsa-host': 'example.com',
        'x-market-id': 'fr-FR',
        'x-currency-id': 'EUR'
      };
      mockReq.query = { plid: '123' };
      mockReq.cookies = {
        visitor: 'vid=visitor123',
        pathway: 'session456'
      };

      await actions.getVisitor(mockGasket, mockReq);

      expect(assembleVisitor).toHaveBeenCalledWith(mockReq, expect.any(Atlas), false, void 0);
      expect(assembleVisitor).toHaveBeenCalledTimes(1);
    });

    it('passes visitor.priority config through to assembleVisitor', async () => {
      const priority = { hostname: ['x-forwarded'] };
      mockGasket.config.visitor = { priority };

      await actions.getVisitor(mockGasket, mockReq);

      expect(assembleVisitor).toHaveBeenCalledWith(mockReq, expect.any(Atlas), false, priority);
    });

    it('caches results for a request', async () => {
      mockReq.headers = {
        'x-dsa-host': 'example.com',
        'x-market-id': 'fr-FR',
        'x-currency-id': 'EUR'
      };

      const results1 = await actions.getVisitor(mockGasket, mockReq);
      const results2 = await actions.getVisitor(mockGasket, mockReq);

      expect(results1).toBe(results2);
      expect(assembleVisitor).toHaveBeenCalledTimes(1);
    });
  });
});
