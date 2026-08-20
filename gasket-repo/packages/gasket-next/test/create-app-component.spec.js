/* eslint-disable max-statements */
import { vi, expect } from 'vitest';
import { createElement, Fragment } from 'react';
import PropTypes from 'prop-types';
import App from 'next/app';
import { render, screen } from '@testing-library/react';

const useRouter = vi.fn();

vi.mock('next/router', () => ({
  useRouter
}));

const retainPlidOnRoute = vi.fn();

vi.mock('../src/utils.js', () => ({
  retainPlidOnRoute
}));

const CustomLayout = vi.fn(({ Page, pageProps, ...rest }) => {
  return createElement(Fragment, null,
    createElement('header', null, 'Common header'),
    createElement(Page, { ...rest, ...pageProps }, null),
    createElement('footer', null, 'Common footer')
  );
});

const Page = vi.fn(() => createElement('div', null, ['Page']));

CustomLayout.propTypes = {
  Page: PropTypes.func,
  pageProps: PropTypes.object
};

const { mockRUM, mockStrictMode } = vi.hoisted(() => ({
  mockRUM: vi.fn().mockImplementation(({ children }) => createElement('div', { 'data-testid': 'rum-id' }, children)),
  mockStrictMode: vi.fn(({ children }) => createElement('div', { 'data-testid': 'strict-mode-id' }, children))
}));

