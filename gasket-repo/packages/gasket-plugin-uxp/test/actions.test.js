import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../lib/presentation');
const { getContent } = await import('../lib/presentation.js');
const actions = await import('../lib/actions.js');

describe('actions', () => {
  let mockGasket, mockContent, mockReq, expectedGasketRequest;

  beforeEach(() => {
    mockReq = { headers: { 'x-test': '12345' } };
    expectedGasketRequest = expect.objectContaining(mockReq);
    mockContent = {};
    mockGasket = {
      config: {},
      execWaterfall: vi.fn().mockImplementation(async (name, content) => content),
      actions: {
        getVisitor: vi.fn().mockReturnValue({ stuff: true })
      }
    };

    getContent.mockResolvedValue(mockContent);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns expected actions', () => {
    expect(actions).toHaveProperty('getPresentationCentral', expect.any(Function));
  });

  describe('getPresentationCentral', () => {
    let getPresentationCentral;

    beforeEach(() => {
      getPresentationCentral = actions.getPresentationCentral;
    });

    it('gets content with PresentationCentral', async () => {
      await getPresentationCentral(mockGasket, mockReq);
      expect(getContent).toHaveBeenCalledWith(mockGasket, expectedGasketRequest);
    });

    it('invokes headerContent Gasket lifecycle', async () => {
      await getPresentationCentral(mockGasket, mockReq);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('headerContent', mockContent, { req: expectedGasketRequest });
    });

    it('returns existing request results', async () => {
      const results1 = await getPresentationCentral(mockGasket, mockReq);
      const results2 = await getPresentationCentral(mockGasket, mockReq);
      // new req object
      const results3 = await getPresentationCentral(mockGasket, { headers: { 'x-new': 'true' } });
      // use prev req again
      const results4 = await getPresentationCentral(mockGasket, mockReq);

      expect(results1).toBe(results2);
      expect(results1).not.toBe(results3);
      expect(results1).toBe(results4);
    });

    it('includes data with fallbacks', async () => {
      mockContent.data = {
        header: 'mock-header'
      };

      const results = await getPresentationCentral(mockGasket, mockReq);

      expect(results.data).toEqual(expect.objectContaining({
        header: 'mock-header',
        // fallbacks
        footer: '',
        assets: {
          css: '',
          js: ''
        }
      }));
    });

    it('includes meta if set', async () => {
      const results = (await getPresentationCentral(mockGasket, mockReq));
      expect(results).not.toHaveProperty('meta');

      mockContent.meta = { mock: 'meta' };
      mockReq = { headers: { 'x-new': 'true' } };
      const results2 = (await getPresentationCentral(mockGasket, mockReq));
      expect(results2).toHaveProperty('meta');
    });

    it('includes error if set', async () => {
      const results = (await getPresentationCentral(mockGasket, mockReq));
      expect(results).not.toHaveProperty('error');

      mockContent.error = { mock: 'error' };
      mockReq = { headers: { 'x-new': 'true' } };
      const results2 = (await getPresentationCentral(mockGasket, mockReq));
      expect(results2).toHaveProperty('error');
    });

    it('includes page from gasket.config if set', async () => {
      const results = (await getPresentationCentral(mockGasket, mockReq));
      expect(results).not.toHaveProperty('page');

      mockGasket.config.presentationCentral = { page: 'mock-page' };
      mockReq = { headers: { 'x-new': 'true' } };
      const results2 = (await getPresentationCentral(mockGasket, mockReq));
      expect(results2).toHaveProperty('page', 'mock-page');
    });

    it('includes disableRTL from gasket.config if set', async () => {
      const results = (await getPresentationCentral(mockGasket, mockReq));
      expect(results).not.toHaveProperty('disableRTL');

      mockGasket.config.presentationCentral = { disableRTL: true };
      mockReq = { headers: { 'x-new': 'true' } };
      const results2 = (await getPresentationCentral(mockGasket, mockReq));
      expect(results2).toHaveProperty('disableRTL', true);
    });

    it('handles PC errors', async () => {
      const mockError = new Error('mock-error');
      getContent.mockRejectedValue(mockError);

      const results = (await getPresentationCentral(mockGasket, mockReq));
      expect(results).toHaveProperty('error', mockError);

      expect(results).toHaveProperty('data', expect.objectContaining({
        header: '',
        footer: '',
        assets: {
          css: '',
          js: ''
        }
      }));
    });
  });
});
