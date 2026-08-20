/// <reference types="@testing-library/jest-dom" />

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from './helpers';
import { ErrorBoundary, withErrorBoundary } from '../src/error-boundary';

/**
 * Test component that throws an error
 */
function ThrowError(): never {
  throw new Error('Test error');
}

/**
 * Test component that renders a div with text
 */
function WorkingComponent({ text }: { text: string }): React.ReactElement {
  return <div>{text}</div>;
}

describe('ErrorBoundary', function () {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(function () {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(function () {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error', function () {
    const wrapper = render(
      <ErrorBoundary key='test'>
        <div>Content</div>
      </ErrorBoundary>
    );

    expect(wrapper.getByText('Content')).toBeInTheDocument();
  });

  it('catches errors, logs them, and renders nothing', function () {
    const wrapper = render(
      <ErrorBoundary key='test'>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(wrapper.container).toBeEmptyDOMElement();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error rendering component',
      expect.any(Error)
    );
  });
});

describe('withErrorBoundary', function () {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(function () {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(function () {
    consoleErrorSpy.mockRestore();
  });

  it('wraps component and passes props', function () {
    const Wrapped = withErrorBoundary<{ text: string }>({ key: 'test' })(
      WorkingComponent
    );
    const wrapper = render(<Wrapped text='content' />);

    expect(wrapper.getByText('content')).toBeInTheDocument();
  });

  it('sets display name from component name or displayName', function () {
    const Wrapped1 = withErrorBoundary<{ text: string }>({ key: 'test' })(
      WorkingComponent
    );

    expect(Wrapped1.displayName).toBe('withErrorBoundary(WorkingComponent)');

    const Named = WorkingComponent as typeof WorkingComponent & {
      displayName?: string;
    };

    Named.displayName = 'Custom';
    const Wrapped2 = withErrorBoundary<{ text: string }>({ key: 'test' })(
      Named
    );

    expect(Wrapped2.displayName).toBe('withErrorBoundary(Custom)');

    const NoName = (() => {
      const comp = () => <div>test</div>;

      Object.defineProperty(comp, 'name', { value: '' });

      return comp;
    })();
    const Wrapped3 = withErrorBoundary({ key: 'test' })(NoName);

    expect(Wrapped3.displayName).toBe('withErrorBoundary(Unknown)');
  });

  it('catches errors in wrapped component', function () {
    const Wrapped = withErrorBoundary({ key: 'test' })(ThrowError);
    const wrapper = render(<Wrapped />);

    expect(wrapper.container).toBeEmptyDOMElement();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('forwards refs', function () {
    const ref = React.createRef<HTMLDivElement>();
    const Component = React.forwardRef<HTMLDivElement, { text: string }>(
      (props, forwardedRef) => <div ref={forwardedRef}>{props.text}</div>
    );
    const Wrapped = withErrorBoundary<{ text: string }>({ key: 'test' })(
      Component
    ) as React.ComponentType<{
      text: string;
      ref?: React.Ref<HTMLDivElement>;
    }>;

    render(<Wrapped ref={ref} text='test' />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
