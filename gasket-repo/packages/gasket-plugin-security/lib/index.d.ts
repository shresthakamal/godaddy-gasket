import type { Gasket, MaybeAsync } from '@gasket/core';
import type { HelmetOptions } from 'helmet';
import type { IncomingMessage, OutgoingMessage, ServerResponse } from 'http';
import type LRUCache from 'lru-cache';

export function makeMemoize(cache: LRUCache): (fn: Function) => Function;

export type HelmetConfig = Partial<helmet>;

export type CSPDirectives = Record<string, string[]>;

export interface CSPUtils {
  /**
   *
   *Create a hash value and directive for a given string.
   *Results are memoized avoid repeated unnecessary calls to crypto.
   * @param string to hash
   */
  createHash: Function;
  /**
   * Create a nonce value and formatted directive
   */
  createNonce: () => DirectiveData;
}

export interface DirectiveData {
  value: string;
  directive: string;
}

declare module '@gasket/core' {
  interface GasketConfig {
    helmet?: HelmetConfig;
  }

  export interface GasketActions {
    insertCspHash(res: OutgoingMessage, type:string, cspHash: string): void;
    addCspNonce(res: OutgoingMessage, type: string): string | undefined;
    addCspHash(res: OutgoingMessage, type:string, ...contents: string[]): void;
  }

  interface HookExecTypes {
    /** @deprecated */
    contentSecurityPolicy(
      directives: CSPDirectives,
      { req: IncomingMessage, res: OutgoingMessage },
      utils: CSPUtils
    ): MaybeAsync<CSPDirectives>;

    helmet(
      options: HelmetConfig,
      { req: IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<HelmetConfig>;
  }
}

export async function getContentSecurityPolicy(
  gasket: Gasket,
  { req: IncomingMessage, res: ServerResponse }
);

declare module 'http' {
  interface ServerResponse {
    /** @deprecated */
    addCspHash: (str: string) => void;
    /** @deprecated */
    insertCspHash: (str: string, cspHash: string) => void;
    /** @deprecated */
    addCspNonce: (type: string) => void;
  }
}

export default {
  name: '@godaddy/gasket-plugin-security',
  hooks: {}
};
