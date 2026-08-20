import { Entry, Asset } from 'contentful';

import { Logger } from '@gasket/plugin-logger';
import { ComponentProps, ContentNode, PartType, isContentNode, reverseTraverse } from '@godaddy/gasket-content-nodes';
import type {
  Entries,
  ContentfulPart,
  ContentfulContentSettings,
  AssetMimeTypeMap
} from '../types.js';

import { prepareRichText, isRichText } from '../utils/rich-text.js';

const isUndefined = (v: any) => typeof v === 'undefined';
const isDefined = (v: any) => !isUndefined(v);

function capitalize(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.substring(1, str.length)}`;
}

function isContentAsset(part: any): part is Asset {
  return part?.sys?.type === 'Asset';
}

function isContentEntry(part: any): part is Entry<any> {
  return part?.sys?.type === 'Entry' && 'metadata' in part;
}

// Entries that have not been resolved with content type
function isBadContentEntry(part: any): part is Entry<any> {
  return part?.sys?.type === 'Link' && part?.sys?.linkType === 'Entry';
}

function isUnresolvedCrossSpaceEntry(part: any): part is Entry<any> {
  return part?.sys?.type === 'ResourceLink' && part?.sys?.linkType === 'Contentful:Entry';
}

// prepare

const defaultImageHandler = (part: Asset): ContentNode => ['img', {
  assetId: part.sys.id,
  src: part?.fields?.file?.url,
  alt: part?.fields?.description
}];

const defaultAssetMimeTypeMap: AssetMimeTypeMap = {
  'image/jpeg': defaultImageHandler,
  'image/png': defaultImageHandler,
  'image/gif': defaultImageHandler,
  'image/svg+xml': defaultImageHandler
};

/**
 *
 */
function prepareAsset(part: Asset, appAssetMimeTypeMap: AssetMimeTypeMap = {}): ContentNode | undefined {
  const assetProps = {
    assetId: part.sys.id,
    ...part.fields
  };

  const mimeType = part.fields?.file?.contentType;
  // @ts-expect-error: TODO: fix types
  const mimeTypeHandler = appAssetMimeTypeMap[mimeType] ?? defaultAssetMimeTypeMap[mimeType];

  if (!mimeTypeHandler) return ['Asset', assetProps];
  if (typeof mimeTypeHandler === 'string') return [mimeTypeHandler, assetProps];
  if (typeof mimeTypeHandler === 'function') return mimeTypeHandler(part);
  if (isContentNode(mimeTypeHandler)) {
    const [name, handlerProps] = mimeTypeHandler;
    return [name, { ...handlerProps, ...assetProps }];
  }
}

function canSkipPart(part: ContentfulPart): part is any[] | string | number {
  if (typeof part === 'string') return true;
  if (typeof part === 'number') return true;
  return false;
}

function makeDelegate(
  contentSettings: ContentfulContentSettings,
  logger: Logger
) {
  // eslint-disable-next-line max-statements
  return function delegate(part: ContentfulPart) {

    if (Array.isArray(part)) {
      // prune undefined from arrays (removes bad entries)
      return part.filter(o => isDefined(o));
    }

    if (canSkipPart(part)) return part;

    if (isContentAsset(part)) {
      return prepareAsset(part, contentSettings?.asset);
    }

    if (isContentEntry(part)) {
      const name = capitalize(part.sys.contentType.sys.id);
      const props: ComponentProps = { entryId: part.sys.id, ...part.fields };
      return [name, props] as ContentNode;
    }

    if (isRichText(part)) {
      return prepareRichText(part, contentSettings?.richText, logger);
    }

    if (isBadContentEntry(part) && !contentSettings.skipBadEntries) {
      logger.warn('contentful: entry missing content ' + JSON.stringify(part, null, 2));
      return;
    }

    if (isUnresolvedCrossSpaceEntry(part) && !contentSettings.skipCrossSpaceErrors) {
      logger.warn('contentful: unresolved cross-space reference ' + JSON.stringify(part, null, 2));
      return;
    }

    return part;
  };
}

export function toContentNodes(
  entries: Entries,
  contentSettings: ContentfulContentSettings = {},
  logger: Logger
) {
  const contentNodes = reverseTraverse(entries, makeDelegate(contentSettings, logger), PartType.props);
  return contentNodes;
}
