/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import {
  authFetch,
  authGetInitialProps,
  authGetServerSideProps,
  AuthParams,
  AuthProps,
  AuthRealm,
  AuthRequired,
  AuthResponse,
  AuthRisk,
  AuthStatus,
  getLoginUrlFromWindow,
  useAuthState,
  withAuthProvider,
  withAuthRequired
} from '@godaddy/gasket-auth';


describe('@godaddy/gasket-auth', function () {
  const perform = false;

  const authParams: AuthParams = {
    realm: AuthRealm.jomax,
    risk: AuthRisk.low,
    type: ['basic'],
    groups: ['awesome'],
    certs: ['official'],
    allowHeartbeat: true,
    use12HourExpiration: true
  };

  const authProps: AuthProps = {
    ...authParams,
    injectDetails: false
  };

  it('AuthRequired - has expected API', function () {
    <AuthRequired {...authProps}>
      <div>We're in!</div>
    </AuthRequired>;
  });

  it('AuthRequired - works with realm', function () {
    // <AuthRequired realm='jomax'>
    //   <div>We're in!</div>
    // </AuthRequired>;

    <AuthRequired realm={AuthRealm.jomax}>
      <div>We're in!</div>
    </AuthRequired>;

    // @ts-expect-error
    <AuthRequired realm='bogus'>
      <div>We're in!</div>
    </AuthRequired>;
  });

  it('AuthRequired - works with risk', function () {
    // <AuthRequired risk='high'>
    //   <div>We're in!</div>
    // </AuthRequired>;

    <AuthRequired risk={AuthRisk.high}>
      <div>We're in!</div>
    </AuthRequired>;

    // @ts-expect-error
    <AuthRequired risk='bogus'>
      <div>We're in!</div>
    </AuthRequired>;
  });

  it('withAuthRequired - has expected API', function () {
    const hoc = withAuthRequired({
      ...authParams,
      initialProps: true,
      alt: <div>You are not authorized</div>,
      loading: <div>Please wait...</div>
    });
  });

  it('withAuthRequired - injects required props', function () {
    const UnwrappedComponent = ({ authDetails }: { authDetails: {} }) =>
      <code>{JSON.stringify(authDetails)}</code>;

    const WrappedComponent = withAuthRequired({ injectDetails: true })(
      UnwrappedComponent
    );

    <WrappedComponent />;
  });

  it('withAuthProvider - has expected API', function () {
    const Original = () => <div>Hello</div>;

    const hoc = withAuthProvider();
    const Wrapped = hoc(Original);

    <Wrapped />;
  });

  it('authGetInitialProps - has expected API', function () {
    const Unwrapped = () => <div>Hello</div>;

    const hoc = authGetInitialProps(authParams);
    const Wrapped = hoc(Unwrapped);

    <Wrapped />;
  });

  it('authGetServerSideProps - has expected API', function () {
    const getSSP = authGetServerSideProps(authParams);
  });

  it('useAuthState - has expected API', function () {
    if (perform) {
      const response: AuthResponse = useAuthState(authParams);
    }
  });

  it('getLoginUrlFromWindow - has expected API', function () {
    if (perform) {
      getLoginUrlFromWindow(window, { path: '/hello' }, {
        overrideUrl: '/my/override/login',
        subdomain: () => 'custom.sub.domain',
        // @ts-expect-error
        bogus: true
      });
    }
  });

  it('AuthStatus - enum type', function () {
    const loading: string = AuthStatus.LOADING;
    const loaded: string = AuthStatus.LOADED;
    const error: string = AuthStatus.ERROR;
  });

  it('authFetch - has expected API', async function () {
    if (perform) {
      const response = await authFetch('/api/example', { method: 'GET' });
      if (response.ssoRedirect) {
        // is being redirected to sso
      }

      if (response.ok) {
        // do things with response
      }
    }
  });
});
