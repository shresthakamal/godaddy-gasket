import { vi } from 'vitest';
import getFetchKeyFunction from '../lib/get-fetch-key-function.js';
import { fetchKey } from 'gd-auth';

vi.mock('gd-auth');

describe('GetFetchKeyFunction', () => {
  const host = 'sso.godaddy-proxy.com';
  const cert = 'cert-contents-abc';
  const key = 'key-contents-123';

  const useragent = 'useragent-chromium';
  const kid = 'kid-789';

  it('uses the provided host, key, and cert values in https call', async () => {
    const fetchKeyFunction = getFetchKeyFunction({ host, cert, key });
    await fetchKeyFunction(useragent, 'otherhost.com', kid);

    expect(fetchKey).toHaveBeenCalled();
    const parameters = fetchKey.mock.calls[0];
    expect(parameters[1]).toEqual(host);
    expect(parameters[3]).toEqual({ key, cert });
  });
});
