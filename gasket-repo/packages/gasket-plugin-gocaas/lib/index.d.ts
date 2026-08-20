/// <reference types="@gasket/core" />

import { Client } from '@godaddy/caas';

type GoCaasGasketConfig = {
  headers?: Record<string, string>;
}

declare module '@gasket/core' {
  export interface GasketConfig {
    goCaas?: GoCaasGasketConfig;
  }

  /** Provides Gasket Actions for the GoCaas Plugin */
  export interface GasketActions {
    /**
     * Generates a GoCaas client.
     * @param {string} jomaxJwt - JOMAX JWT.
     * @returns {Promise<Client>} A Promise resolving to GoCaas client.
     */
    getGoCaasClient(jomaxJwt?: string): Promise<Client>;
  }
}

export const name = '@godaddy/gasket-plugin-gocaas';

export default {
  name: name,
  hooks: {}
};
