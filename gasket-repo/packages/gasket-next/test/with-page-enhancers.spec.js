import { expect } from 'vitest';
import { render } from '@testing-library/react';
import { createElement } from 'react';

import NextApp from 'next/app';
import withPageEnhancers from '../src/with-page-enhancers';

describe('The withPageEnhancers HOC', () => {
  let EnhancedApp;

  class App extends NextApp {
    render() {
      const { Component, pageProps } = this.props;
      return (
        createElement('div', { id: 'some-wrapper' },
          createElement(Component, { ...pageProps })
        )
      );
    }
  }

  const withAllCaps = Component => {
    const Enhanced = ({ text, ...props }) => {
      const newText = text.toUpperCase();
      return createElement(Component, { text: newText, ...props });
    };
    Enhanced.getInitialProps = Component.getInitialProps;
    return Enhanced;
  };

  beforeEach(function () {
    EnhancedApp = withPageEnhancers([withAllCaps])(App);
  });

  it('creates a new App that enhances page components', async () => {
    const Page = ({ text }) => createElement('div', { id: 'page-content', text });
    const initProps = await EnhancedApp.getInitialProps({
      Component: Page,
      ctx: {}
    });

    const { container } = render(createElement(EnhancedApp, {
      ...initProps,
      router: {},
      pageProps: { text: 'Hello, world!' }
    }));

    const wrapper = container.querySelector('#some-wrapper');
    expect(wrapper).toBeInTheDocument();

    expect(container.innerHTML).toContain('HELLO, WORLD!');
  });

  it('returns the EnhancedPage with getInitialProps', async () => {
    const Page = ({ text }) => createElement('div', { id: 'page-content', text });

    const initProps = await EnhancedApp.getInitialProps({
      Component: Page,
      ctx: {}
    });

    expect(initProps).toHaveProperty('EnhancedPage');
    expect(initProps).not.toHaveProperty('Component');
  });

  it('getInitialProps can be disabled', async () => {
    EnhancedApp = withPageEnhancers([withAllCaps], { initialProps: false })(App);
    expect(EnhancedApp).not.toHaveProperty('getInitialProps');
  });

  it('preserves the getInitialProps of the page component', async () => {
    const Page = ({ text }) => createElement('div', { id: 'page-content', text });
    Page.getInitialProps = () => ({ text: 'Hello, world!' });

    const initProps = await EnhancedApp.getInitialProps({
      Component: Page,
      ctx: {}
    });

    expect(initProps).toHaveProperty('pageProps', { text: 'Hello, world!' });
  });

  it('caches the enhanced page component to avoid remounts', async () => {
    const Page = ({ text }) => createElement('div', { id: 'page-content', text });

    /**
     *
     */
    async function getPageWrapper() {
      const initProps = await EnhancedApp.getInitialProps({
        Component: Page,
        ctx: {}
      });
      const { container } = render(
        createElement(EnhancedApp, {
          ...initProps,
          router: {},
          pageProps: { text: 'Hello, world!' }
        })
      );
      return container.querySelector('#some-wrapper').firstChild;
    }

    const [Component1, Component2] = await Promise.all([
      getPageWrapper(), getPageWrapper()
    ]);

    expect(Component1).toEqual(Component2);
  });
});
