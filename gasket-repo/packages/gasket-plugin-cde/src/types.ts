import type { RequestLike } from '@gasket/request';
import { CdeMiddlewareInitOptions } from '@cde/node-sdk';
import type { MaybeAsync } from '@gasket/core';
import { Gasket } from '@gasket/core';

/**
 * HTTP context for request handling
 */
export interface HttpContext {
  req: RequestLike;
}

/**
 * CDE plugin configuration options
 */
export interface CDEConfig {
  /** Whether to enable the CDE middleware */
  enable?: boolean;
  /**
   * CDE options
   */
  options: CdeMiddlewareInitOptions;
}

/**
 * CDE care-related identifiers
 */
export interface CDECareIdentifiers {
  /** Care conversation ID for bucketing */
  careConversationId?: string;
  /** Care UCID Jomax ID for bucketing */
  careUcidJomaxId?: string;
}

/**
 * Core CDE data identifiers
 */
export interface CDEData {
  traceId?: string;
  customerId?: string;
  visitorId?: string;
  sessionId?: string;
  shopperId?: string;
}

/**
 * Parameters that can be overridden per request via lifecycle hook
 */
export interface CdeAppEvaluationEvent extends CDEData, CDECareIdentifiers {}

// Gasket type augmentations
declare module '@gasket/core' {
  export interface GasketActions {
    sendAppEvaluationEvent(gasket: Gasket, req: RequestLike): Promise<void>;
  }

  interface GasketConfig {
    cde: CDEConfig;
  }

  interface HookExecTypes {
    appEvaluationEvent<UpdatedParams>(params: CdeAppEvaluationEvent, ctx: HttpContext): MaybeAsync<UpdatedParams>;
  }
}
