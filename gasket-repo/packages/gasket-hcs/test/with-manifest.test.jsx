import { describe, it, expect, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react'; // Use render method from RTL
import AccountDelegation from '@ux/account-delegation';
import SkipNavigation from '@ux/skip-navigation';
import BrowserDeprecationBanner from '@ux/browser-deprecation-banner';
import * as utils from '@ux/header-util';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { useIntl } from '@godaddy/react-mintl';

vi.mock('@ux/skip-navigation', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('@ux/browser-deprecation-banner', () => ({ __esModule: true, default: vi.fn() }));

import withManifest from '../src/with-manifest.jsx';

const DummyComponent = () => <h1>hello world</h1>;
const DummyComponentWithCustomer = ({ customer }) => <h1>{customer.loggedIn ? 'logged in' : 'logged out'}</h1>;

vi.mock('@ux/header-util', async () => {
  const React = await import('react');

  class ErrorBoundary extends React.default.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error) { this.props.onError?.(error); }
    render() { return this.state.hasError ? null : this.props.children; }
  }

  return {
    useCustomerDetails: vi.fn(),
    useOrderDetails: vi.fn(),
    usePageConfig: vi.fn(),
    useHivemind: vi.fn(),
    useTraffic: vi.fn(),
    events: {
      emit: vi.fn(),
      once: vi.fn()
    },
    url: {
      fixGuiUrl: vi.fn((url) => url)
    },
    default: vi.fn(),
    ErrorBoundary
  };
});
const accDelTestid = 'account-delegation';
vi.mock('@ux/account-delegation', () => {
  return {
    __esModule: true,
    default: () => <div data-testid={ accDelTestid }></div>
  };
});

const defaultProps = {
  messages: {},
  market: 'en-US',
  urls: {
    gui: {
      href: ''
    },
    sso: {
      exitDelegation: { href: 'www.test.com' },
      restoreCookie: { href: 'www.cookietest.com' }
    }
  },
  supportMatrix: {},
  features: {
    accountDelegationBanner: true
  },
  skipToMainContentLink: { caption: 'here is a caption' }
};

