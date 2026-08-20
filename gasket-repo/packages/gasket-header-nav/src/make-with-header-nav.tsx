import React, { type ComponentType } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import type { NavigationProps, NavigationConfig, GasketNavItemProps } from './types.js';

/**
 * Higher order component to add a header navigation to a component
 */
export function makeWithHeaderNav<P extends React.JSX.IntrinsicAttributes>(
  NavCmp: ComponentType<NavigationProps>
) {
  /**
   * Higher order component to add a header navigation to a component
   */
  return function withHeaderNav(
    config: NavigationConfig<P> | Array<GasketNavItemProps>
  ) {
    const getNavigation = typeof config === 'function' ? config : () => config;

    return (WrappedComponent: ComponentType<P>) => {
      const WithHeaderWrapper = React.memo((props: P) => {
        let navProps = getNavigation(props as P);

        if (navProps instanceof Array) {
          navProps = { bottom: navProps };
        }

        return (
          <>
            <NavCmp {...navProps} />
            <WrappedComponent {...props} />
          </>
        );
      });

      return hoistNonReactStatics(WithHeaderWrapper, WrappedComponent);
    };
  };
}
