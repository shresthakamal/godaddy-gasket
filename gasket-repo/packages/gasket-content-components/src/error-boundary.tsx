import React, {
  PropsWithoutRef,
  PropsWithChildren,
  ComponentType
} from 'react';

// eslint-disable-next-line no-console
const logError = (...args: any[]) => console.error(...args);

type ErrorBoundaryProps = { key: string };
type WrappedComponent<Props> = ComponentType<PropsWithoutRef<Props>>;

/**
 * Custom ErrorBoundary component. This component only catches errors client-side.
 * More details: https://reactjs.org/docs/error-boundaries.html
 */
export class ErrorBoundary extends React.Component<PropsWithChildren<ErrorBoundaryProps>> {
  state = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error) {
    logError('Error rendering component', error);
  }

  render() {
    // Do not render the child component on errors.
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

/*
 * Wraps a component with the ErrorBoundary to pass through props intended for the component.
 */
export function withErrorBoundary<Props>(
  errorBoundaryProps: ErrorBoundaryProps
) {
  return function wrapper(Component: ComponentType<Props>): WrappedComponent<Props> {
    const WrappedErrorBoundary = React.forwardRef<any, Props>((props, ref) => {
      return (
        <ErrorBoundary {...errorBoundaryProps}>
          {/* @ts-expect-error TODO: fix this */}
          <Component ref={ref} {...props} />
        </ErrorBoundary>
      );
    });

    // Format for display in DevTools
    const name = Component.displayName || Component.name || 'Unknown';
    WrappedErrorBoundary.displayName = `withErrorBoundary(${name})`;

    return WrappedErrorBoundary as WrappedComponent<Props>;
  };
}