describe('createApp creates a component that', () => {
  let createApp;
  let CustomApp;
  let mockProps;

  beforeEach(async function () {
    useRouter.mockImplementation(() => ({
      pathname: '/'
    }));

    // Mock functions defined in vi.hoisted() above

    mockProps = {
      Component: Page,
      pageProps: {
        test: 'pageProp'
      },
      router: {}
    };

    global.__NEXT_DATA__ = {
      buildId: 'adf098adfalols'
    };

    CustomLayout.getInitialProps = vi.fn();

    vi.mock('next-rum', () => ({
      default: mockRUM
    }));

    vi.mock('react', async () => {
      const actual = await vi.importActual('react');
      return {
        ...actual,
        useEffect: (f) => f(),
        StrictMode: mockStrictMode
      };
    });

    const mod = await import('../src/create-app-component');
    createApp = mod.createApp;
    CustomApp = createApp({ Layout: CustomLayout });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends RUM data to _expDataLayer', () => {
    render(createElement(CustomApp, { ...mockProps }));
    const navigated = mockRUM.mock.calls[0][0].navigated;
    const tcc = vi.fn();

    global._expDataLayer = {
      push: tcc
    };

    navigated('/foo', { foo: 'bar' });

    const pagereq = tcc.mock.calls[0][0];
    const pageperf = tcc.mock.calls[1][0];

    expect(pagereq.schema).toEqual('add_page_request');
    expect(pagereq.data).toEqual({ virtual_path: '/foo' });

    expect(pageperf.schema).toEqual('add_virtual_page_perf');
    expect(pageperf.data).toEqual({ virtual_path: '/foo', timing_metrics: { foo: 'bar' } });
  });

  it('is a functional component', () => {
    const wrapper = render(createElement(CustomApp, { ...mockProps }));
    expect(Object.getPrototypeOf(wrapper)).not.toEqual(App);
  });

  it('renders the @godaddy/gasket-rum component', () => {
    const { getByTestId } = render(createElement(CustomApp, { ...mockProps }));
    expect(getByTestId('rum-id')).toBeInTheDocument();
  });

  it('renders a custom component', () => {
    render(createElement(CustomApp, { ...mockProps }));
    expect(screen.getByText('Common header')).toBeInTheDocument();
    expect(screen.getByText('Common footer')).toBeInTheDocument();
    expect(CustomLayout.mock.calls[0][0].Page).toEqual(mockProps.Component);
    expect(CustomLayout.mock.calls[0][0].pageProps).toEqual(mockProps.pageProps);
  });

  it('contains StrictMode', () => {
    const { getByTestId } = render(createElement(CustomApp, { ...mockProps }));
    expect(getByTestId('strict-mode-id')).toBeInTheDocument();
  });

  it('StrictMode can be disabled', () => {
    vi.clearAllMocks(); // Clear any previous calls
    CustomApp = createApp({ Layout: CustomLayout, strictMode: false });
    render(createElement(CustomApp, { ...mockProps }));
    expect(mockStrictMode).not.toHaveBeenCalled();
  });

  it('contains main role', () => {
    const { container } = render(createElement(CustomApp, { ...mockProps }));
    const mainEl = container.querySelector('[role="main"][id="main"]');
    expect(mainEl).toBeInTheDocument();
  });

  it('mainRole can be disabled', () => {
    CustomApp = createApp({ Layout: CustomLayout, mainRole: false });
    const { container } = render(createElement(CustomApp, { ...mockProps }));
    const mainEl = container.querySelector('[role="main"][id="main"]');
    expect(mainEl).not.toBeInTheDocument();
  });

  it('passes all props from `getInitialProps` to the layout component', () => {
    mockProps = {
      ...mockProps,
      foo: 'bar'
    };

    render(createElement(CustomApp, { ...mockProps }));
    expect(CustomLayout.mock.calls[0][0].foo).toEqual('bar');
  });

  it('correctly passes the `getInitialProps` to the page', () => {
    CustomApp = createApp();

    mockProps = {
      ...mockProps,
      foo: 'bar'
    };

    render(createElement(CustomApp, { ...mockProps }));

    expect(Page.mock.calls[0][0].foo).toEqual('bar');
    expect(Page.mock.calls[0][0].test).toEqual('pageProp');
  });

  it('allows disabling `getInitialProps`', () => {
    CustomApp = createApp({ Layout: CustomLayout });
    expect(CustomApp).toHaveProperty('getInitialProps');

    delete CustomLayout.getInitialProps;

    CustomApp = createApp({ Layout: CustomLayout, initialProps: false });
    expect(CustomApp).not.toHaveProperty('getInitialProps');
  });

  it('hoists getInitialProps if layout has it', function () {
    // without
    delete CustomLayout.getInitialProps;
    CustomApp = createApp({ Layout: CustomLayout, initialProps: false });
    expect(CustomApp).not.toHaveProperty('getInitialProps');

    // with
    CustomLayout.getInitialProps = vi.fn();
    CustomApp = createApp({ Layout: CustomLayout, initialProps: false });
    expect(CustomApp).toHaveProperty('getInitialProps');
  });

  it('can have its getInitialProps method overridden', async () => {
    const Component = {
      getInitialProps: vi.fn(async (context) => ({
        name: 'Daenerys',
        alive: 'lol no',
        relayedContext: context
      }))
    };

    await CustomApp.getInitialProps({ Component, ctx: {} });

    expect(CustomLayout.getInitialProps).toHaveBeenCalled();
    expect(Component.getInitialProps).toHaveBeenCalled();
  });

  it('runs the component getInitialProps if it exists', async function () {
    CustomApp = createApp({ initialProps: true });
    const Component = {
      getInitialProps: async (context) => ({
        name: 'Daenerys',
        alive: 'lol no',
        relayedContext: context
      })
    };

    const initialProps = await CustomApp.getInitialProps({ Component, ctx: {} });
    const { pageProps } = initialProps;
    expect(pageProps).toHaveProperty('name');
    expect(pageProps).toHaveProperty('alive');
  });

  it('calls retainPlidOnRoute', function () {
    CustomApp = createApp();
    render(createElement(CustomApp, { ...mockProps }));
    expect(retainPlidOnRoute).toHaveBeenCalled();
  });

  describe('createApp', function () {
    it('renders default layout', () => {
      CustomApp = createApp();
      render(createElement(CustomApp, { ...mockProps }));
      expect(screen.getByText('Page')).toBeInTheDocument();
    });

    it('renders custom layout', () => {
      CustomApp = createApp({ Layout: CustomLayout });
      render(createElement(CustomApp, { ...mockProps }));
      expect(screen.getByText('Common header')).toBeInTheDocument();
      expect(screen.getByText('Common footer')).toBeInTheDocument();
      expect(screen.getByText('Page')).toBeInTheDocument();
    });

    it('allows changing options with default layout', () => {
      CustomApp = createApp({ initialProps: true });
      expect(CustomApp).toHaveProperty('getInitialProps');

      CustomApp = createApp({ initialProps: false });
      expect(CustomApp).not.toHaveProperty('getInitialProps');
    });
  });
});
