import type { GasketConfig, HookHandler } from '@gasket/core';
import type { SpaceConfig } from './types.js';

const expectedConfigProps: Array<keyof SpaceConfig> = [
  'space',
  'mainEnvironment',
  'deliveryToken',
  'previewToken'
];

function validateSpaceConfig(spaceId: string, spaceConfig: SpaceConfig, expectedProps: Array<keyof SpaceConfig>): void {
  if (!spaceConfig || !Object.keys(spaceConfig).length) {
    throw new Error(`Contentful space error (${spaceId}) - missing configuration`);
  }
  for (const prop of expectedProps) {
    if (!spaceConfig[prop]) {
      throw new Error(`Contentful space error (${spaceId}) - missing config (${prop})`);
    }
  }
}

export const configure: HookHandler<'configure'> = (gasket, baseConfig): GasketConfig => {
  const { env } = baseConfig;
  const { spaces } = baseConfig.contentful;

  for (const spaceId of Object.keys(spaces)) {
    try {
      validateSpaceConfig(spaceId, spaces[spaceId], expectedConfigProps);
    } catch (error: any) {
      if (env !== 'local') throw error;
      gasket.logger.warn(error.message);
      delete spaces[spaceId];
    }
  }

  if (Object.keys(spaces).length === 0) {
    throw new Error('At least one Contentful space needs to be configured.');
  }

  return baseConfig;
};

export default configure;
