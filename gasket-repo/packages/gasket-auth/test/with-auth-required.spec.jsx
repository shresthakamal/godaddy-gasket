
/* eslint-disable no-undef */
import React from 'react';
import { render } from '@testing-library/react';

const { mockAuthRequired, mockUseAuthContext } = vi.hoisted(() => ({
  mockAuthRequired: vi.fn(),
  mockUseAuthContext: vi.fn()
}));

vi.mock('../src/client-handler', () => ({
  default: class MockClientHandler {
    constructor() {}
  }
}));
vi.mock('../src/server-handler', () => ({
  default: class MockServerHandler {
    constructor() {}
  }
}));
vi.mock('../src/auth-required', () => ({ default: mockAuthRequired }));
vi.mock('../src/context', () => ({ useAuthContext: mockUseAuthContext }));

import ClientHandler from '../src/client-handler';
import ServerHandler from '../src/server-handler';

const authReqTestId = 'auth-required';
const withAuthRequired = (await import('../src/with-auth-required')).default;

describe('withAuthRequired', () => {
  let results, mockInitialProps, MockComponent;
  let serverGetAuthState, clientGetAuthState, clientAttemptRedirect;

  beforeEach(() => {
    mockInitialProps = { bogus: 'BOGUS' };

    // Add prototype methods that can be spied upon
    ServerHandler.prototype.getAuthState = vi.fn();
    ServerHandler.prototype.attemptRedirect = vi.fn().mockResolvedValue(true);
    ClientHandler.prototype.getAuthState = vi.fn();
    ClientHandler.prototype.attemptRedirect = vi.fn().mockResolvedValue(true);

    serverGetAuthState = vi.spyOn(ServerHandler.prototype, 'getAuthState');
    clientGetAuthState = vi.spyOn(ClientHandler.prototype, 'getAuthState');
    clientAttemptRedirect = vi.spyOn(ClientHandler.prototype, 'attemptRedirect');
    mockAuthRequired.mockImplementation(props => <div data-testid={ authReqTestId }>{props.children}</div>);

    MockComponent = function () {
      return (
        <h1>Example Component</h1>
      );
    };
  });

  afterEach(() => {
    serverGetAuthState.mockReset();
    clientGetAuthState.mockReset();
    delete MockComponent.getInitialProps;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('wraps target component with <AuthRequired />', () => {
    const Wrapped = withAuthRequired({ gasket: {} })(MockComponent);
    const { getByTestId } = render(<Wrapped />);
    expect(getByTestId(authReqTestId)).toBeInTheDocument();
  });

  it('adds display name', function () {
    const Wrapped = withAuthRequired({ gasket: {} })(MockComponent);
    expect(Wrapped).toHaveProperty('displayName', 'withAuthRequired(MockComponent)');
  });

  it('exposes target component as WrappedComponent', () => {
    const Wrapped = withAuthRequired({ gasket: {} })(MockComponent);
    expect(Wrapped).toHaveProperty('WrappedComponent', MockComponent);
  });

  it('hoists non-react statics', function () {
    expect(withAuthRequired({ gasket: {} })(MockComponent)).not.toHaveProperty('bogus');
    MockComponent.bogus = 'BOGUS';
    expect(withAuthRequired({ gasket: {} })(MockComponent)).toHaveProperty('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  it('hoists getInitialProps if set', function () {
    expect(withAuthRequired({ initialProps: false, gasket: {} })(MockComponent)).not.toHaveProperty('getInitialProps');
    MockComponent.getInitialProps = f => f;
    expect(withAuthRequired({ initialProps: false, gasket: {} })(MockComponent)).toHaveProperty('getInitialProps');
    delete MockComponent.getInitialProps;
  });

  it('does not attach getInitialProps by default', function () {
    expect(withAuthRequired({})(MockComponent)).not.toHaveProperty('getInitialProps');
    expect(withAuthRequired({ initialProps: true, gasket: {} })(MockComponent)).toHaveProperty('getInitialProps');
  });

  describe('#render', function () {
    let mockHocProps;
    beforeEach(function () {
      mockHocProps = { realm: 'jomax', gasket: {} };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('wraps target component and renders children', function () {
      const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
      const { getByTestId, getByText } = render(<Wrapped bogus='BOGUS' />);
      expect(getByTestId(authReqTestId)).toBeInTheDocument();
      expect(getByText('Example Component')).toBeInTheDocument();
    });

    it('auth props are only passed to <AuthRequired />', async () => {
      mockHocProps.ssoRedirectOverride = 'redirectUrl';
      const childComponent = vi.fn(MockComponent);
      const Wrapped = withAuthRequired(mockHocProps)(childComponent);
      await render(<Wrapped bogus='BOGUS' />);

      expect(childComponent.mock.calls[0][0]).not.toHaveProperty('realm');
      expect(mockAuthRequired.mock.calls[0][0]).toHaveProperty('realm', 'jomax');
      expect(mockAuthRequired.mock.calls[0][0]).toHaveProperty('ssoRedirectOverride', 'redirectUrl');
    });

    it('component props are only passed to wrapped component', () => {
      const childComponent = vi.fn(MockComponent);
      const Wrapped = withAuthRequired(mockHocProps)(childComponent);
      render(<Wrapped bogus='BOGUS' />);
      expect(mockAuthRequired.mock.calls[0][0]).not.toHaveProperty('bogus', 'BOGUS');
      expect(childComponent.mock.calls[0][0]).toHaveProperty('bogus', 'BOGUS');
    });

    it('injects details by default', function () {
      const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
      render(<Wrapped bogus='BOGUS' />);
      expect(mockAuthRequired.mock.calls[0][0]).toHaveProperty('injectDetails', true);
    });

    it('injects details can be disabled', function () {
      mockHocProps.injectDetails = false;
      const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
      render(<Wrapped bogus='BOGUS' />);
      expect(mockAuthRequired.mock.calls[0][0]).toHaveProperty('injectDetails', false);
    });

    it('null if redirecting', function () {
      const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
      const { container } = render(<Wrapped isRedirecting={ true } />);
      expect(container.innerHTML).toBeFalsy();
    });

    describe('getInitialProps in browser', function () {
      let authKeyState, dispatch, mockInitProps;

      beforeEach(function () {
        authKeyState = {};
        dispatch = vi.fn();
        mockUseAuthContext.mockImplementation(() => ({ authKeyState, dispatch }));
        mockInitProps = {
          isBrowser: true,
          authKeyState: {
            'realm=jomax': {
              valid: true
            },
            '__default__': {
              valid: false
            }
          }
        };
      });

      it('dispatches authState', async function () {
        const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
        render(<Wrapped { ...mockInitProps } />);
        expect(dispatch).toHaveBeenCalledWith({ payload: { 'realm=jomax': { valid: true } } });
      });

      it('does not dispatch if existing authState in context', function () {
        const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
        authKeyState['realm=jomax'] = { exists: true };
        render(<Wrapped { ...mockInitProps } />);
        expect(dispatch).not.toHaveBeenCalled();
      });

      it('does not dispatch if no initial authState', function () {
        const Wrapped = withAuthRequired({ realm: 'idp', gasket: {} })(MockComponent);
        render(<Wrapped { ...mockInitProps } />);
        expect(dispatch).not.toHaveBeenCalled();
      });

      it('dispatches __default__ authState for default auth props', async function () {
        const Wrapped = withAuthRequired({ gasket: {} })(MockComponent);
        render(<Wrapped { ...mockInitProps } />);
        expect(dispatch).toHaveBeenCalledWith({ payload: { __default__: { valid: false } } });
      });

      it('does not dispatch if existing __default__ authState in context', function () {
        const Wrapped = withAuthRequired({ gasket: {} })(MockComponent);
        authKeyState.__default__ = { exists: true };
        render(<Wrapped { ...mockInitProps } />);
        expect(dispatch).not.toHaveBeenCalled();
      });

      it('renders loading indicator when dispatching', function () {
        mockHocProps.loading = 'loading!';
        const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
        const { container } = render(<Wrapped { ...mockInitProps } />);
        expect(container.innerHTML).toEqual('loading!');
      });

      it('renders null if no loading indicator when dispatching', function () {
        const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
        const { container } = render(<Wrapped { ...mockInitProps } />);
        expect(container.innerHTML).toBeFalsy();
      });

      it('renders AuthRequired if authState in context', function () {
        const Wrapped = withAuthRequired(mockHocProps)(MockComponent);
        authKeyState['realm=jomax'] = { exists: true };
        const { getByTestId } = render(<Wrapped { ...mockInitProps } />);
        expect(getByTestId(authReqTestId)).toBeInTheDocument();
      });
    });
  });

  describe('#getInitialProps', () => {
    let Wrapped;

    beforeEach(function () {
      Wrapped = withAuthRequired({
        realm: 'idp',
        initialProps: true,
        gasket: {
          actions: {
            getCheckAuth: vi.fn(),
            getVisitor: vi.fn().mockResolvedValue({ hostname: 'localhost' }),
            getPresentationCentral: vi.fn().mockResolvedValue({ data: {} }),
            getPublicGasketData: vi.fn().mockResolvedValue({})
          }
        }
      })(MockComponent);
    });

    it('uses server handler for SSR', async () => {
      serverGetAuthState.mockResolvedValue({});
      results = await Wrapped.getInitialProps({
        req: {},
        res: {
          setHeader: vi.fn(),
          writeHead: vi.fn(),
          end: vi.fn()
        }
      });
      expect(serverGetAuthState).toHaveBeenCalled();
      expect(clientGetAuthState).not.toHaveBeenCalled();
    });

    it('uses client handler for Browser', async () => {
      clientGetAuthState.mockResolvedValue({});
      results = await Wrapped.getInitialProps({});
      expect(serverGetAuthState).not.toHaveBeenCalled();
      expect(clientGetAuthState).toHaveBeenCalled();
    });

    it('returns isBrowser when run in client', async () => {
      clientGetAuthState.mockResolvedValue({});
      results = await Wrapped.getInitialProps({});
      expect(results).toHaveProperty('isBrowser');
    });

    it('prevents caching', async () => {
      serverGetAuthState.mockResolvedValue({ valid: true });
      const res = { setHeader: vi.fn(), writeHead: vi.fn() };
      results = await Wrapped.getInitialProps({
        req: {},
        res
      });

      expect(res.setHeader).toHaveBeenCalledWith(
        'cache-control',
        'no-cache, must-revalidate, no-store');
    });

    it('calls getInitialProps on wrapped component', async () => {
      MockComponent.getInitialProps = vi.fn().mockResolvedValue(mockInitialProps);
      Wrapped = withAuthRequired({ realm: 'idp', gasket: {} })(MockComponent);
      clientGetAuthState.mockResolvedValue({});
      clientAttemptRedirect.mockResolvedValue(false);
      results = await Wrapped.getInitialProps({});
      expect(MockComponent.getInitialProps).toHaveBeenCalled();
    });

    it('returns getInitialProps results from wrapped component', async () => {
      MockComponent.getInitialProps = vi.fn().mockResolvedValue(mockInitialProps);
      Wrapped = withAuthRequired({ realm: 'idp', gasket: {} })(MockComponent);
      clientGetAuthState.mockResolvedValue({});
      clientAttemptRedirect.mockResolvedValue(false);
      results = await Wrapped.getInitialProps({});
      expect(results).toEqual(expect.objectContaining(mockInitialProps));
    });

    it('returns empty object if no child getInitialProps', async () => {
      clientGetAuthState.mockResolvedValue({});
      results = await Wrapped.getInitialProps({});
      expect(results).not.toEqual(expect.objectContaining(mockInitialProps));
    });

    it('merges authStateKeys', async () => {
      ClientHandler.prototype.authKey = 'risk=medium';
      ClientHandler.prototype.getAuthState = vi.fn().mockResolvedValue({ valid: false });

      mockInitialProps.authKeyState = {
        'risk=low': {
          valid: true
        }
      };
      MockComponent.getInitialProps = vi.fn().mockResolvedValue(mockInitialProps);

      Wrapped = withAuthRequired({ risk: 'medium', gasket: {} })(MockComponent);
      clientAttemptRedirect.mockResolvedValue(false);
      results = await Wrapped.getInitialProps({});

      expect(results).toEqual({
        bogus: 'BOGUS',
        isBrowser: true,
        authKeyState: {
          'risk=low': {
            valid: true
          },
          'risk=medium': {
            valid: false
          }
        }
      });
    });
  });
});
