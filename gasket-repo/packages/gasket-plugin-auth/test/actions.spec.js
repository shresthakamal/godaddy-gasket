import { vi } from 'vitest';

vi.mock('../lib/check-auth');

const mockCheckAuth = vi.fn().mockResolvedValue({ valid: false });
const { makeCheckAuth } = await import('../lib/check-auth.js');
makeCheckAuth.mockReturnValue(mockCheckAuth);

import actions from '../lib/actions.js';

describe('actions', () => {
  let mockGasket, mockReq;

  beforeEach(() => {
    mockGasket = {
      logger: {
        debug: vi.fn()
      }
    };
    mockReq = {
      headers: { host: 'example.com' }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an object', () => {
    expect(actions).toBeInstanceOf(Object);
  });

  it('has expected functions', () => {
    const expected = [
      'getCheckAuth',
      'checkAuth',
      'checkShopperAuth',
      'getAuthToken'
    ];

    expect(Object.keys(actions)).toEqual(expected);
    expected.forEach(key => {
      expect(actions[key]).toBeInstanceOf(Function);
    });
  });

  describe('getCheckAuth', () => {
    it('returns a checkAuth', () => {
      const results = actions.getCheckAuth(mockGasket, mockReq);
      expect(results).toBe(mockCheckAuth);
    });
  });

  describe('checkAuth', () => {
    it('calls checkAuth and returns results', async () => {
      const authParams = { realm: 'jomax' };
      const results = await actions.checkAuth(mockGasket, mockReq, authParams);
      expect(mockCheckAuth).toHaveBeenCalledWith(authParams);
      expect(results).toEqual({ valid: false });
    });
  });

  describe('checkShopperAuth', () => {
    it('calls checkAuth with idp defaults and returns results', async () => {
      const results = await actions.checkShopperAuth(mockGasket, mockReq);
      expect(mockCheckAuth).toHaveBeenCalledWith(expect.objectContaining({
        realm: 'idp',
        risk: 'low',
        type: [
          'basic',
          'e2s',
          's2s',
          'e2s2s',
          's2snpr',
          'e2s2snpr'
        ]
      }));
      expect(results).toEqual({ valid: false });
    });
  });

  describe('getAuthToken', () => {
    it('gets token from cookie', async () => {
      const realm = 'idp';
      mockReq.cookies = { auth_idp: 'mock-idp-token' };
      const result = await actions.getAuthToken(mockGasket, mockReq, realm);
      expect(result).toBe('mock-idp-token');
    });

    it('gets token from authorization header', async () => {
      const realm = 'idp';
      mockReq.headers = { authorization: 'sso-jwt mock-idp-token' };
      const result = await actions.getAuthToken(mockGasket, mockReq, realm);
      expect(result).toBe('mock-idp-token');
    });

    it('gets token from x-authorization header', async () => {
      const realm = 'idp';
      mockReq.headers = { 'x-authorization': 'sso-jwt mock-idp-token' };
      const result = await actions.getAuthToken(mockGasket, mockReq, realm);
      expect(result).toBe('mock-idp-token');
    });

    it('supports other realms', async () => {
      const realm = 'jomax';
      mockReq.cookies = { auth_jomax: 'mock-jomax-token' };
      const result = await actions.getAuthToken(mockGasket, mockReq, realm);
      expect(result).toBe('mock-jomax-token');
    });

    it('returns null when no token found', async () => {
      const realm = 'idp';
      const result = await actions.getAuthToken(mockGasket, mockReq, realm);
      expect(result).toBeNull();
    });

    it('logs debug message when no token found', async () => {
      const realm = 'idp';
      const result = await actions.getAuthToken(mockGasket, mockReq, realm);
      expect(result).toBeNull();
      expect(mockGasket.logger.debug).toHaveBeenCalledWith(
        expect.stringMatching(/Error getting auth token for realm idp: Missing token in header or cookie/)
      );
    });
  });
});
