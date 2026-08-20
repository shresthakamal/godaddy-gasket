// @ts-nocheck -- TODO: complete these types

import { createElement } from 'react';
import PropTypes from 'prop-types';

/** @type {import('.').withPageEnhancers} */
export default function withPageEnhancers(enhancers, options = {}) {
  const { initialProps = true } = options;

  // Not sure if we can safely use a Map in all browsers. Maintain array of
  // [Page,Enhanced] pairs
  const enhancedPages = [];

  /**
   *
   * @param Page
   */
  function enhancePage(Page) {
    for (let i = 0; i < enhancedPages.length; i++) {
      const [Candidate, Enhanced] = enhancedPages[i];
      if (Candidate === Page) {
        return Enhanced;
      }
    }

    const EnhancedPage = enhancers.reduce((Component, enhancer) => {
      return enhancer(Component);
    }, Page);
    enhancedPages.push([Page, EnhancedPage]);

    return EnhancedPage;
  }

  return (App) => {
    /**
     *
     * @param root0
     * @param root0.EnhancedPage
     * @param root0.Component
     */
    function EnhancedApp({ EnhancedPage, Component, ...props }) {
      // EnhancedPage will be undefined if we're inflating from a server
      // render, since the result can't be serialized. In case of first load,
      // we'll have to enhance a second time.
      return createElement(App, { Component: EnhancedPage || enhancePage(Component), ...props });
    }

    EnhancedApp.propTypes = {
      ...App.propTypes,
      EnhancedPage: PropTypes.func
    };

    // If enhancers or pages use getInitialProps, the page must be enhanced
    // before it gets passed to the App component in order for its getInitialProps
    // to be fired for SSR.
    if (initialProps) {
      EnhancedApp.getInitialProps = async ({ Component, ...opts }) => {
        const EnhancedPage = enhancePage(Component);

        const appInitialProps = await App.getInitialProps({
          ...opts,
          Component: EnhancedPage
        });

        return {
          ...appInitialProps,
          EnhancedPage
        };
      };
    }

    return EnhancedApp;
  };
}
