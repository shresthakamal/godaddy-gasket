import { vi } from 'vitest';

const mockGetCheckAuth = vi.fn();
const mockCheckAuth = vi.fn();
import configureEndpoint from '../lib/endpoint.js';

describe('Endpoint', () => {
  let mockGasket;

  beforeAll(() => {
    mockGasket = {
      actions: {
        getCheckAuth: mockGetCheckAuth.mockReturnValue(mockCheckAuth)
      }
    };
  });

  describe('configureEndpoint', () => {

    it('returns a function', () => {
      const results = configureEndpoint(mockGasket);
      expect(results).toBeInstanceOf(Function);
    });
  });

  describe('instance', () => {
    let req, res, mockSend;

    beforeEach(() => {
      mockSend = vi.fn();
      res = {
        send: mockSend,
        status: vi.fn().mockReturnThis()
      };
      req = {
        headers: {},
        query: {}
      };
    });

    describe('when invalid', () => {

      it('sets status 500 for errors', async () => {
        mockCheckAuth.mockRejectedValue('some error');
        const endpoint = configureEndpoint(mockGasket);
        await endpoint(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('sets status 401', async () => {
        mockCheckAuth.mockResolvedValue({ valid: false });
        const endpoint = configureEndpoint(mockGasket);
        await endpoint(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('sends invalid response', async () => {
        mockCheckAuth.mockResolvedValue({ valid: false });
        const endpoint = configureEndpoint(mockGasket);
        await endpoint(req, res);
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ valid: false }));
      });
    });

    describe('when valid', () => {

      it('does not set status', async () => {
        mockCheckAuth.mockResolvedValue({ valid: true });
        const endpoint = configureEndpoint(mockGasket);
        await endpoint(req, res);
        expect(res.status).not.toHaveBeenCalled();
      });

      it('sends valid response', async () => {
        mockCheckAuth.mockResolvedValue({ valid: true });
        const endpoint = configureEndpoint(mockGasket);
        await endpoint(req, res);
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ valid: true }));
      });
    });
  });
});
