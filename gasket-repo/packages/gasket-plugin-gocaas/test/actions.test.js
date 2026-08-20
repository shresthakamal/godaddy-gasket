import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as caas from '@godaddy/caas';
import { getGoCaasClient } from '../lib/actions.js';

vi.mock('@godaddy/caas', () => ({
  createClient: vi.fn()
}));

const mockGoCaasClient = { prompts: vi.fn() };
const mockJWT = 'JWT';
const mockEnv = 'development';

describe('actions', () => {
  describe('getGoCaasClient', () => {
    let gasket;
    beforeEach(() => {
      gasket = {
        config: {
          env: mockEnv,
          jwt: {
            goCaas: {}
          }
        },
        actions: {
          getJwt: async () => {
            return mockJWT;
          }
        }
      };
      // @ts-expect-error - mock function
      caas.createClient.mockResolvedValue(mockGoCaasClient);
    });

    it('uses the getJwt action when jwt is defined in Gasket Config', async () => {
      const result = await getGoCaasClient(gasket);

      expect(caas.createClient).toHaveBeenCalledWith({ jwt: mockJWT, env: mockEnv });
      expect(result).toBe(mockGoCaasClient);
    });

    it('uses headers from Gasket Config when defined', async () => {
      const mockHeaders = { 'x-foo': 'bar' };
      gasket.config.goCaas = {
        headers: mockHeaders
      };
      const result = await getGoCaasClient(gasket);

      expect(caas.createClient).toHaveBeenCalledWith({ jwt: mockJWT, env: mockEnv, headers: mockHeaders });
      expect(result).toBe(mockGoCaasClient);
    });

    it('uses the jomax when jwt is not defined in Gasket Config', async () => {
      const JOMAX_JWT = 'JOMAX_JWT';
      gasket.config.jwt = null;
      const result = await getGoCaasClient(gasket, JOMAX_JWT);

      expect(caas.createClient).toHaveBeenCalledWith({ env: mockEnv, jwt: JOMAX_JWT });
      expect(result).toBe(mockGoCaasClient);
    });

    it('throws an error when no jwt is found', async () => {
      gasket.config.jwt = null;
      await expect(getGoCaasClient(gasket)).rejects.toThrow('No JWT found for GoCaas client');
    });
  });
});
