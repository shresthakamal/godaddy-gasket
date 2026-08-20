import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket } from '@gasket/core';
import type { ContentNode } from '@godaddy/gasket-content-nodes';

export interface ContentParams {
  plid: number
  market: string
  currency: string
}

export interface ContentContext {
  req?: IncomingMessage
  res?: OutgoingMessage & { locals: Record<string, any> }
  params?: ContentParams
  enableSnapshots?: boolean
}

export interface TransformSnapshot {
  name: string
  transformedAt?: string
  contentNodes: ContentNode[] | null
}

export interface ContentDebug {
  snapshots?: TransformSnapshot[]
  [key: string]: any
}

export interface ContentData {
  contentNodes: ContentNode[] | null,
  debug: ContentDebug
}

export type ContentTransformHandler = (
  gasket: Gasket,
  contentNodes: ContentNode[] | null,
  context: ContentContext
) => ContentNode[] | null | Promise<ContentNode[] | null>;

export type ContentTransform = {
  name: string;
  handler: ContentTransformHandler;
};

declare module '@gasket/core' {
  export interface GasketActions {
    getTransformedContent: (
      transforms: ContentTransform[],
      contentData: ContentData,
      context: ContentContext
    ) => any
  }
  export interface HookExecTypes {
    contentTransform: (contentNodes: ContentNode[], context: ContentContext) => any
  }
}
