import '@gasket/plugin-logger';
import type { NodeTracerConfig } from '@opentelemetry/sdk-trace-node';

export interface TrafficOptions {
  /**
   * A unique name for the application which your events are originating from.
   * Typically, a page/application can be identified by its host/path.
   * This field shows up as "appName" in our AWS feeds/data stores.
   */
  'app'?: string;

  /**
   * The server that is processing the web request.
   * Not set automatically - set explicitly via the `tccData` lifecycle if needed.
   */
  'server'?: string;

  /** The HTTP status of the page */
  'status'?: string;

  /** The source code the corresponds to the page view */
  'isc'?: string;

  /**
   * The datacenter that served the page. For AWS environments, please use the format AWS-<region>, such as US-West-2.
   */
  'dcenter'?: string;

  /**
   * The source of the Traffic client's instantiation.
   * If you are loading the client via UXCore or GTM, this value will be set for you automatically.
   */
  'loadSource'?: string;

  /**
   * Set to true or to a base URL to prevent Traffic from performing navigation after clicking on a hyperlink.
   * This is handy for single page applications that need to perform their own page transitions via client routing.
   */
  'tcc.spa'?: boolean | string;

  /** The Page ID, which should be set via the CMS Page Registry. */
  'tcc.pageId'?: string;

  /** The Content Group assignment for the Page, which should be set via the CMS Page Registry. */
  'tcc.gaContentGroup'?: string;

  /** Set to true to disable the automatic perf event that is fired upon the page load complete. */
  'tcc.manualPagePerf'?: boolean;

  /** Set to true if you want the SplitIO SDK to be loaded upon the initialization of TCC. */
  'tcc.loadSplitIO'?: boolean;

  /** Set to false if you would ike to opt-out of time to interactive calculations. */
  'tcc.loadTTI'?: boolean;

  /**
   * Set the realm of the page to indicate what types of users it is for.
   * Example?: pass for productivity, idp for typical shoppers, jomax for employees.
   */
  'tcc.realm'?: string;

  /** Set the amount of time (in milliseconds) that TCC will wait before redirecting the page. */
  'tcc.eventDelayMs'?: number;

  /**
   * Controls how do TCC and Event Service writes cookie attributes for SameSite and Secure.
   * Allowed Values?: "None", "Lax", "Strict".
   */
  'tcc.cookies.sameSite'?: string;
}

interface Experiments {
  'id': string;
  'variant': string;
}

export interface SignalsConfig {
  config?: {
    experiments?: Experiments[];
  };
}

declare module '@gasket/core' {
  import type { MaybeAsync } from '@gasket/utils';
  import type { RequestLike, GasketRequest } from '@gasket/request';

  export interface HookExecTypes {
    /** @deprecated Use the `tccData` lifecycle instead. */
    trafficDataLayer(
      context: {
        req?: GasketRequest,
      }): MaybeAsync<TrafficOptions>;
    tccData(
      data: TrafficOptions,
      context: {
        req?: GasketRequest,
      }): MaybeAsync<TrafficOptions>;
    signalsConfig(
      config: SignalsConfig,
      context: {
        req?: GasketRequest;
      }): MaybeAsync<Partial<SignalsConfig>>;
  }

  export interface GasketConfig {
    traceConfig?: NodeTracerConfig;
  }

  export interface GasketActions {
    getTrafficData(req: RequestLike): Promise<TrafficOptions>;
    getSignalsConfig(req: RequestLike): Promise<SignalsConfig>;
  }
}

declare module 'express' {
  interface Response {
    setTraceIdCookie: () => void;
  }
}

export default {
  name: '@godaddy/gasket-plugin-traffic',
  hooks: {}
};

