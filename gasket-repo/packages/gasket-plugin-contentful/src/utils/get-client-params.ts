import type { CreateClientParams } from 'contentful';
import type { ClientOptions, ContentfulConfig, SpaceConfig } from '../types.js';
import { getCrossSpaceToken } from './get-cross-space-token.js';

function getEnvironment(spaceConfig: SpaceConfig, clientOptions: ClientOptions) {
  if (!clientOptions.isPreview) return spaceConfig.mainEnvironment;
  return clientOptions.environment || spaceConfig.mainEnvironment;
}

export function getClientParams(contentfulConfig: ContentfulConfig, clientOptions: ClientOptions) {
  const { spaceKey, isPreview = false } = clientOptions;
  const spaceConfig = contentfulConfig.spaces[spaceKey];

  let clientParams: CreateClientParams = {
    space: spaceConfig.space,
    host: 'cdn.contentful.com',
    environment: getEnvironment(spaceConfig, clientOptions),
    accessToken: spaceConfig.deliveryToken
  };

  if (isPreview && spaceConfig.previewToken) {
    clientParams.host = 'preview.contentful.com';
    clientParams.accessToken = spaceConfig.previewToken;
  }

  if (clientOptions.overrides) {
    clientParams = { ...clientParams, ...clientOptions.overrides };
  }

  const crossSpaceToken = getCrossSpaceToken(contentfulConfig, clientOptions);
  if (crossSpaceToken) {
    clientParams.headers ??= {};
    clientParams.headers['X-Contentful-Resource-Resolution'] = crossSpaceToken;
  }

  return clientParams;
}
