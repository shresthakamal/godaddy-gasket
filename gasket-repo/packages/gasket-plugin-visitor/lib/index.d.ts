import type { MaybeAsync } from '@gasket/core';

export interface Visitor {
  host: string;
  hostname: string;
  locale: string;
  market: string;
  visitorGuid: string;
  visitorId: string;
  visitGuid: string;
  sessionId: string;
  plid: number;
  currency: string;
  debug?: Record<string, string>
}

export interface VisitorPriorityConfig {
  hostname?:    Array<'x-dsa-host' | 'x-forwarded' | 'host'>;
  plid?:        Array<'query' | 'cookie' | 'hostname'>;
  market?:      Array<'cookie' | 'header' | 'query' | 'accept-language'>;
  currency?:    Array<'cookie' | 'header' | 'query'>;
  visitorGuid?: Array<'header' | 'cookie'>;
}

export interface VisitorConfig {
  debug?: boolean;
  priority?: VisitorPriorityConfig;
}

declare module '@gasket/core' {
  import { RequestLike, GasketRequest } from '@gasket/request';

  export interface GasketActions {
    getVisitor(req: RequestLike): Promise<Visitor>;
  }

  export interface HookExecTypes {
    visitor(visitor: Visitor, context: { req: GasketRequest }): MaybeAsync<Visitor>;
  }

  export interface GasketConfig {
    visitor?: VisitorConfig;
  }
}

export default {
  name: '@godaddy/gasket-plugin-visitor',
  hooks: {}
};
