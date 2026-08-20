import { Atlas, AtlasDef } from '@godaddy/atlas';
import { Logger } from '@godaddy/atlas/lib/builder.js';

declare module '@gasket/core' {
  export interface GasketActions {
    /**
     * Get or create an Atlas instance with configuration from gasket.config.atlas
     */
    getAtlas(): Promise<Atlas>;

  }

  export interface GasketConfig {
    atlas?: {
      /** Override the setup environment; defaults to the Gasket env */
      env?: string;
      /** Custom version; defaults to env-based version */
      version?: string;
      /** Custom definitions URLs for testing */
      url?: string;
      /** Update interval in milliseconds; 0 to disable; default 10 minutes (600000ms) */
      updateInterval?: number;
      /** Custom logger object; defaults to console */
      logger?: Logger;
      /** Custom atlas JSON data; bypasses remote fetching */
      json?: AtlasDef;
    };
  }
}

export default {
  name: '@godaddy/gasket-plugin-atlas',
  hooks: {}
};
