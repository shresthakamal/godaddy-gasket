
/* eslint-disable no-undef */
import authGetServerSideProps from '../src/get-server-side-props';
import ServerHandler from '../src/server-handler';

describe('authGetServerSideProps', () => {
  let ctx,
    mockGasket,
    mockAuthState,
    authProps,
    gssp,
    results,
    getAuthStateSpy,
    getRedirectUrlSpy;

  beforeEach(() => {
    mockGasket = {};
    authProps = { realm: 'jomax', gasket: mockGasket };
    mockAuthState = { valid: true };

    getAuthStateSpy = vi.spyOn(ServerHandler.prototype, 'getAuthState')
      .mockImplementation().mockReturnValue(mockAuthState);
    getRedirectUrlSpy = vi.spyOn(ServerHandler.prototype, 'getRedirectUrl');

    ctx = {
      req: {},
      res: {}
    };
  });

  afterEach(function () {
    vi.resetAllMocks();
    gssp = null;
    results = null;
  });

  it('returns a getServerSideProps function', function () {
    gssp = authGetServerSideProps(authProps);
    expect(gssp).toBeInstanceOf(Function);
    expect(gssp.name).toEqual('getServerSideProps');
  });

  describe('getServerSideProps', function () {

    it('checks for auth state and redirect URL', async function () {
      gssp = authGetServerSideProps(authProps);
      results = await gssp(ctx);
      expect(getAuthStateSpy).toHaveBeenCalled();
      expect(getRedirectUrlSpy).toHaveBeenCalled();
    });

    it('returns page props if valid', async function () {
      gssp = authGetServerSideProps(authProps);
      results = await gssp(ctx);

      expect(results).toEqual({
        props: {
          authKeyState: {
            'realm=jomax': {
              valid: true
            }
          }
        }
      });
    });

    it('returns redirect if invalid', async function () {
      mockAuthState.valid = false;
      getRedirectUrlSpy.mockReturnValue('https://sso.godaddy.com');
      gssp = authGetServerSideProps(authProps);
      results = await gssp(ctx);

      expect(results).toEqual({
        redirect: {
          destination: 'https://sso.godaddy.com',
          permanent: true
        }
      });
    });
  });
});
