import type { ComponentType } from 'react';

type ManifestProps = HCSProps & WithManifestHOCProps;

type WithManifestHOCProps = {
  /** Browser window or custom target */
  target?:
  | (Window & {
    hivemind: Function;
  })
  | object;
  /** Option to not authenticate to retrieve customer detail data */
  shouldAuthenticate?: boolean;
};

declare global {
  interface Window {
    hivemind?: {
      getClient: () => Promise<unknown>;
    };
  }

  var global: Window & typeof globalThis;
}


export function withManifest<Props>(
  Component: ComponentType<Props & ManifestProps>,
  /** Configuration for wrapped component */
  options?: {
    /** Render the AccountDelegation Component or not */
    renderAccountDelegation?: boolean;
    /** Should customer state be initialized or not */
    initCustomerState?: boolean;
    /** Call the traffic initialization hook or not */
    initTraffic?: boolean;
    /** Other helper methods on header */
    additionalHeaderMethods?: Record<string, unknown>;
    /** Alternative component name (e.g. 'footer') */
    componentName?: string;
  }
): ComponentType<Props & Partial<ManifestProps>>;


type GenericGoDaddyUrls = {
  gui?: {
    href: string;
  };
  sso?: {
    exitDelegation: {
      href: string;
    };
    restoreCookie: {
      href: string;
    };
  };
};

type BlackListedBrowser = {
  browser: string;
  version: number | string;
};

/** Manifest component props. */
type HCSProps = {
  /** Collection of generic GoDaddy URLs */
  urls?: GenericGoDaddyUrls;
  /** Private label id or reseller id */
  privateLabelId?: number;
  /** Initialize traffic or not */
  traffic?: boolean;
  /** Customer's market */
  market?: string;
  /** i18n translations for components */
  messages?: Record<string, string>;
  /** Hivemind configuration */
  hivemind?: Record<string, unknown>;
  /** Should authenticate or not */
  enableHivemindProvider?: boolean;
  /** List of supported browsers */
  supportMatrix?: Record<string, unknown>;
  /** Whitelisted Browser UserAgents */
  whitelistedUserAgents?: string[];
  /** Skip to main content link configuration */
  skipToMainContentLink?: {
    id?: string;
    caption?: string;
    optionalAttributes?: Record<string, unknown>;
  };
  preset?: string;
  env?: string;
  features?: {
    accountDelegationBanner?: boolean;
  };
  /** Disable the deprecation banner or not */
  disableDeprecationBanner?: boolean;
  /** Blacklisted browsers configuration */
  blacklistedBrowsers?: BlackListedBrowser[];
};
