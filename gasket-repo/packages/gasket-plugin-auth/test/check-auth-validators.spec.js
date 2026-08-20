import { vi } from 'vitest';
import {
  validateIdp,
  validateJomax,
  validatePass,
  validateCert,
  validateAwsIam,
  validateOauth
} from '../lib/check-auth-validators.js';

vi.mock('../lib/check-auth-helpers', async () => {
  const actual = await vi.importActual('../lib/check-auth-helpers.js');
  return {
    performAuthenticate: vi.fn(),
    fetchJomaxGroups: vi.fn(),
    validateGroups: actual.validateGroups
  };
});

const {
  performAuthenticate,
  fetchJomaxGroups
} = await import('../lib/check-auth-helpers.js');

describe('validate', () => {
  let req, mockOptions, mockGasket;

  beforeEach(() => {
    req = {
      headers: {
        'x-example': 'example'
      }
    };
    mockOptions = {
      type: 'idp',
      host: 'dev-godaddy.com'
    };
    mockGasket = {
      config: { env: 'test' },
      logger: { warn: vi.fn() }
    };

    fetchJomaxGroups.mockResolvedValue(['group1', 'group2']);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('validateIdp', () => {

    beforeEach(() => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getShopperPayload: () => ({
          plid: 123456,
          cid: 'example',
          shopperId: 'example'
        })
      });
    });

    it('resolves with expected details', async () => {
      const result = await validateIdp(mockOptions, req, null, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'idp',
        details: {
          type: 'basic',
          plid: 123456,
          customerId: 'example',
          cid: 'example',
          shopperId: 'example'
        }
      });
    });

    it('includes privateLabelType if plt in payload', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getShopperPayload: () => ({
          plid: 123456,
          cid: 'example',
          shopperId: 'example',
          plt: 1
        })
      });

      const result = await validateIdp(mockOptions, req, null, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'idp',
        details: {
          type: 'basic',
          plid: 123456,
          customerId: 'example',
          cid: 'example',
          shopperId: 'example',
          privateLabelType: 1
        }
      });
    });

    it('rejects with auth error', async () => {
      const mockError = new Error('Invalid token');
      performAuthenticate.mockRejectedValue(mockError);

      await expect(() => validateIdp(mockOptions, req)).rejects.toThrow(mockError);
    });

    it('rejects if plid of options does not match token on secureserver.net', async () => {
      mockOptions.plid = 123;
      mockOptions.host = 'dev-secureserver.net';
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getShopperPayload: () => ({
          plid: 567
        })
      });

      await expect(() => validateIdp(mockOptions, req)).rejects.toThrow(/Mismatched plid/);
    });

    it('ignores mismatch plid on 123-reg.co.uk', async () => {
      mockOptions.plid = 123;
      mockOptions.host = 'dev-123-reg.co.uk';
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getShopperPayload: () => ({
          plid: 567,
          cid: 'example',
          shopperId: 'example'
        })
      });

      const result = await validateIdp(mockOptions, req, null, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'idp',
        details: {
          plid: 567,
          type: 'basic',
          customerId: 'example',
          cid: 'example',
          shopperId: 'example'
        }
      });
    });

    it('e2* tokens check for groups', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'e2s',
        getShopperPayload: () => ({
          cid: 'example',
          shopperId: 'example'
        })
      });

      const result = await validateIdp(mockOptions, req, ['group1'], mockGasket);
      expect(fetchJomaxGroups).toHaveBeenCalledWith(mockOptions, req);
      expect(result).toEqual(expect.objectContaining({
        valid: true
      }));
    });

    /**
     * The ucid will be a top-level guid in the token if present
     * https://godaddy-corp.atlassian.net/wiki/spaces/AUTH/pages/89653651/Token+Claims#Employee-To-Shopper-Token
     */
    it('e2* tokens has ucid details if present', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'e2s',
        ucid: 'example',
        getShopperPayload: () => ({
          cid: 'example',
          shopperId: 'example'
        })
      });

      const result = await validateIdp(mockOptions, req, null, mockGasket);
      expect(result).toEqual(expect.objectContaining({
        valid: true,
        details: expect.objectContaining({
          ucid: 'example'
        })
      }));
    });

    it('e2* tokens fail when expected groups not met', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'e2s',
        getShopperPayload: () => ({
          cid: 'example',
          shopperId: 'example'
        })
      });

      await expect(() => validateIdp(mockOptions, req, ['fake'], mockGasket)).rejects.toThrow(/Unauthorized groups/);
      expect(fetchJomaxGroups).toHaveBeenCalledWith(mockOptions, req);
    });
  });



  describe('validatePass', () => {
    beforeEach(() => {
      mockOptions.type = 'pass';
    });

    it('resolves with expected details', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getPassPayload: () => ({
          passId: 'example-pass'
        })
      });

      const result = await validatePass(mockOptions, req, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'pass',
        details: {
          passId: 'example-pass'
        }
      });
    });

    it('rejects with auth error', async () => {
      const mockError = new Error('Invalid token');
      performAuthenticate.mockRejectedValue(mockError);

      await expect(() => validatePass(mockOptions, req)).rejects.toThrow(mockError);
    });
  });

  describe('validateJomax', () => {
    beforeEach(() => {
      mockOptions.type = 'jomax';
    });

    it('resolves with expected details', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getJomaxPayload: () => ({
          accountName: 'example'
        })
      });

      const result = await validateJomax(mockOptions, req, null, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'jomax',
        details: {
          accountName: 'example',
          groups: ['group1', 'group2']
        }
      });
    });

    it('passes when any groups matches', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getJomaxPayload: () => ({
          accountName: 'example'
        })
      });

      const result = await validateJomax(mockOptions, req, ['group1'], mockGasket);
      expect(fetchJomaxGroups).toHaveBeenCalledWith(mockOptions, req);
      expect(result).toEqual(expect.objectContaining({
        valid: true
      }));
    });

    it('throws when no groups match', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getJomaxPayload: () => ({
          accountName: 'example'
        })
      });

      await expect(() => validateJomax(mockOptions, req, ['fake'], mockGasket)).rejects.toThrow(/Unauthorized groups/);
      expect(fetchJomaxGroups).toHaveBeenCalledWith(mockOptions, req);
    });
  });

  describe('validateCert', () => {
    beforeEach(() => {
      mockOptions.type = 'cert';
    });

    it('resolves with expected details', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getCertPayload: () => ({
          cn: 'example-cert'
        })
      });

      const result = await validateCert(mockOptions, req, null, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'cert',
        details: {
          cert: 'example-cert'
        }
      });
    });

    it('passes when any groups matches', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getCertPayload: () => ({
          cn: 'example-cert'
        })
      });

      const result = await validateCert(mockOptions, req, ['example-cert'], mockGasket);
      expect(result).toEqual(expect.objectContaining({
        valid: true
      }));
    });

    it('throws when no groups match', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getCertPayload: () => ({
          cn: 'example-cert'
        })
      });

      await expect(() => validateCert(mockOptions, req, ['fake'], mockGasket))
        .rejects.toThrow(/Unauthorized certificate \(example-cert\)/);
    });
  });

  describe('validateAwsIam', () => {
    beforeEach(() => {
      mockOptions.type = 'awsiam';
    });

    it('resolves with expected details', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getAwsIamPayload: () => ({
          sub: 'example-role'
        })
      });

      const result = await validateAwsIam(mockOptions, req, null, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'awsiam',
        details: {
          role: 'example-role'
        }
      });
    });

    it('passes when any groups matches', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getAwsIamPayload: () => ({
          sub: 'example-role'
        })
      });

      const result = await validateAwsIam(mockOptions, req, ['example-role'], mockGasket);
      expect(result).toEqual(expect.objectContaining({
        valid: true
      }));
    });

    it('throws when no groups match', async () => {
      performAuthenticate.mockResolvedValue({
        auth: 'basic',
        getAwsIamPayload: () => ({
          sub: 'example-role'
        })
      });

      await expect(() => validateAwsIam(mockOptions, req, ['fake'], mockGasket))
        .rejects.toThrow(/Unauthorized IAM Role \(example-role\)/);
    });
  });

  describe('validateOauth', () => {
    beforeEach(() => {
      mockOptions.type = 'oauth';
      mockOptions.realm = 'oauth';
    });

    it('returns clientId and a scopes array on success', async () => {
      performAuthenticate.mockResolvedValue({
        oauth: true,
        clientId: 'consumer-x',
        scope: 'golf-next.translate profile'
      });

      const result = await validateOauth(mockOptions, req, null, mockGasket);
      expect(result).toEqual({
        valid: true,
        realm: 'oauth',
        details: {
          clientId: 'consumer-x',
          scopes: ['golf-next.translate', 'profile']
        }
      });
    });

    it('returns an empty scopes array when the token has no scope', async () => {
      performAuthenticate.mockResolvedValue({
        oauth: true,
        clientId: 'consumer-x'
      });

      const result = await validateOauth(mockOptions, req, null, mockGasket);
      expect(result.details.scopes).toEqual([]);
    });

    it('throws when a required scope is missing', async () => {
      performAuthenticate.mockResolvedValue({
        oauth: true,
        clientId: 'consumer-x',
        scope: 'other.scope'
      });

      await expect(validateOauth(mockOptions, req, ['golf-next.translate'], mockGasket))
        .rejects.toThrow(/scope/i);
    });
  });
});
