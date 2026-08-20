import type { Gasket, GasketConfig } from '@gasket/core';
import type { CDEConfig } from './types.js';


/**
 *
 * @param gasket
 * @param config
 */
export default function configure(gasket: Gasket, config: GasketConfig): GasketConfig {
  const cde: CDEConfig = {
    enable: true,
    ...config.cde
  };

  return { ...config, cde };
}
