import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('../../src/layout/app-router-navigation', () => {
  return {
    AppRouterNavigation: vi.fn(() => <div data-testid='header-nav'></div>)
  };
});

const { AppRouterNavigation: NavigationSpy } = await import('../../src/layout/app-router-navigation');
const { default: withHeaderNav } = await import('../../src/layout/with-header-nav');

const BasicComponent = ({ text }) => (
  <div data-testid='original-content'>{text}</div>
);

describe('The withHeaderNav HOC', () => {
  beforeEach(function () {
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

  it('interprets an array parameter as the main "bottom" navigation', () => {
    const bottomNav = [
      { caption: 'Foo', href: '/foo' },
      { caption: 'Bar', href: '/bar', eid: 'some.eid' }
    ];

    const EnhancedComponent = withHeaderNav(bottomNav)(BasicComponent);

    render(<EnhancedComponent text='Expected text' />);

    expect(NavigationSpy).toHaveBeenCalledTimes(1);
    expect(NavigationSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        bottom: bottomNav
      })
    );
  });

  it('interprets an object parameter as the navigation component props', () => {
    const nav = {
      bottom: [
        { caption: 'Foo', href: '/foo' },
        { caption: 'Bar', href: '/bar', eid: 'some.eid' }
      ],
      right: [{ caption: 'Baz', href: '/baz' }],
      side: [
        { caption: 'Foo', href: '/foo' },
        { caption: 'Bar', href: '/bar', eid: 'some.eid' },
        { caption: 'FOo Bar', href: '/foo-bar' }
      ]
    };

    const EnhancedComponent = withHeaderNav(nav)(BasicComponent);

    render(<EnhancedComponent text='Expected text' />);

    expect(NavigationSpy).toHaveBeenCalledTimes(1);
    expect(NavigationSpy.mock.calls[0][0]).toEqual(nav);
  });

  it('supports a function mapping component props to navigation props', () => {
    const EnhancedComponent = withHeaderNav(({ mountPoint }) => [
      { caption: 'Foo', href: `${mountPoint}/foo` },
      { caption: 'Bar', href: `${mountPoint}/bar`, eid: 'some.eid' }
    ])(BasicComponent);

    render(
      <EnhancedComponent
        text='Expected text'
        mountPoint='/domains'
      />
    );

    expect(NavigationSpy).toHaveBeenCalledTimes(1);
    expect(NavigationSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        bottom: [
          { caption: 'Foo', href: '/domains/foo' },
          { caption: 'Bar', href: '/domains/bar', eid: 'some.eid' }
        ]
      })
    );
  });

  it('passes activeCheck to navProps if property set', () => {
    const fakeActiveCheck = () => {
      return false;
    };
    const nav = {
      bottom: [
        { caption: 'Foo', href: '/foo' },
        { caption: 'Bar', href: '/bar', eid: 'some.eid' }
      ],
      activeCheck: fakeActiveCheck
    };

    const EnhancedComponent = withHeaderNav(nav)(BasicComponent);

    render(<EnhancedComponent text='Expected text' />);

    expect(NavigationSpy).toHaveBeenCalledTimes(1);
    expect(NavigationSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ ...nav, activeCheck: fakeActiveCheck })
    );
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
