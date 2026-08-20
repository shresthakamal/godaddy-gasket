import { hosts } from '../lib/default-config.js';
import configureHook from '../lib/configure.js';

describe('configure', () => {
  let results, mockGasket;

  beforeAll(() => {
    mockGasket = { config: { auth: {} } };
  });

  it('returns config with updated auth settings', () => {
    results = configureHook(mockGasket, {
      presentationCentral: { params: { app: 'some-app ' } }
    });
    expect(results).toHaveProperty('auth');
  });

  it('retains base config settings', () => {
    results = configureHook(mockGasket, { bogus: 'BOGUS' });
    expect(results).toHaveProperty('bogus', 'BOGUS');
  });

  it('does not trash prototypes of objects during config merge', () => {
    class WebpackPlugin {
      apply() { }
    }

    const config = {
      webpack: {
        plugins: [
          new WebpackPlugin()
        ]
      }
    };

    const newConfig = configureHook(mockGasket, config);
    expect(typeof newConfig.webpack.plugins[0].apply).toEqual('function');
  });

  it('sets default host', () => {
    results = configureHook(mockGasket, {});
    expect(results.auth).toHaveProperty('host', expect.any(Array));
  });

  it('allows host to be configured by user', () => {
    results = configureHook(mockGasket, { auth: { host: 'godaddy.com' } });
    expect(results.auth).toHaveProperty('host', 'godaddy.com');
  });

  it('sets appName based on presentationCentral app param', () => {
    results = configureHook(mockGasket, {
      presentationCentral: {
        params: { app: 'some-app' }
      }
    });
    expect(results.auth.appName).toEqual('some-app');
  });

  it('allows auth settings to be added by user', () => {
    results = configureHook(mockGasket, {});
    expect(results.auth).not.toHaveProperty('risk');
    results = configureHook(mockGasket, { auth: { risk: 'medium' } });
    expect(results.auth).toHaveProperty('risk', 'medium');
  });

  it('allows auth settings to be overridden by user', () => {
    results = configureHook(mockGasket, { auth: { basePath: '/changed' } });
    expect(results.auth).toHaveProperty('basePath', '/changed');
  });

  it('defaults realm to idp', () => {
    results = configureHook(mockGasket, { auth: { basePath: '/changed' } });
    expect(results.auth).toHaveProperty('realm', 'idp');
  });

  it('configures realm to be set by user', () => {
    results = configureHook(mockGasket, { auth: { basePath: '/changed', realm: 'jomax' } });
    expect(results.auth).toHaveProperty('realm', 'jomax');
  });

  it('adds auth tokens to elastic APM sensitive cookies', () => {
    results = configureHook(mockGasket, {});

    expect(results).toHaveProperty('elasticAPM');
    expect(results.elasticAPM).toHaveProperty('sensitiveCookies');
    expect(results.elasticAPM.sensitiveCookies).toContain('auth_idp');
    expect(results.elasticAPM.sensitiveCookies).toContain('auth_jomax');
    expect(results.elasticAPM.sensitiveCookies).toContain('cust_idp');
  });

  describe('environments', () => {

    function testEnv(env, expectedHosts) {
      it(`uses ${JSON.stringify(expectedHosts)} for ${env}`, function () {
        const config = configureHook(mockGasket, { env, presentationCentral: { params: { app: 'some-app' } } });
        expect(config.auth.host).toEqual(expectedHosts);
      });
    }

    testEnv('dev', hosts.dev);
    testEnv('development', hosts.dev);
    testEnv('development.p3', hosts.dev);
    testEnv('local', hosts.dev);
    testEnv('localhost', hosts.dev);

    testEnv('test', hosts.test);
    testEnv('testing', hosts.test);
    testEnv('testing.p3', hosts.test);

    testEnv('prod', hosts.prod);
    testEnv('production', hosts.prod);
    testEnv('production.p3', hosts.prod);

    testEnv('stg', hosts.stg);
    testEnv('stage', hosts.stg);
    testEnv('staging', hosts.stg);
    testEnv('stage.p3', hosts.stg);

    testEnv('ote', hosts.ote);
    testEnv('ote.p3', hosts.ote);

    testEnv('bogus', hosts.prod);
    testEnv('*', hosts.prod);
  });

  describe('oauth issuer', () => {

    // The per-env default issuer is resolved lazily on the FFI path (see
    // auth-lib-wrapper.spec.js) so the URLs live only in the gd-auth-lib
    // `OAuthIssuer` enum. configure only passes through explicit config.
    function testNoDefault(env) {
      it(`does not inject a default oauth.oauthIssuer for env "${env}"`, function () {
        const config = configureHook(mockGasket, { env, presentationCentral: { params: { app: 'some-app' } } });
        expect(config.auth.oauth).not.toHaveProperty('oauthIssuer');
      });
    }

    testNoDefault('dev');
    testNoDefault('test');
    testNoDefault('stg');
    testNoDefault('ote');
    testNoDefault('prod');
    testNoDefault('bogus');

    it('preserves an explicitly configured oauth.oauthIssuer', () => {
      const config = configureHook(mockGasket, {
        env: 'test',
        auth: { oauth: { oauthIssuer: 'https://custom.example.com' } },
        presentationCentral: { params: { app: 'some-app' } }
      });
      expect(config.auth.oauth).toHaveProperty('oauthIssuer', 'https://custom.example.com');
    });
  });
});
