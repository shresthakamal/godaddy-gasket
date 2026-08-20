

/* eslint-disable no-undef */
vi.mock('react', async () => {
  const mod = await vi.importActual('react');
  return {
    default: mod,
    ...mod,
    useContext: vi.fn()
      .mockImplementation()
      .mockReturnValue({ authKeyState: {}, dispatch: vi.fn() })
  };
});

const ClientHandler = (await import('../src/client-handler')).default;
const useAuthState = (await import('../src/use-auth-state')).default;

describe('useAuthState', () => {
  let mockAuthState, authProps, results, getAuthStateSpy;

  beforeEach(() => {
    authProps = { realm: 'jomax' };
    mockAuthState = { valid: true };

    getAuthStateSpy = vi.spyOn(ClientHandler.prototype, 'getAuthState')
      .mockImplementation()
      .mockReturnValue(mockAuthState);
  });

  afterEach(function () {
    results = null;
  });

  it('checks for auth state', async function () {
    results = useAuthState(authProps);
    expect(getAuthStateSpy).toHaveBeenCalled();
  });

  it('returns authState', async function () {
    results = useAuthState(authProps);
    expect(results).toEqual(mockAuthState);
  });
});
