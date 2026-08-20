import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';

const { makeWithHeaderNav } = await import('../src/make-with-header-nav');

const BasicComponent = ({ text }) => (
  <div data-testid='original-content'>{text}</div>
);

const NavComponent = () => <div data-testid='header-nav'></div>;

describe('The withHeaderNav HOC', () => {
  let withHeaderNav;
  beforeEach(function () {
    withHeaderNav = makeWithHeaderNav(NavComponent);
    vi.clearAllMocks();
  });

  it('creates a new component with an injected header nav component', () => {
    const EnhancedComponent = withHeaderNav([{ caption: 'Foo', href: '/foo' }])(
      BasicComponent
    );

    const { getByTestId } = render(<EnhancedComponent text='Expected text' />);

    const content = getByTestId('original-content');
    expect(content.textContent).toBe('Expected text');

    const nav = getByTestId('header-nav');
    expect(nav).toBeDefined();
  });

  it('hoists getInitialProps', () => {
    const InitialComponent = ({ text }) => (
      <div data-testid='original-content'>{text}</div>
    );
    InitialComponent.getInitialProps = () => ({ text: 'Initial text' });

    const EnhancedComponent = withHeaderNav([{ caption: 'Foo', href: '/foo' }])(
      InitialComponent
    );

    expect(EnhancedComponent).toHaveProperty('getInitialProps', InitialComponent.getInitialProps);
  });
});
