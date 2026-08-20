/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import AuthRequired from './auth-required.js';
import { useAuthContext } from './context.js';
import { createAuthStateAction, getAuthKey } from './utils.js';
import { attachGetInitialProps } from './get-initial-props.js';

/**
 * HOC which wraps component with AuthRequired. Details are injected and the
 * getInitialProps method is attached by default.
 *
 * Using getInitialProps is more performant than getServerSideProps for page
 * transitions in the browser. Although it is most preferred, if you need to use
 * getServerSideProps for a page, you can disable getInitialProps from the HOC
 * in the options ({initialProps: false}).
 * @type {import('.').withAuthRequired}
 */
export default function withAuthRequired(hocProps) {
  const {
    initialProps = false, injectDetails = true, gasket, ...authProps
  } = hocProps || {};
  const authKey = getAuthKey(authProps);

  return (Component) => {
    const Wrapper = (ownProps) => {
      const {
        authKeyState: pageAuthKeyState,
        isBrowser,
        isRedirecting,
        ...props
      } = ownProps;

      // Avoid repeat-redirect from AuthRequired
      if (isRedirecting) return null;

      // If we ran getInitialProps in the browser then we need to fix up our
      // auth context
      if (isBrowser) {
        const initAuthState = pageAuthKeyState[authKey];
        const { authKeyState, dispatch } = useAuthContext();

        // Dispatch the state so we have it in our store
        if (isBrowser && !authKeyState[authKey]) {
          // useEffect avoids cannot update a component while rendering a
          // different component
          if (initAuthState) {
            useEffect(() => {
              dispatch(createAuthStateAction(authKey, initAuthState));
            });
          }

          return authProps.loading || null;
        }
      }

      return React.createElement(
        AuthRequired,
        { ...authProps, injectDetails },
        React.createElement(Component, { ...props }));
    };

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withAuthRequired(${Component.displayName || Component.name || 'Component'
    })`;
    Wrapper.WrappedComponent = Component;

    if (initialProps || 'getInitialProps' in Component) {
      if (!gasket) {
        throw new Error('gasket instance is required to attach getInitialProps');
      }

      attachGetInitialProps(Wrapper, { gasket, ...authProps });
    }

    return Wrapper;
  };
}
