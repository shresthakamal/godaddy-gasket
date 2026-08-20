/* eslint-disable max-nested-callbacks, max-statements, no-undef */

import mockPcManifest from './fixures/pc-manifest';

const mockFetch = vi.fn();
vi.mock('@gasket/fetch', () => ({
  default: mockFetch
}));

const mockGasketData = vi.fn().mockReturnValue({});
vi.mock('@gasket/data', () => ({
  gasketData: mockGasketData
}));

const mockUrls = {
  brand: 'https://sso.mediatemple.net',
  coUK: 'https://sso.123-reg.co.uk',
  godaddy: 'https://sso.dev-godaddy.com?realm=idp&path=%2F&app=canary.gasket',
  privateLabel:
    'https://sso.dev-secureserver.net?realm=idp&path=%2F&app=canary.gasket',
  afternicLegacy: 'https://www.int.dev-afternic.com/login',
  afternicBeta: 'https://sso.dev-afternic.com/'
};

vi.spyOn(window, 'open').mockImplementation();
const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation();
vi.spyOn(console, 'error').mockImplementation();

const utils = await import('../src/utils');

describe('Utils', () => {
  let result;

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('pickFromKeys', () => {
    it('picks properties array of key names', () => {
      result = utils.pickFromKeys({ a: 1, b: 2, c: 3 }, ['a', 'b']);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('ignores props with undefined values', () => {
      // eslint-disable-next-line no-undefined
      result = utils.pickFromKeys({ a: undefined, b: 2, c: 3 }, ['a', 'b']);
      expect(result).toEqual({ b: 2 });
    });
  });

  describe('paramsFromProps', () => {
    it('returns supported keys', () => {
      const mockProps = { realm: 'idp', bogus: 'BOGUS' };
      result = utils.paramsFromProps(mockProps);
      expect(result).toHaveProperty('realm');
      expect(result).toEqual({ realm: 'idp' });
    });

    it('does not return unsupported keys', () => {
      const mockProps = { realm: 'idp', bogus: 'BOGUS' };
      result = utils.paramsFromProps(mockProps);
      expect(result).not.toHaveProperty('bogus');
    });

    it('returns expected keys', () => {
      const mockProps = {
        realm: 'idp',
        risk: 'low',
        type: 'basic',
        groups: ['group1', 'group2'],
        allowHeartbeat: true,
        use12HourExpiration: true
      };

      result = utils.paramsFromProps(mockProps);
      expect(result).toHaveProperty('realm');
      expect(result).toHaveProperty('risk');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('groups');
      expect(result).toHaveProperty('allowHeartbeat');
      expect(result).toHaveProperty('use12HourExpiration');
    });
  });

  describe('getAuthKey', () => {
    it('uses supported params in key', () => {
      const mockProps = { realm: 'idp', bogus: 'BOGUS' };
      result = utils.getAuthKey(mockProps);
      expect(result).toContain('realm');
      expect(result).toEqual('realm=idp');
    });

    it('uses __default__ as key for default params', () => {
      const mockProps = { bogus: 'BOGUS' };
      result = utils.getAuthKey(mockProps);
      expect(result).not.toContain('bogus');
      expect(result).toEqual('__default__');
    });
  });

  describe('transformLoginUrl', () => {
    it('returns login url when branded reseller', () => {
      const path = '/some/place';
      result = utils.transformLoginUrl(mockUrls.brand);
      expect(result).toBe(mockUrls.brand);
      result = utils.transformLoginUrl(mockUrls.brand, { path });
      expect(result).toContain(mockUrls.brand);
      expect(result).toContain(`path=${encodeURIComponent(path)}`);
    });

    it('returns login url when 123-reg.co.uk reseller', () => {
      const path = '/some/place';
      result = utils.transformLoginUrl(mockUrls.coUK);
      expect(result).toBe(mockUrls.coUK);
      result = utils.transformLoginUrl(mockUrls.coUK, { path });
      expect(result).toContain(mockUrls.coUK);
      expect(result).toContain(`path=${encodeURIComponent(path)}`);
    });

    it('returns unmodified login url if not params', () => {
      result = utils.transformLoginUrl(mockUrls.godaddy);
      expect(result).toBe(mockUrls.godaddy);
    });

    it('returns modified login url with params', () => {
      const path = '/some/place';
      result = utils.transformLoginUrl(mockUrls.godaddy, { path });
      expect(result).not.toBe(mockUrls.godaddy);
      expect(result).toContain(`path=${encodeURIComponent(path)}`);
    });

    it('overrides query params from login url', () => {
      const app = 'local.gasket';
      result = utils.transformLoginUrl(mockUrls.godaddy, { app });
      expect(result).not.toBe(mockUrls.godaddy);
      expect(result).toContain(`app=${encodeURIComponent(app)}`);
    });

    it('only appends whitelisted params', () => {
      const port = 'local.gasket';
      const bogus = 'BOGUS';
      result = utils.transformLoginUrl(mockUrls.godaddy, { port, bogus });
      expect(result).not.toBe(mockUrls.godaddy);
      expect(result).toContain('port=');
      expect(result).not.toContain('bogus=');
    });

    it('modifies privatelabel login urls', () => {
      const port = 'local.gasket';
      const bogus = 'BOGUS';
      result = utils.transformLoginUrl(mockUrls.privateLabel, { port, bogus });
      expect(result).not.toBe(mockUrls.privateLabel);
      expect(result).toContain('port=');
      expect(result).not.toContain('bogus=');
    });

    it('modifies legacy afternic login urls', () => {
      const port = 'local.gasket';
      const bogus = 'BOGUS';
      result = utils.transformLoginUrl(mockUrls.afternicLegacy, {
        port,
        bogus
      });
      expect(result).not.toBe(mockUrls.afternic);
      expect(result).toContain('port=');
      expect(result).not.toContain('bogus=');
    });

    it('modifies beta afternic login urls', () => {
      const port = 'local.gasket';
      const bogus = 'BOGUS';
      result = utils.transformLoginUrl(mockUrls.afternicBeta, { port, bogus });
      expect(result).not.toBe(mockUrls.afternic);
      expect(result).toContain('port=');
      expect(result).not.toContain('bogus=');
    });
  });

  describe('redirectTo', () => {
    it('opens a window in self', () => {
      utils.redirectTo('https://sso.dev-godaddy.com');
      expect(window.open).toHaveBeenCalledWith(expect.any(String), '_self');
    });

    it('logs redirect', () => {
      utils.redirectTo('https://sso.dev-godaddy.com');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'SSO Redirect:',
        'https://sso.dev-godaddy.com'
      );
    });
  });

  describe('fixupLoginUrlEnv', () => {
    const prodGoDaddy = 'https://sso.godaddy.com?realm=idp&app=bogus';
    const prodPrivateLabel = 'https://sso.secureserver.net?realm=idp&app=bogus';
    const prodCorpTools = 'https://sso.gdcorp.tools?realm=jomax&app=bogus';

    it('appends stg- to godaddy.com', () => {
      result = utils.fixupLoginUrlEnv(prodGoDaddy, 'bogus.stg-godaddy.com');
      expect(result).toEqual('https://sso.stg-godaddy.com?realm=idp&app=bogus');
    });

    it('appends stg- to secureserver.net', () => {
      result = utils.fixupLoginUrlEnv(
        prodPrivateLabel,
        'bogus.stg-secureserver.net'
      );
      expect(result).toEqual(
        'https://sso.stg-secureserver.net?realm=idp&app=bogus'
      );
    });

    it('appends stg- to gdcorp.tools', () => {
      result = utils.fixupLoginUrlEnv(prodCorpTools, 'bogus.stg-gdcorp.tools');
      expect(result).toEqual(
        'https://sso.stg-gdcorp.tools?realm=jomax&app=bogus'
      );
    });

    it('appends ote- to godaddy.com', () => {
      result = utils.fixupLoginUrlEnv(prodGoDaddy, 'bogus.ote-godaddy.com');
      expect(result).toEqual('https://sso.ote-godaddy.com?realm=idp&app=bogus');
    });

    it('appends ote- to secureserver.net', () => {
      result = utils.fixupLoginUrlEnv(
        prodPrivateLabel,
        'bogus.ote-secureserver.net'
      );
      expect(result).toEqual(
        'https://sso.ote-secureserver.net?realm=idp&app=bogus'
      );
    });

    it('appends ote- to gdcorp.tools', () => {
      result = utils.fixupLoginUrlEnv(prodCorpTools, 'bogus.ote-gdcorp.tools');
      expect(result).toEqual(
        'https://sso.ote-gdcorp.tools?realm=jomax&app=bogus'
      );
    });

    it('does not change for other godaddy.com hostnames', () => {
      const hostnames = [
        'godaddy.com',
        'bogus.godaddy.com',
        'bogus.dev-godaddy.com',
        'bogus.test-godaddy.com',
        'bogus.fake-godaddy.com'
      ];
      hostnames.forEach((hostname) => {
        result = utils.fixupLoginUrlEnv(prodGoDaddy, hostname);
        expect(result).toEqual(prodGoDaddy);
      });
    });

    it('does not change for other secureserver.net hostnames', () => {
      const hostnames = [
        'secureserver.net',
        'bogus.secureserver.net',
        'bogus.dev-secureserver.net',
        'bogus.test-secureserver.net',
        'bogus.fake-secureserver.net'
      ];
      hostnames.forEach((hostname) => {
        result = utils.fixupLoginUrlEnv(prodPrivateLabel, hostname);
        expect(result).toEqual(prodPrivateLabel);
      });
    });

    it('does not change for other gdcorp.tools hostnames', () => {
      const hostnames = [
        'gdcorp.tools',
        'bogus.gdcorp.tools',
        'bogus.dev-gdcorp.tools',
        'bogus.test-gdcorp.tools',
        'bogus.fake-gdcorp.tools'
      ];
      hostnames.forEach((hostname) => {
        result = utils.fixupLoginUrlEnv(prodPrivateLabel, hostname);
        expect(result).toEqual(prodPrivateLabel);
      });
    });

    it('does not change for overridden sso urls', () => {
      const hostnames = [
        'godaddy.com',
        'stg-godaddy.com',
        'bogus.stg-godaddy.com',
        'ote-godaddy.com',
        'bogus.ote-godaddy.com',
        'secureserver.net',
        'stg-secureserver.net',
        'bogus.stg-secureserver.net',
        'ote-secureserver.net',
        'bogus.ote-secureserver.net'
      ];
      const urls = [
        'https://sso.mediatemple.com',
        'https://sso.123-reg.co.uk',
        'https://some.secureserver.net/sso',
        'https://some.tricky.godaddy.com/sso.godaddy.com.url'
      ];
      hostnames.forEach((hostname) => {
        urls.forEach((url) => {
          result = utils.fixupLoginUrlEnv(url, hostname);
          expect(result).toEqual(url);
        });
      });
    });
  });

  describe('fixupLoginUrlCorpTools', () => {
    it('does not adjust url if hostname is godaddy.com', () => {
      const ssoUrl = 'https://sso.godaddy.com?realm=jomax&app=bogus';
      result = utils.fixupLoginUrlDomain(ssoUrl, 'bogus.godaddy.com');
      expect(result).toContain('godaddy.com');
      expect(result).not.toContain('gdcorp.tools');
    });

    it('does not adjust url if hostname is secureserver.net', () => {
      const ssoUrl = 'https://sso.secureserver.net?realm=jomax&app=bogus';
      result = utils.fixupLoginUrlDomain(ssoUrl, 'bogus.secureserver.net');
      expect(result).toContain('secureserver.net');
      expect(result).not.toContain('gdcorp.tools');
    });

    it('does not adjust url if already gdcorp.tools', () => {
      const ssoUrl = 'https://sso.secureserver.net?realm=jomax&app=bogus';
      result = utils.fixupLoginUrlDomain(ssoUrl, 'bogus.secureserver.net');
      expect(result).toBe(ssoUrl);
    });

    it('adjusts url if hostname is gdcorp.tools', () => {
      const ssoUrl = 'https://sso.godaddy.com?realm=jomax&app=bogus';
      result = utils.fixupLoginUrlDomain(ssoUrl, 'bogus.gdcorp.tools');
      expect(result).not.toContain('godaddy.com');
      expect(result).toEqual('https://sso.gdcorp.tools?realm=jomax&app=bogus');
    });

    it('adjusts url if hostname is reamaze.com', () => {
      const ssoUrl = 'https://sso.godaddy.com?realm=jomax&app=bogus';
      result = utils.fixupLoginUrlDomain(ssoUrl, 'bogus.reamaze.com');
      expect(result).not.toContain('godaddy.com');
      expect(result).toEqual('https://sso.reamaze.com?realm=jomax&app=bogus');
    });

    it('adjusts url if hostname is 123reg.co.uk', () => {
      const ssoUrl = 'https://sso.godaddy.com?realm=jomax&app=bogus';
      result = utils.fixupLoginUrlDomain(ssoUrl, 'bogus.123reg.co.uk');
      expect(result).not.toContain('godaddy.com');
      expect(result).toEqual('https://sso.123reg.co.uk?realm=jomax&app=bogus');
    });
  });

  describe('getParamsFromHost', () => {
    it('returns empty object if no params derived', () => {
      result = utils.getParamsFromHost('sso.dev-godaddy.com');
      expect(result).toEqual({});
    });

    it('returns port', () => {
      result = utils.getParamsFromHost('sso.dev-godaddy.com:3000');
      expect(result).toHaveProperty('port', '3000');
    });

    it('returns local app if in host', () => {
      result = utils.getParamsFromHost('local.gasket.dev-godaddy.com:3000');
      expect(result).toHaveProperty('app', 'local.gasket');
    });

    it('handles missing subdomain', () => {
      result = utils.getParamsFromHost('dev-godaddy.com');
      expect(result).not.toHaveProperty('app');
    });

    describe('subdomain', () => {
      it('can be disabled', () => {
        const host = 't123.some-app.dev-godaddy.com';
        expect(utils.getParamsFromHost(host)).toHaveProperty(
          'subdomain',
          't123.some-app'
        );
        expect(utils.getParamsFromHost(host, false)).not.toHaveProperty(
          'subdomain'
        );
      });

      it('handles 2 letter dot extensions', () => {
        expect(
          utils.getParamsFromHost('t123.some-app.dev-godaddy.com')
        ).toHaveProperty('subdomain', 't123.some-app');
        expect(
          utils.getParamsFromHost('t123.some-app.dev-123-reg.co.uk')
        ).toHaveProperty('subdomain', 't123.some-app');
        expect(
          utils.getParamsFromHost('some-app.dev-123-reg.co.uk')
        ).not.toHaveProperty('subdomain');
      });

      it('can use custom logic', () => {
        const host = 't123.some-app.dev-godaddy.com';
        expect(utils.getParamsFromHost(host)).toHaveProperty(
          'subdomain',
          't123.some-app'
        );
        expect(
          utils.getParamsFromHost(host, (hostArg) =>
            hostArg.replace('t123.some-app', 'bucket')
          )
        ).toHaveProperty('subdomain', 'bucket.dev-godaddy.com');
      });

      /**
       * Check subdomain for various hostnames
       * @param {string} host - hostname
       * @param {string} expected - expected subdomain
       */
      function check(host, expected) {
        const r = utils.getParamsFromHost(host);

        if (expected) {
          it(`is ${expected} for ${host}`, () => {
            expect(r).toHaveProperty('subdomain', expected);
          });
        } else {
          it(`not set for ${host}`, () => {
            expect(r).not.toHaveProperty('subdomain');
          });
        }
      }

      check('t123.some-app.dev-godaddy.com', 't123.some-app');
      check('t123.some-app.dev-godaddy.com:8443', 't123.some-app');
      check('t123.some-app.int.dev-godaddy.com', 't123.some-app.int');
      check('t123.some-app.test-godaddy.com', 't123.some-app');
      check('t123.some-app.stg-godaddy.com', 't123.some-app');
      check('t123.some-app.godaddy.com', 't123.some-app');
      check('some-app.godaddy.com');
      check('local.gasket.godaddy.com');
      check('local.gasket.int.godaddy.com');

      check('t123.some-app.dev-secureserver.net', 't123.some-app');
      check('t123.some-app.dev-secureserver.net:8443', 't123.some-app');
      check('t123.some-app.int.dev-secureserver.net', 't123.some-app.int');
      check('t123.some-app.test-secureserver.net', 't123.some-app');
      check('t123.some-app.stg-secureserver.net', 't123.some-app');
      check('t123.some-app.ote-secureserver.net', 't123.some-app');
      check('t123.some-app.secureserver.net', 't123.some-app');
      check('some-app.secureserver.net');
      check('local.gasket.secureserver.net');
      check('local.gasket.int.secureserver.net');

      check('t123.some-app.dev-gdcorp.tools', 't123.some-app');
      check('t123.some-app.dev-gdcorp.tools:8443', 't123.some-app');
      check('t123.some-app.int.dev-gdcorp.tools', 't123.some-app.int');
      check('t123.some-app.test-gdcorp.tools', 't123.some-app');
      check('t123.some-app.stg-gdcorp.tools', 't123.some-app');
      check('t123.some-app.gdcorp.tools', 't123.some-app');
      check('some-app.gdcorp.tools');
      check('local.gasket.gdcorp.tools');
      check('local.gasket.int.gdcorp.tools');
    });
  });

  describe('parseLoginUrlFromPcData', () => {
    it('returns url from PresentationCentral v2 globals', () => {
      result = utils.parseLoginUrl(mockPcManifest.godaddy);
      expect(result).toEqual(
        'https://sso.godaddy.com?realm=idp&path=%2F&app=canary.gasket'
      );
    });
    it('returns url from PresentationCentral v3 shared props', () => {
      result = utils.parseLoginUrl(mockPcManifest.v3);
      expect(result).toEqual(
        'https://sso.godaddy.com?realm=idp&path=%2F&app=canary.gasket'
      );
    });

    it('returns null if no pcData', () => {
      result = utils.parseLoginUrl({});
      expect(result).toEqual(null);
    });

    it('returns null if no shared props', () => {
      result = utils.parseLoginUrl({ config: { props: { shared: {} } } });
      expect(result).toEqual(null);
    });

    it('returns null if unable to match', () => {
      result = utils.parseLoginUrl({ globals: 'mock missing sso login' });
      expect(result).toEqual(null);
    });
  });

  describe('getLoginUrlFromRequest', () => {
    it('returns fixed up url from PresentationCentral globals', () => {
      result = utils.getLoginUrlFromRequest(
        mockPcManifest.godaddy,
        { realm: 'jomax', path: 'fake-page' },
        { host: 'bogus.stg-godaddy.com' }
      );
      expect(result).toEqual('https://sso.stg-godaddy.com?realm=jomax&path=fake-page&app=canary.gasket');
    });

    it('secureserver.net - returns fixed up url from host', () => {
      result = utils.getLoginUrlFromRequest(
        mockPcManifest.afternic,
        { realm: 'jomax', path: 'fake-page' },
        { host: 'www.secureserver.net' }
      );
      expect(result).toEqual('https://sso.secureserver.net?plid=497036&prog_id=AfterNIC&realm=jomax&path=fake-page&app=www');
    });

    it('afternic.com - returns fixed up url from host', () => {
      result = utils.getLoginUrlFromRequest(
        mockPcManifest.afternic,
        { realm: 'jomax', path: 'fake-page' },
        { host: 'afternic.com' }
      );
      expect(result).toEqual('https://sso.afternic.com?plid=497036&prog_id=AfterNIC&realm=jomax&path=fake-page&app=www');
    });

    it('afternic.com - returns fixed up url from visitor derived hostname', () => {
      result = utils.getLoginUrlFromRequest(
        mockPcManifest.afternic,
        { realm: 'jomax', path: 'fake-page' },
        { host: 'afternic.com' }
      );
      expect(result).toEqual('https://sso.afternic.com?plid=497036&prog_id=AfterNIC&realm=jomax&path=fake-page&app=www');
    });

    it('includes port if on host', () => {
      result = utils.getLoginUrlFromRequest(
        mockPcManifest.afternic,
        { realm: 'jomax', path: 'fake-page' },
        { host: 'www.secureserver.net:8443' }
      );
      expect(result).toEqual('https://sso.secureserver.net?plid=497036&prog_id=AfterNIC&realm=jomax&path=fake-page&app=www&port=8443');
    });

    it('returns null if no sso url from pcData', () => {
      const req = {
        get: () => 'bogus.stg-godaddy.com'
      };
      result = utils.getLoginUrlFromRequest(req, { realm: 'jomax' });
      expect(result).toEqual(null);
    });

    it('does not throw if request has missing host header', () => {
      const req = { get: () => null };

      expect(() =>
        utils.getLoginUrlFromRequest(req, { realm: 'jomax' })
      ).not.toThrow();
    });
  });

  describe('getLoginUrlFromWindow', () => {
    let mockWindow;

    beforeEach(() => {
      mockWindow = {
        location: { host: 'bogus.stg-godaddy.com' },
        ux: {
          data: {
            urls: {
              login: {
                href: 'https://sso.godaddy.com?realm=idp&path=%2F&app=canary.gasket'
              }
            }
          }
        }
      };
    });

    it('returns fixed up url from PresentationCentral globals', () => {
      result = utils.getLoginUrlFromWindow(mockWindow, {
        realm: 'jomax',
        path: 'fake-page'
      });
      expect(result).toEqual(
        'https://sso.stg-godaddy.com?realm=jomax&path=fake-page&app=canary.gasket'
      );
    });

    it('uses path from window location if not in params arg', () => {
      mockWindow.location.pathname = '/bogus-page';
      result = utils.getLoginUrlFromWindow(mockWindow, { realm: 'jomax' });
      expect(result).toEqual(
        'https://sso.stg-godaddy.com?realm=jomax&path=%2Fbogus-page&app=canary.gasket'
      );
    });

    it('captures hash from window location', () => {
      mockWindow.location.pathname = '/bogus-page';
      mockWindow.location.hash = '#some-hash';
      result = utils.getLoginUrlFromWindow(mockWindow, { realm: 'jomax' });
      expect(result).toEqual(
        'https://sso.stg-godaddy.com?realm=jomax&path=%2Fbogus-page%23some-hash&app=canary.gasket'
      );
    });

    it('captures query from window location', () => {
      mockWindow.location.pathname = '/bogus-page';
      mockWindow.location.hash = '#some-hash';
      mockWindow.location.search = '?some=param&another=one';
      result = utils.getLoginUrlFromWindow(mockWindow, { realm: 'jomax' });
      expect(result).toEqual(
        'https://sso.stg-godaddy.com?realm=jomax&path=%2Fbogus-page%3Fsome%3Dparam%26another%3Done%23some-hash' +
        '&app=canary.gasket'
      );
    });

    it('uses path from params if specified', () => {
      mockWindow.location.pathname = '/bogus-page';
      mockWindow.location.hash = '#some-hash';
      mockWindow.location.search = '?some=param&another=one';
      result = utils.getLoginUrlFromWindow(mockWindow, {
        realm: 'jomax',
        path: '/another-page?with=query'
      });
      expect(result).toEqual(
        'https://sso.stg-godaddy.com?realm=jomax&path=%2Fanother-page%3Fwith%3Dquery&app=canary.gasket'
      );
    });
  });

  describe('createAuthStateAction', function () {
    it('creates and action object', function () {
      expect(
        utils.createAuthStateAction('realm=jomax', { valid: true })
      ).toEqual({
        payload: {
          'realm=jomax': {
            valid: true
          }
        }
      });
    });
  });
});
