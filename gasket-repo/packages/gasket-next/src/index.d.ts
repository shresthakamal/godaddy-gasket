import type { ComponentType, PropsWithChildren, ReactElement } from 'react';
import type { AppProps } from 'next/app';
import type Link from 'next/link';
import type { UrlObject } from 'url';
import type { NextComponentType, NextPageContext } from 'next';
declare type Url = string | UrlObject;

export interface AppLayoutProps {
  Page: ComponentType;
  pageProps: Record<string, any>;
  [key: string]: any;
}

export type AppComponent = ComponentType<AppProps>;
export type EnhancedPage = NextComponentType<NextPageContext, any, any>;
export type EnhancedApp = ComponentType<
  {
    EnhancedPage?: EnhancedPage;
    Component: NextComponentType<NextPageContext, any, any>;
  } & Record<string, any>
>;

export const App: AppComponent;

/**
 * Options for creating the Gasket application.
 */
interface CreateAppOptions {
  /** The layout component, default is DefaultLayout */
  Layout?: ComponentType<any>;
  /** Whether to enable React's StrictMode */
  strictMode?: boolean;
  /** Whether to wrap the page with a main landmark */
  mainRole?: boolean;
  /** Enable intl provider. Default is `true`. */
  intlProvider?: boolean;
  /** Whether to enable getInitialProps */
  initialProps?: boolean;
}

/**
 * Create the default _app component that will be used by Gasket applications.
 * @public
 */
export function createApp(
  /** Optional configuration settings. */
  options?: CreateAppOptions
): ComponentType<any>;

export function GasketApp({
  Component: ComponentType,
  ...otherProps
}): ReactElement;

export type Enhancer<A, B> = (component: ComponentType<A>) => ComponentType<B>;

/**
 * App HOC to provide a list of HOC/enhancers to apply to all pages.
 * @param enhancers - The HOCs to apply to all pages.
 * @param [options] - Optional configuration settings.
 * @param [options.initialProps] - [EXPERIMENTAL] Enable getInitialProps.
 * Default is `true`.
 * @public
 */
export function withPageEnhancers(
  enhancers: Array<Enhancer<any, any>>,
  options?: {
    initialProps?: boolean;
  }
): (Component: AppComponent) => EnhancedApp;

export interface VisitorLinkProps {
  visitorKeys?: string[];
  href: Url;
  as?: Url;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean;
  locale?: string | false;
}

export function VisitorLink(
  props: PropsWithChildren<VisitorLinkProps>
): ReactElement<Link>;

declare module '@godaddy/gasket-next' {
  /**
   * Next.js has a built-in layer that allows you to analyze and measure the
   * performance of pages using different metrics. This function is fired when
   * the final values for any of the metrics have finished calculating on the
   * page.
   */
  export function reportWebVitals(
    /** object containing id, name, startTime, value and label properties */
    metric: {
      id: string;
      name: string;
      label: string;
      startTime: number;
      value: number;
    }
  ): void;
}

declare module '@gasket/data' {
  export interface GasketData {
    visitor?: Record<string, any>;
  }
}
