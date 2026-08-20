import { createElement, StrictMode, useEffect } from 'react';
import PropTypes from 'prop-types';
// @ts-ignore - no types
import RUM from 'next-rum';
import { useRouter } from 'next/router.js';
import { retainPlidOnRoute } from './utils.js';

/**
 * Default layout when none is provided by ours users.
 * @type {import('./internal').DefaultLayout}
 * @private
 */
export function DefaultLayout(props) {

  const { Page = props.Component, pageProps, ...rest } = props;
  return createElement(Page, { ...rest, ...pageProps });
}

/**
 * Wrap the page with main landmark
 * @type {import('./internal').Main}
 * @private
 */
export function Main({ children }) {
  return createElement('main', { role: 'main', id: 'main' }, children);
}

Main.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Sends all calculated RUM data that is gathered during a next router based
 * navigation to the Traffic2 server.
 * @type {import('./internal').navigated}
 * @private
 */
function navigated(page, perfData) {
  try {
    window._expDataLayer.push({
      schema: 'add_page_request',
      data: {
        virtual_path: page
      }
    });

    window._expDataLayer.push({
      schema: 'add_virtual_page_perf',
      data: {
        virtual_path: page,
        timing_metrics: perfData
      }
    });
  } catch {
    // eslint-disable-next-line no-console
    console.error('Failed to log page information for url %s', page);
  }
}

/**
 * Sets up and attaches the getInitialProps static method.
 *
 * Currently, we need to have `getInitialProps` here to force SSR for all pages.
 * Why? Because of our current dependence on req for Presentation Central to get
 * lang/market, UXCore2 bundles, etc. we cannot currently support pre-rendered
 * static pages for GoDaddy apps.
 * @type {import('./internal').attachGetInitialProps}
 */
function attachGetInitialProps(GasketApp, LayoutComponent) {
  /**
   * Get the initialProps that should be available on every Gasket Page.
   * @param appContext
   * @public
   */
  GasketApp.getInitialProps = async function getInitialProps(appContext) {
    /** @type {import('./internal').AppInitialProps} */
    const props = {};

    if (typeof LayoutComponent.getInitialProps === 'function') {
      Object.assign(props, await LayoutComponent.getInitialProps(appContext));
    }

    const { Component, ctx } = appContext;

    if (
      !('pageProps' in props) &&
      Component &&
      typeof Component.getInitialProps === 'function'
    ) {
      props.pageProps = await Component.getInitialProps(ctx);
    }

    return props;
  };
}

/**
 * Handles wrapper creation for the app component.
 * @type {import('./internal').createWrappers}
 */
function createWrappers(strictMode, mainRole) {
  const wrappers = [
    ...(strictMode ? [{ Wrapper: StrictMode }] : []),
    ...(mainRole ? [{ Wrapper: Main }] : []),
    {
      Wrapper: RUM.default || RUM,
      props: { navigated }
    }
  ];

  return wrappers;
}

/**
 * Renders the GasketApp component with the necessary wrappers.
 * @type {import('./internal').renderGasketApp}
 */
function renderGasketApp(Component, Layout, otherProps, wrappers) {
  return wrappers.reduce(
    (child, { Wrapper, props = {} }) =>
      createElement(Wrapper, { ...props }, child),
    createElement(Layout, {
      Component,
      Page: Component, // alias to page component
      ...otherProps
    })
  );
}

/**
 * Sets up getInitialProps for server-side rendering (SSR).
 * @type {import('./internal').setupInitialProps}
 */
function setupInitialProps(GasketApp, Layout, initialProps) {
  if (initialProps || 'getInitialProps' in Layout) {
    attachGetInitialProps(GasketApp, Layout);
  }
}

/**
 * Create the default _app component that will be used by Gasket applications.
 * @type {import('@godaddy/gasket-next').createApp}
 * @public
 */
export function createApp(
  options = {}
) {
  const {
    Layout = DefaultLayout,
    strictMode = true,
    mainRole = true,
    initialProps = false
  } = options;

  /** @type {import('./internal').GasketApp} */
  function GasketApp({ Component, ...otherProps }) {
    const router = useRouter();

    useEffect(() => {
      retainPlidOnRoute(router);
    }, [router, router.pathname]);

    const wrappers = createWrappers(strictMode, mainRole);

    return renderGasketApp(Component, Layout, otherProps, wrappers);
  }

  setupInitialProps(GasketApp, Layout, initialProps);

  return GasketApp;
}