describe('withManifest', () => {
  beforeAll(function () {
    vi.spyOn(global.console, 'error').mockImplementation(() => {});
  });

  beforeEach(function () {
    // Restore default implementations after vi.resetAllMocks clears them
    vi.mocked(SkipNavigation).mockImplementation(
      ({ text, skipToId, ...rest }) => React.createElement('a', { href: `#${skipToId}`, ...rest }, text)
    );
    vi.mocked(BrowserDeprecationBanner).mockReturnValue(null);
  });

  afterEach(function () {
    vi.resetAllMocks();
  });

  it('will render the component', () => {
    const Wrapper = withManifest(DummyComponent);

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('hello world');
    expect(utils.events.emit).toHaveBeenCalledTimes(4);
  });

  it('will render the SkipNavigation component', () => {
    const Wrapper = withManifest(DummyComponent);

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('here is a caption');
  });

  it('will use the formatted message string if caption not provided', () => {
    const Wrapper = withManifest(DummyComponent);


    const modifiedProps = { ...defaultProps, skipToMainContentLink: { caption: null },
      messages: { 'Shared:Common:SkipToMainContent': 'Skip to main content' } };

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...modifiedProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('Skip to main content');
  });

  it('will render the SkipNavigation component with optional attributes', () => {
    const Wrapper = withManifest(DummyComponent);
    const props = {
      ...defaultProps,
      skipToMainContentLink: {
        caption: 'here is a new caption',
        optionalAttributes: {
          'data-attribute-name': 'data-attribute-value'
        }
      }
    };

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...props } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('here is a new caption');
    expect(container.innerHTML).toContain('data-attribute-name="data-attribute-value"');
  });

  it('will not render the SkipNavigation component for footers', () => {
    const Wrapper = withManifest(DummyComponent, { componentName: 'footer' });

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).not.toContain('here is a caption');
  });

  it('will render the AccountDelegation component', () => {
    // stub AccountDelegation.active to true
    AccountDelegation.active = true;

    vi.mocked(utils.useCustomerDetails).mockReturnValue({ customer: { customer: true } });

    const Wrapper = withManifest(DummyComponent, {
      initCustomerState: true,
      renderAccountDelegation: true,
      componentName: 'notheader'
    });

    const { getByTestId } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(getByTestId(accDelTestid)).toBeInTheDocument();
  });

  it('will NOT render the AccountDelegation component when renderAccountDelegation is false', () => {
    vi.mocked(utils.useCustomerDetails).mockReturnValue({ customer: { customer: true } });

    const Wrapper = withManifest(DummyComponent, {
      initCustomerState: true,
      renderAccountDelegation: false,
      componentName: 'notheader'
    });

    const { queryByTestId } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(queryByTestId(accDelTestid)).not.toBeInTheDocument();
  });

  it('will NOT render the AccountDelegation component when preset = internal-header', () => {
    vi.mocked(utils.useCustomerDetails).mockReturnValue({ customer: { customer: true } });

    const Wrapper = withManifest(DummyComponent, {
      initCustomerState: true,
      renderAccountDelegation: true,
      componentName: 'notheader'
    });

    defaultProps.preset = 'internal-header';
    const { queryByTestId } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(queryByTestId(accDelTestid)).not.toBeInTheDocument();
  });

  it('will call useCustomerDetails', () => {
    const Wrapper = withManifest(DummyComponent, { initCustomerState: true });

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('hello world');
  });

  it('will pass loggedin value in customer prop as true to wrapped component when account delegation is active and there is a customer present', () => {
    // stub AccountDelegation.active to true
    AccountDelegation.active = true;

    vi.mocked(utils.useCustomerDetails).mockReturnValue({ loggedIn: false, customer: {} });

    const Wrapper = withManifest(DummyComponentWithCustomer, { initCustomerState: true, renderAccountDelegation: true });

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('logged in');
  });

  it('will pass loggedin value in customer prop as false to wrapped component when account delegation is active but there is no customer', () => {
    // stub AccountDelegation.active to true
    AccountDelegation.active = true;
    vi.mocked(utils.useCustomerDetails).mockReturnValue({ });

    const Wrapper = withManifest(DummyComponentWithCustomer, { initCustomerState: true, renderAccountDelegation: true });

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('logged out');
  });

  it('will pass loggedin value in customer prop as false to wrapped component when account delegation is not active', () => {
    // stub AccountDelegation.active to false
    AccountDelegation.active = false;

    vi.mocked(utils.useCustomerDetails).mockReturnValue({ loggedIn: false, customer: {} });

    const Wrapper = withManifest(DummyComponentWithCustomer, { initCustomerState: true, renderAccountDelegation: true });

    const { container } = render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(container.innerHTML).toContain('logged out');
  });

  it('will perform a navbar update', () => {
    const dummyComponentMock = vi.fn(DummyComponent);
    const Wrapper = withManifest(dummyComponentMock);

    render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    const dummycomponentProps = dummyComponentMock.mock.calls[0][0];

    act(() => {
      dummycomponentProps.headerMethods.updateNavigation([{
        caption: 'cheese',
        href: 'https://godaddy.com'
      }], false, true);

      expect(utils.events.emit).toHaveBeenCalled();
    });

  });

  it('will perform a navbar right update with function', () => {
    const dummyComponentMock = vi.fn(DummyComponent);
    const Wrapper = withManifest(dummyComponentMock);

    render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    const dummycomponentProps = dummyComponentMock.mock.calls[0][0];

    act(() => {
      dummycomponentProps.headerMethods.updateNavigation(
        [{ caption: 'cheese', href: 'https://godaddy.com' }], () => {
        }, true);

      expect(utils.events.emit).toHaveBeenCalled();
    });
  });

  it('will perform a navbar right update with out function', () => {
    const dummyComponentMock = vi.fn(DummyComponent);
    const Wrapper = withManifest(dummyComponentMock);

    render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    const dummycomponentProps = dummyComponentMock.mock.calls[0][0];

    act(() => {
      dummycomponentProps.headerMethods.updateNavigation([{
        caption: 'cheese',
        href: 'https://godaddy.com'
      }], true, true);

      expect(utils.events.emit).toHaveBeenCalled();
    });
  });

  it('will dispatch mount header events by default', () => {
    const Wrapper = withManifest(DummyComponent);
    render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(utils.events.emit).toHaveBeenNthCalledWith(3, 'mount', 'header', expect.anything());
    expect(utils.events.emit).toHaveBeenNthCalledWith(4, 'mount:header', expect.anything());
  });

  it('will dispatch mount alternative events based on componentName', () => {
    const Wrapper = withManifest(DummyComponent, { componentName: 'footer' });
    render(
      <IntlProvider locale='en'>
        <Wrapper { ...defaultProps } />
      </IntlProvider>
    );

    expect(utils.events.emit).toHaveBeenNthCalledWith(3, 'mount', 'footer', expect.anything());
    expect(utils.events.emit).toHaveBeenNthCalledWith(4, 'mount:footer', expect.anything());
  });

  describe('useCustomerDetails', () => {
    beforeAll(() => {
      // Reset the mock before tests
      vi.mocked(utils.url.fixGuiUrl).mockClear();
    });

    afterAll(() => {
      // Restore default behavior after tests
      vi.mocked(utils.url.fixGuiUrl).mockImplementation((url) => url);
    });

    it('will call useCustomerDetails with fixed gui url', () => {
      const spy = vi.fn();
      vi.mocked(utils.useCustomerDetails).mockImplementation(spy);
      const Wrapper = withManifest(DummyComponent, { initCustomerState: true });
      defaultProps.urls.gui.href = 'https://www.godaddy.com';

      const replacedGuiUrl = 'https://www.replacedUrl.com';
      vi.mocked(utils.url.fixGuiUrl).mockReturnValue(replacedGuiUrl);

      render(
        <IntlProvider locale='en'>
          <Wrapper { ...defaultProps } privateLabelId={ 1 } preset={ 'some-preset' }/>
        </IntlProvider>
      );

      expect(utils.url.fixGuiUrl).toHaveBeenCalledWith('https://www.godaddy.com');

      expect(spy).toHaveBeenCalledWith(replacedGuiUrl, {
        shouldAuthenticate: true,
        privateLabelId: 1,
        preset: 'some-preset',
        initCustomerState: true
      });
    });
  });

  it('provides @godaddy/react-mintl intl context to the wrapped component', () => {
    // Verifies withManifest wraps with @godaddy/react-mintl IntlProvider so child
    // components can call useIntl() without their own provider.
    const testMessages = { 'Test:Key': 'Hello from mintl' };
    let capturedMessage = null;

    const IntlConsumer = () => {
      const intl = useIntl();
      capturedMessage = intl.formatMessage({ id: 'Test:Key' });
      return <span>{ capturedMessage }</span>;
    };

    const Wrapper = withManifest(IntlConsumer);
    const { container } = render(
      <Wrapper { ...defaultProps } messages={ testMessages } market='en-US' />
    );

    expect(container.textContent).toContain('Hello from mintl');
    expect(capturedMessage).toBe('Hello from mintl');
  });

  describe('error boundaries', () => {
    beforeEach(function () {
      vi.spyOn(global.console, 'error').mockImplementation(() => {});
    });

    it('renders the header when SkipNavigation throws', () => {
      vi.mocked(SkipNavigation).mockImplementation(() => {
        throw new Error('chunk load failed');
      });

      const Wrapper = withManifest(DummyComponent);
      const { container } = render(
        <IntlProvider locale='en'>
          <Wrapper { ...defaultProps } />
        </IntlProvider>
      );

      expect(container.innerHTML).toContain('hello world');
    });

    it('renders the header when BrowserDeprecationBanner throws', async () => {
      vi.mocked(BrowserDeprecationBanner).mockImplementation(() => {
        throw new Error('chunk load failed');
      });

      const Wrapper = withManifest(DummyComponent);
      const { container } = render(
        <IntlProvider locale='en'>
          <Wrapper { ...defaultProps } />
        </IntlProvider>
      );

      // Wait for the lazy import to resolve and the component to attempt render
      await waitFor(() => {
        expect(container.innerHTML).toContain('hello world');
      });
    });
  });
});
