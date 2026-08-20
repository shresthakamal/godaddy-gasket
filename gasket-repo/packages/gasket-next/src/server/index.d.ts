import type { ReactNode } from 'react';
import type { Html, Main } from 'next/document';
import type { NextScript } from 'next/script';
import type { Head } from 'next/head';
import type { Gasket } from '@gasket/core';
import type { PCContent } from '@gasket/plugin-uxp';
import type { TrafficOptions, SignalsConfig } from '@godaddy/gasket-plugin-traffic';

export interface Visitor {
  market: string;
}

export interface PcContentData {
  hints?: {
    preconnect?: string;
    dnsprefetch?: string;
    preload?: {
      css?: string;
      fonts?: string;
      js?: string;
    };
    prefetch?: string;
  };
  assets?: {
    preload?: string;
    prefetch?: string;
    deferjs?: string;
    css?: string;
    js?: string;
  };
  globals?: string;
  header?: string;
  footer?: string;
  loaders?: string;
  browserDeprecation?: string;
  css?: string;
  js?: string;
  favicons?:
    | string
    | {
        links?: string;
      };
  config?:
    | string
    | {
        setup: object;
        hcs: object;
        hivemind: object;
        tealium: object;
      };
  components?: string;
  hydrate?: string;
  deferjs?: string;
  deprecatedDeferJs?: string;
}

export interface PresentationProps {
  pcContent: PCContent;
  visitor: Visitor;
  tccData?: TrafficOptions;
  signalsConfig?: SignalsConfig;
  traceId?: string;
  swScript?: string;
  htmlProps?: Record<string, string>;
  bodyProps?: Record<string, string>;
}

export interface PresentationConstructor {
  new (props: PresentationProps): Presentation;
}

/**
 * Get presentation props from gasket and request
 */
export type getProps = (
  gasket: Gasket,
  req: any
) => Promise<PresentationProps>;

/**
 * Presentation class for rendering document and layout
 */
export class Presentation {
  constructor(props: PresentationProps | Record<string, any>);
  props: PresentationProps;
  pcContent: PCContent;

  htmlToReact(html: string | null, options?: { trim?: boolean }): ReactNode | ReactNode[] | null;
  htmlProps(): Record<string, string>;
  bodyProps(): Record<string, string>;

  renderHintsPreconnect(): ReactNode | ReactNode[] | null;
  renderHintsDnsPrefetch(): ReactNode | ReactNode[] | null;
  renderHintsPreloadCss(): ReactNode | ReactNode[] | null;
  renderHintsPreloadFonts(): ReactNode | ReactNode[] | null;
  renderHintsPreloadJs(): ReactNode | ReactNode[] | null;
  renderPrefetchAssets(): ReactNode | ReactNode[] | null;
  renderDeferScripts(): ReactNode | ReactNode[] | null;
  renderPreloadAssets(): ReactNode | ReactNode[] | null;
  renderPreUxpCssContent(): null;
  renderPreCssContent(): null;
  renderUxpCssContent(): ReactNode | ReactNode[] | null;
  renderCssContent(): null;
  renderHeadContent(): null;
  renderPreHeaderContent(): null;
  renderHeaderContent(): ReactNode | ReactNode[] | null;
  renderPreAppContent(): null;
  renderPreFooterContent(): null;
  renderFooterContent(): ReactNode | ReactNode[] | null;
  renderPcPageContent(): ReactNode;
  renderTccInitScript(): ReactNode;
  renderPreUxpScriptsContent(): null;
  renderUxpScripts(): ReactNode | ReactNode[] | null;
  renderSWRegisterScript(): ReactNode | ReactNode[] | null;
  renderPreInitScriptsContent(): null;
  renderInitScripts(): ReactNode | ReactNode[] | null;
  renderPreUxpMountContent(): null;
  renderUxpMounts(): ReactNode | ReactNode[] | null;
  renderPreAppScriptContent(): null;
  renderMetaTraceId(): ReactNode | null;
  renderHead(): ReactNode;
  renderBodyHeader(): ReactNode;
  renderBodyFooter(): ReactNode;
  renderDocument(Html: Html, Head: Head, Main: Main, NextScript: NextScript): ReactNode;
  renderLayout(props: { children: ReactNode }): ReactNode;

  static getProps: getProps;
}

declare module 'http' {
  interface ServerResponse {
    locals?: {
      visitor?: {
        hostname?: string;
        market?: string;
      };
      trace?: {
        traceId?: string;
      };
    };
  }
}
