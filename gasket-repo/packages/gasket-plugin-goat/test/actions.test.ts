import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGoat } from '../src/actions.js';

vi.mock('@godaddy/goat', () => {
  const mockClient = {
    translate: vi.fn().mockResolvedValue({ jobIds: ['j1'], sourceLocale: 'en-US', state: 'completed', results: [] }),
    health: vi.fn().mockResolvedValue({ status: 'ok', mode: 'combined', uptime: 1000 }),
    me: vi.fn().mockResolvedValue({ principal: { realm: 'jomax', subject: 'jdoe' }, admin: false, roles: [] }),
    jobs: {
      submit: vi.fn().mockResolvedValue({ jobId: 'j1', state: 'pending' }),
      get: vi.fn().mockResolvedValue({ jobId: 'j1', state: 'pending' }),
      list: vi.fn().mockResolvedValue({ jobs: [] }),
      translations: vi.fn().mockResolvedValue({ translations: [] }),
      translation: vi.fn().mockResolvedValue({ id: 't1' }),
      events: vi.fn().mockResolvedValue({ events: [] }),
      retry: vi.fn().mockResolvedValue({ jobId: 'j1', state: 'pending' }),
      approve: vi.fn().mockResolvedValue({ jobId: 'j1', state: 'completed', approved: 1 }),
      cancel: vi.fn().mockResolvedValue({ jobId: 'j1', state: 'cancelled' })
    },
    projects: {
      create: vi.fn().mockResolvedValue({ id: 200 }),
      get: vi.fn().mockResolvedValue({ id: 200 }),
      list: vi.fn().mockResolvedValue({ projects: [] }),
      costs: vi.fn().mockResolvedValue({ projectId: 200, period: {}, summary: {}, breakdown: [] })
    },
    applications: {
      register: vi.fn().mockResolvedValue({ id: 100 }),
      list: vi.fn().mockResolvedValue({ applications: [] }),
      get: vi.fn().mockResolvedValue({ id: 100 }),
      prepare: vi.fn().mockResolvedValue({ project: {}, application: {} }),
      getConfig: vi.fn().mockResolvedValue({ doNotTranslate: [], placeholderPatterns: [], translationInstructions: null }),
      updateConfig: vi.fn().mockResolvedValue({ doNotTranslate: [], placeholderPatterns: [], translationInstructions: null }),
      delivery: {
        getAll: vi.fn().mockResolvedValue({ data: {}, etag: null, notModified: false }),
        getLocale: vi.fn().mockResolvedValue({ data: {}, etag: null, notModified: false }),
        getKey: vi.fn().mockResolvedValue({ data: {}, etag: null, notModified: false }),
        getBatch: vi.fn().mockResolvedValue({ data: {}, etag: null, notModified: false }),
        getStatus: vi.fn().mockResolvedValue({ enabled: true, locales: [] }),
        setEnabled: vi.fn().mockResolvedValue({ enabled: true }),
        republish: vi.fn().mockResolvedValue({ locales: 0, keys: 0 }),
        purge: vi.fn().mockResolvedValue({ deleted: 0 }),
        purgeLocale: vi.fn().mockResolvedValue({ locale: 'es-MX' }),
        deleteKeys: vi.fn().mockResolvedValue({ deleted: 0 })
      },
      phrase: {
        getStatus: vi.fn().mockResolvedValue({ enabled: false, memsourceUid: null }),
        provision: vi.fn().mockResolvedValue({ enabled: true, memsourceUid: 'uid' }),
        setEnabled: vi.fn().mockResolvedValue({ enabled: true, memsourceUid: 'uid' })
      }
    },
    providers: {
      list: vi.fn().mockResolvedValue({ providers: [] }),
      get: vi.fn().mockResolvedValue({ id: 'p1' }),
      create: vi.fn().mockResolvedValue({ id: 'p1' }),
      update: vi.fn().mockResolvedValue({ id: 'p1' }),
      delete: vi.fn()
    },
    glossary: {
      listProject: vi.fn().mockResolvedValue({ terms: [] }),
      createProjectTerm: vi.fn().mockResolvedValue({ term: {} }),
      updateProjectTerm: vi.fn().mockResolvedValue({ term: {} }),
      deleteProjectTerm: vi.fn(),
      importProject: vi.fn().mockResolvedValue({ imported: 0 }),
      listGlobal: vi.fn().mockResolvedValue({ terms: [] }),
      createGlobalTerm: vi.fn().mockResolvedValue({ term: {} }),
      updateGlobalTerm: vi.fn().mockResolvedValue({ term: {} }),
      deleteGlobalTerm: vi.fn(),
      importGlobal: vi.fn().mockResolvedValue({ imported: 0 })
    },
    tm: { search: vi.fn().mockResolvedValue({ entries: [] }) },
    identities: {
      list: vi.fn().mockResolvedValue({ identities: [] }),
      register: vi.fn().mockResolvedValue({ id: 'i1' }),
      revoke: vi.fn()
    },
    models: { list: vi.fn().mockResolvedValue({ models: [] }) },
    settings: { get: vi.fn().mockResolvedValue({}) }
  };
  return {
    createGoatClient: vi.fn(() => mockClient),
    __mockClient: mockClient
  };
});

import { createGoatClient } from '@godaddy/goat';

