import type { HookHandler } from '@gasket/core';
import type { GOATConfig } from './types.js';

const requiredProps: Array<keyof GOATConfig> = ['baseUrl', 'appId', 'projectId'];

export const configure: HookHandler<'configure'> = function configure(gasket, baseConfig) {
  const goat = baseConfig.goat || {} as Partial<GOATConfig>;

  for (const prop of requiredProps) {
    if (!goat[prop]) {
      throw new Error(`GOAT config error - missing required config (${prop})`);
    }
  }

  baseConfig.goat = goat as GOATConfig;
  return baseConfig;
};
