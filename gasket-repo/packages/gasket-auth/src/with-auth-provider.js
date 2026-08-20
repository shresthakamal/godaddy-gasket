import React, { useReducer } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { isBrowser } from './utils.js';
import AuthContext from './context.js';

/**
 * Give access to state in browser outside of components. This is used for
 * getInitialProps in the browser.
 * @type {import('.').AuthKeyState}
 */
export const clientAuthKeyState = {};

/**
 * Adds timestamps to keyAuthState from SSR pageProps
 * @type {import('./internal').init}
 */
export function init(authKeyState) {
  const nextState = Object.keys(authKeyState).reduce((acc, cur) => {
    acc[cur] = {
      ...authKeyState[cur],
      timestamp: Date.now()
    };

    return acc;
  }, {});

  if (isBrowser) Object.assign(clientAuthKeyState, nextState);

  return nextState;
}

/**
 * Add payload to state
 * @type {import('./internal').reducer}
 */
export function reducer(state, action) {
  const { payload } = action;
  const nextState = {
    ...state,
    ...payload
  };

  if (isBrowser) Object.assign(clientAuthKeyState, nextState);

  return nextState;
}

/**
 * Make an HOC that adds a provider with auth key state and a dispatcher. This
 * can be used to wrap a top level React or a Next.js custom App component.
 * @type {import('.').withAuthProvider}
 */
export default function withAuthProvider() {
  return (Component) => {
    /**
     * Wrapper component which sets up providers and reducer hook
     * @type {import('./internal').Wrapper}
     */
    function Wrapper(props) {
      // Support for SSR getServerSideProps or getInitialProps
      const { pageProps } = props || {};
      const { authKeyState: pageAuthKeyState } = pageProps || {};
      const [authKeyState, dispatch] = useReducer(
        reducer,
        pageAuthKeyState || {},
        init
      );
      const contextValue = { authKeyState, dispatch };

      return React.createElement(
        AuthContext.Provider,
        { value: contextValue },
        React.createElement(Component, /** @type {any} */ (props))
      );
    }

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withAuthProvider(${Component.displayName || Component.name || 'Component'
    })`;
    Wrapper.WrappedComponent = Component;

    if ('getInitialProps' in Component) {
      Wrapper.getInitialProps = Component.getInitialProps;
    }

    return Wrapper;
  };
}
