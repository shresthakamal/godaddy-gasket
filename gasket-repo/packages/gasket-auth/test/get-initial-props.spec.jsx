
/* eslint-disable no-undef */
import React from 'react';

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
vi.mock('../src/auth-required', () => ({ default: vi.fn().mockImplementation((props) => props.children) }));

import ClientHandler from '../src/client-handler';
import ServerHandler from '../src/server-handler';
import * as AuthContext from '../src/context';

const authGetInitialProps = (await import('../src/get-initial-props')).default;
const proxy = { ...AuthContext };


// eslint-disable-next-line max-statements
describe('authGetInitialProps', () => {
  let Attached, mockGasket;
  let results, mockInitialProps, MockComponent;
  let serverGetAuthState, clientGetAuthState, serverAttemptRedirect, clientAttemptRedirect, useAuthContextSpy;

  beforeEach(() => {
    mockGasket = {
      actions: {
        getVisitor: vi.fn().mockResolvedValue({ hostname: 'localhost' }),
        getPresentationCentral: vi.fn().mockResolvedValue({ data: {} }),
        getPublicGasketData: vi.fn().mockResolvedValue({})
      }
    };
    mockInitialProps = { bogus: 'BOGUS' };

    // Add prototype methods that can be spied upon
    ServerHandler.prototype.getAuthState = vi.fn();
    ServerHandler.prototype.attemptRedirect = vi.fn().mockResolvedValue(true);
    ClientHandler.prototype.getAuthState = vi.fn();
    ClientHandler.prototype.attemptRedirect = vi.fn().mockResolvedValue(true);

    serverGetAuthState = vi.spyOn(ServerHandler.prototype, 'getAuthState');
    clientGetAuthState = vi.spyOn(ClientHandler.prototype, 'getAuthState');
    serverAttemptRedirect = vi.spyOn(ServerHandler.prototype, 'attemptRedirect');
    clientAttemptRedirect = vi.spyOn(ClientHandler.prototype, 'attemptRedirect');
    useAuthContextSpy = vi.spyOn(proxy, 'useAuthContext');

    MockComponent = function () {
      return (
        <h1>Example Component</h1>
      );
    };

    Attached = authGetInitialProps({ realm: 'idp', gasket: mockGasket })(MockComponent);
  });

  afterEach(() => {
    serverGetAuthState.mockReset();
    clientGetAuthState.mockReset();
    serverAttemptRedirect.mockReset();
    clientAttemptRedirect.mockReset();
    useAuthContextSpy.mockReset();
    delete MockComponent.getInitialProps;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('attaches getInitialProps to component', async () => {
    const Component = {};
    authGetInitialProps()(Component);
    expect(Component).toHaveProperty('getInitialProps', expect.any(Function));
  });

  it('uses server handler for SSR', async () => {
    serverGetAuthState.mockResolvedValue({ valid: true });
    results = await Attached.getInitialProps({ req: {} });
    expect(serverGetAuthState).toHaveBeenCalled();
    expect(clientGetAuthState).not.toHaveBeenCalled();
  });

  it('uses client handler for Browser', async () => {
    clientGetAuthState.mockResolvedValue({});
    results = await Attached.getInitialProps({});
    expect(serverGetAuthState).not.toHaveBeenCalled();
    expect(clientGetAuthState).toHaveBeenCalled();
  });

  it('returns isBrowser when run in client', async () => {
    clientGetAuthState.mockResolvedValue({});
    results = await Attached.getInitialProps({});
    expect(results).toHaveProperty('isBrowser');
  });

  describe('caching headers', () => {
    it('prevent caching', async () => {
      serverGetAuthState.mockResolvedValue({});
      const res = { setHeader: vi.fn(), writeHead: vi.fn(), end: vi.fn() };
      results = await Attached.getInitialProps({
        req: {
          get: () => 'localhost'
        },
        res
      });

      expect(res.setHeader).toHaveBeenCalledWith(
        'cache-control',
        'no-cache, must-revalidate, no-store'
      );
    });

    it('are not sent if the response has already been sent', async () => {
      serverGetAuthState.mockResolvedValue({});
      const res = { setHeader: vi.fn(), headersSent: true };

      results = await Attached.getInitialProps({
        req: {},
        res
      });

      expect(res.setHeader).not.toHaveBeenCalled();
    });
  });

  it('calls getInitialProps on wrapped component', async () => {
    MockComponent.getInitialProps = vi.fn().mockResolvedValue(mockInitialProps);
    const Wrapped = { WrappedComponent: MockComponent };
    Attached = authGetInitialProps({ realm: 'jomax' })(Wrapped);
    clientGetAuthState.mockResolvedValue({});
    clientAttemptRedirect.mockResolvedValue(false);
    results = await Attached.getInitialProps({});
    expect(MockComponent.getInitialProps).toHaveBeenCalled();
  });

  it('returns getInitialProps results from wrapped component', async () => {
    MockComponent.getInitialProps = vi.fn().mockResolvedValue(mockInitialProps);
    const Wrapped = { WrappedComponent: MockComponent };
    Attached = authGetInitialProps({ realm: 'jomax' })(Wrapped);
    clientGetAuthState.mockResolvedValue({});
    clientAttemptRedirect.mockResolvedValue(false);
    results = await Attached.getInitialProps({});
    expect(results).toEqual(expect.objectContaining(mockInitialProps));
  });

  it('returns empty object if no child getInitialProps', async () => {
    clientGetAuthState.mockResolvedValue({});
    results = await Attached.getInitialProps({});
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

    Attached = authGetInitialProps({ risk: 'medium' })(MockComponent);
    clientAttemptRedirect.mockResolvedValue(false);
    results = await Attached.getInitialProps({});

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

  it('does not call wrapped getInitialProps when isRedirecting is true (SSR)', async () => {
    MockComponent.getInitialProps = vi.fn().mockResolvedValue(mockInitialProps);
    const Wrapped = { WrappedComponent: MockComponent };
    Attached = authGetInitialProps({ realm: 'jomax' })(Wrapped);
    serverGetAuthState.mockResolvedValue({ valid: false });
    serverAttemptRedirect.mockResolvedValue(true);
    results = await Attached.getInitialProps({ req: {}, res: { setHeader: vi.fn(), headersSent: false } });
    expect(MockComponent.getInitialProps).not.toHaveBeenCalled();
  });

  it('does not call wrapped getInitialProps when isRedirecting is true (client)', async () => {
    MockComponent.getInitialProps = vi.fn().mockResolvedValue(mockInitialProps);
    const Wrapped = { WrappedComponent: MockComponent };
    Attached = authGetInitialProps({ realm: 'jomax' })(Wrapped);
    clientGetAuthState.mockResolvedValue({});
    clientAttemptRedirect.mockResolvedValue(true);
    results = await Attached.getInitialProps({});
    expect(MockComponent.getInitialProps).not.toHaveBeenCalled();
  });
});
