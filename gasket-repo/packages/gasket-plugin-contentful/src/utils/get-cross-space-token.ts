import type { ClientOptions, ContentfulConfig } from '../types.js';

export function getCrossSpaceToken(contentfulConfig: ContentfulConfig, clientOptions: ClientOptions) {
  const spaceTokenMap = createSpaceTokenMap(contentfulConfig, clientOptions);

  if (!Object.keys(spaceTokenMap).length) return null;

  return encodeSpaceTokenMap(spaceTokenMap);
}

function createSpaceTokenMap(contentfulConfig: ContentfulConfig, clientOptions: ClientOptions): Record<string, string> {
  return Object.keys(contentfulConfig.spaces).reduce((acc, spaceKey) => {
    if (spaceKey === clientOptions.spaceKey) return acc;

    const spaceConfig = contentfulConfig.spaces[spaceKey];
    const { space, crossSpaceSource, previewToken, deliveryToken } = spaceConfig;

    if (!crossSpaceSource) return acc;

    if (clientOptions.isPreview && previewToken) {
      acc[space] = previewToken;
    } else {
      acc[space] = deliveryToken;
    }

    return acc;
  }, {} as Record<string, string>);
}

function encodeSpaceTokenMap(spaceTokenMap: Record<string, string>): string {
  return Buffer.from(JSON.stringify({ spaces: spaceTokenMap })).toString('base64');
}
