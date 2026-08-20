import React, { ComponentType, PropsWithChildren } from 'react';
// @ts-expect-error missing types
import hoistNonReactStatics from 'hoist-non-react-statics';
import type { ContentParams } from '@godaddy/gasket-plugin-content';
import { AppContext } from '../types.js';

export const ContextParamsContext = React.createContext<Partial<ContentParams>>({});

export const useContentParams = () => React.useContext(ContextParamsContext);

export function ContentParamsProvider(props: PropsWithChildren<{
  contentParams?: Partial<ContentParams>
}>) {
  const { contentParams, children } = props;

  return (
    <ContextParamsContext.Provider value={{ ...contentParams }}>
      {children}
    </ContextParamsContext.Provider>
  );
}

export function withContentParamsProvider() {
  return function HOC(Component: ComponentType<PropsWithChildren<any>>) {
    function Wrapper(context: AppContext) {
      const contentParams = context?.pageProps?.params;
      return (
        <ContentParamsProvider contentParams={contentParams}>
          <Component {...context} />
        </ContentParamsProvider>
      );
    }

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withContentParamsProvider(${Component.displayName || Component.name || 'Component'})`;
    Wrapper.WrappedComponent = Component;
    return Wrapper;
  };
}
