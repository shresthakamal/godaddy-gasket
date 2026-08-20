import type { Client as SwitchboardClient, ClientOptions, ClientAuthOptions } from '@switchboard/client';
import type { MaybeAsync } from '@gasket/core';
import type { GasketRequest, RequestLike } from '@gasket/request';

// Pull in the peer plugins' type augmentations of `@gasket/core` (their
// GasketConfig / GasketActions contributions). An empty type-only import loads
// a module's ambient augmentations and is fully erased at runtime — the
// `import`-style equivalent of a `/// <reference types="…" />` directive.
import type {} from '@gasket/plugin-data';
import type {} from '@gasket/plugin-redux';
import type {} from '@gasket/plugin-https';
import type {} from '@gasket/plugin-metadata';
import type {} from '@godaddy/gasket-plugin-auth';
import type {} from '@godaddy/gasket-plugin-visitor';
import type {} from '@godaddy/gasket-plugin-otel';

// Re-export for convenience so consumers can annotate `switchboard.auth`
// without a second import from `@switchboard/client`.
export type { ClientAuthOptions };

export type HttpContext = {
  req: GasketRequest,
}

/**
 * The OAuth Bearer token auth modes within {@link ClientAuthOptions}, which are
 * discriminated by their `type` field. The legacy SSO JWT modes (AWS IAM, cert,
 * cert path, delegate, and manual) do not carry a `type`.
 */
export type SwitchboardOAuthAuthOptions = Extract<ClientAuthOptions, { type: `oauth_${string}` }>;

export type SwitchboardConfig = Omit<
  ClientOptions,
  'callingService' | 'dataRetrieval'
> & {
  /** Identifier for your app to communicate to the Switchboard API */
  callingService?: string,
  /** A Switchboard app ID to fetch all settings for */
  app?: string,
  /** List of Switchboard app IDs to fetch all settings for */
  apps?: Array<string>,
  /** Array of setting keys to fetch for each app */
  appSettings?: Record<string, Array<string>>,
  /** Array of labels to retrieve by for each app */
  appLabels?: Record<string, Array<string>>,
  /** Specification for which config settings should be retrieved */
  dataRetrieval?: ClientOptions['dataRetrieval'],
  /** Per-request callback to selectively enable switchboard */
  enable?: boolean | ((context: HttpContext) => MaybeAsync<boolean>),
  /** Injects Switchboard data into `@gasket/data` */
  enableGasketData?: boolean,
  /** Injects Switchboard data into Redux state */
  enableRedux?: boolean,
  /** Hard-codes Switchboard data, bypassing the API */
  overrides?: Record<string, unknown>,
  /** Output options */
  output?: {
    /** Merge settings across all apps (default) or group by app ID */
    multiApp?: 'merge' | 'group'
  }
}

export type StandardSwitchboardParams = {
  locale?: string,
  plid?: number,
  shopperId?: string,
  visitorGuid?: string,
  visitorId?: string,
  visitGuid?: string
}

declare module '@gasket/core' {
  export interface GasketActions {
    getSwitchboardClient(): Promise<SwitchboardClient | null>;
    getSwitchboardConfig<Data = unknown>(req: RequestLike): Promise<Data>;
    getPublicSwitchboardConfig<Data = unknown>(req: RequestLike): Promise<Data>;
    getExperimentCohorts(req: RequestLike): Promise<Record<string, string>>;
  }

  export interface GasketConfig {
    switchboard?: SwitchboardConfig;
  }

  export interface HookExecTypes {
    switchboardPerRequestParams<UpdatedParams>(params: StandardSwitchboardParams, ctx: HttpContext): MaybeAsync<UpdatedParams>;
    switchboardConfigOverride<Before, After>(config: Before, ctx: HttpContext): MaybeAsync<After>;
    switchboardBrowserState<Before, After>(config: Before, ctx: HttpContext): MaybeAsync<After>;
  }
}
