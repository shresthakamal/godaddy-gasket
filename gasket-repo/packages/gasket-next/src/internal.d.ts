import type { NextRouter } from 'next/router';
import type { AppContext, AppProps } from 'next/app';
import type { ComponentType, ReactElement, FC } from 'react';
import type { AppLayoutProps } from '@godaddy/gasket-next';

/**
 * Add plid to the current route
 * @param router
 */
export function retainPlidOnRoute(router: NextRouter): void;

export interface GasketAppProps {
  Component: ComponentType<any>;
  pageProps?: Record<string, any>;
  [key: string]: any;
}

export interface GasketAppInitialProps {
  pageProps?: Record<string, any>;
}

export interface LayoutProps extends GasketAppProps {
  Component: ComponentType<any>;
}

export type DefaultLayout = (props: LayoutProps) => ReactElement;

export interface PerformanceData {
  [key: string]: any;
}

export type navigated = (
  /** The path of the new URL that we just loaded */
  page: string,
  /** The RUM data that was collected during the page load */
  perData: PerformanceData
) => void;

export interface MainProps {
  children: ReactElement;
}

export type Main = (props: MainProps) => ReactElement;

/**
 * Type for Next.js components with getInitialProps.
 */
interface GasketAppComponent extends FC<AppProps> {
  getInitialProps?: (context: AppContext) => Promise<any>;
}

interface LayoutComponent extends ComponentType<AppLayoutProps> {
  getInitialProps?: (context: AppContext) => Promise<any>;
}

export type attachGetInitialProps = (
  GasketApp: ComponentType<any> & {
    getInitialProps?: (context: AppContext) => Promise<any>;
  },
  LayoutComponent: ComponentType<any> & {
    getInitialProps?: (context: AppContext) => Promise<any>;
  }
) => void;

interface WrapperData {
  Wrapper: ComponentType<any>;
  props?: Record<string, any>;
}

export type createWrappers = (
  /** Whether to include StrictMode wrapper. */
  strictMode: boolean,
  /** Whether to include Main wrapper. */
  mainRole: boolean
) => WrapperData[];

export type renderGasketApp = (
  /** The page component to render. */
  Component: ComponentType<any>,
  /** The layout component to wrap around the page. */
  Layout: ComponentType<any>,
  /** Any other props passed to the layout. */
  otherProps: Record<string, any>,
  /** Array of wrappers to wrap around the layout. */
  wrappers: WrapperData[]
) => ReactElement;

export type setupInitialProps = (
  GasketApp: ComponentType<any>,
  Layout: ComponentType<any>,
  initialProps: boolean
) => void;

/**
 * Defines the structure for the GasketApp function.
 * @param root0
 * @param root0.Component
 */
export declare function GasketApp({
  Component,
  ...otherProps
}: {
  Component: FC<any>;
  [key: string]: any;
}): ReactElement;

export type AppInitialProps = {
  pageProps?: Record<string, any>;
};

declare global {
  interface Window {
    _expDataLayer: Array<{
      schema: string;
      data: {
        virtual_path: string;
        timing_metrics?: any;
      };
    }>;
  }
}
