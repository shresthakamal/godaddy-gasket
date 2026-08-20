import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { loadCookies } from './read-cookies';

/**
 * Make a HOC that adds getInitialProps to a page component to which load
 * cookies to Redux state.
 * @type {import('.').default}
 */
export default function withCookies() {
  return (Component) => {
    const Wrapper = (ownProps) => <Component { ...ownProps } />;

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withCookies(${Component.displayName || Component.name || 'Component'
    })`;

    Wrapper.getInitialProps = async (appCtx) => {
      const {
        ctx: { req, store }
      } = appCtx;
      store.dispatch(loadCookies(req, store));

      return {
        ...(Component.getInitialProps
          ? await Component.getInitialProps(appCtx)
          : {})
      };
    };

    Wrapper.WrappedComponent = Component;

    return Wrapper;
  };
}
