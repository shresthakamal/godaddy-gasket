import * as index from '../src';

describe('index', () => {
  it('has expected exports', () => {
    const expected = [
      'AuthRequired',
      'withAuthRequired',
      'withAuthProvider',
      'authGetInitialProps',
      'authGetServerSideProps',
      'useAuthState',
      'getLoginUrlFromWindow',
      'authFetch',
      'makeAuthFetch',
      'AuthStatus',
      'AuthRealm',
      'AuthRisk'
    ];

    expected.forEach(key => expect(index).toHaveProperty(key));
    expect(Object.keys(index)).toHaveLength(expected.length);
  });
});