function makeGasket(overrides: Record<string, any> = {}) {
  return {
    config: {
      goat: {
        baseUrl: 'https://api.goat.test',
        appId: 'test-app',
        projectId: 'test-project',
        ...overrides
      }
    },
    actions: {
      getJwt: vi.fn().mockResolvedValue('minted-token'),
      getAuthToken: vi.fn().mockResolvedValue('forwarded-token')
    },
    logger: {
      debug: vi.fn(),
      error: vi.fn()
    }
  } as any;
}

describe('getGoat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a GoatClient instance', () => {
    const gasket = makeGasket();
    const client = getGoat(gasket);
    expect(client).toBeDefined();
    expect(client.translate).toBeDefined();
    expect(client.health).toBeDefined();
    expect(client.jobs.submit).toBeDefined();
    expect(client.applications.delivery.getAll).toBeDefined();
    expect(client.applications.phrase.getStatus).toBeDefined();
    expect(client.glossary.listProject).toBeDefined();
    expect(client.providers.list).toBeDefined();
  });

  it('creates client with config from gasket.config.goat', () => {
    const gasket = makeGasket();
    getGoat(gasket);

    expect(createGoatClient).toHaveBeenCalledWith(expect.objectContaining({
      baseUrl: 'https://api.goat.test',
      appId: 'test-app',
      projectId: 'test-project'
    }));
  });

  describe('request logging', () => {
    async function fetchWithStatus(gasket: any, status: number) {
      getGoat(gasket);
      const { fetchImpl } = (createGoatClient as any).mock.calls[0][0];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status }));
      await fetchImpl('https://api.goat.test/api/v1/delivery/7774?keys=a,b');
    }

    it.each([200, 304])('logs %i at debug level', async (status) => {
      const gasket = makeGasket();
      await fetchWithStatus(gasket, status);

      expect(gasket.logger.error).not.toHaveBeenCalled();
      expect(gasket.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining(`→ ${status} (`)
      );
    });

    it.each([404, 500])('logs %i at error level', async (status) => {
      const gasket = makeGasket();
      await fetchWithStatus(gasket, status);

      expect(gasket.logger.error).toHaveBeenCalledWith(
        expect.stringContaining(`→ ${status} (`)
      );
    });

    it('omits the query string from logged urls', async () => {
      const gasket = makeGasket();
      await fetchWithStatus(gasket, 200);

      for (const [message] of gasket.logger.debug.mock.calls) {
        expect(message).not.toContain('keys=');
        expect(message).toContain('https://api.goat.test/api/v1/delivery/7774');
      }
    });
  });

  describe('auth resolution', () => {
    it('uses serviceAuth (getJwt) when no request passed', async () => {
      const gasket = makeGasket();
      getGoat(gasket);

      const config = (createGoatClient as any).mock.calls[0][0];
      const headers = await config.auth();
      expect(gasket.actions.getJwt).toHaveBeenCalledWith('goat');
      expect(headers.Authorization).toBe('sso-jwt minted-token');
    });

    it('uses forwardAuth (getAuthToken) when request passed', async () => {
      const gasket = makeGasket();
      const req = { headers: { authorization: 'sso-jwt caller-token' } };
      getGoat(gasket, req);

      const config = (createGoatClient as any).mock.calls[0][0];
      const headers = await config.auth();
      expect(gasket.actions.getAuthToken).toHaveBeenCalledWith(req, 'jomax');
      expect(headers.Authorization).toBe('sso-jwt forwarded-token');
    });

    it('throws actionable error when gasket-plugin-jwt is unavailable', async () => {
      const gasket = makeGasket();
      delete gasket.actions.getJwt;
      getGoat(gasket);

      const config = (createGoatClient as any).mock.calls[0][0];
      await expect(config.auth()).rejects.toThrow(
        'service authentication requires @godaddy/gasket-plugin-jwt'
      );
    });

    it('throws actionable error when gasket-plugin-auth is unavailable', async () => {
      const gasket = makeGasket();
      delete gasket.actions.getAuthToken;
      const req = { headers: {} };
      getGoat(gasket, req);

      const config = (createGoatClient as any).mock.calls[0][0];
      await expect(config.auth()).rejects.toThrow(
        'request forwarding requires @godaddy/gasket-plugin-auth'
      );
    });

    it.each([
      ['a bare Headers object', new Headers({ authorization: 'sso-jwt caller-token' })],
      ['a context object without headers', { params: {} }],
      ['a string', 'req']
    ])('throws rather than using the service identity for %s', async (_label, arg) => {
      const gasket = makeGasket();
      getGoat(gasket, arg);

      const config = (createGoatClient as any).mock.calls[0][0];
      await expect(config.auth()).rejects.toThrow('expected a request with headers');
      expect(gasket.actions.getJwt).not.toHaveBeenCalled();
    });

    it('still allows unauthenticated calls when the request is unusable', () => {
      const gasket = makeGasket();
      const client = getGoat(gasket, { params: {} });

      // health() is authMode: 'none' in the SDK, so it never invokes the auth provider
      expect(client.health).toBeDefined();
    });

    it('throws when request passed but no token present', async () => {
      const gasket = makeGasket();
      gasket.actions.getAuthToken.mockResolvedValue(null);
      const req = { headers: {} };
      getGoat(gasket, req);

      const config = (createGoatClient as any).mock.calls[0][0];
      await expect(config.auth()).rejects.toThrow('no sso-jwt token present');
    });
  });
});
