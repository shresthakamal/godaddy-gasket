import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { assembleVisitor } from '../../lib/utils/visitor.js';
import { Atlas } from '@godaddy/atlas';

describe('utils', function () {

  describe('getVisitor', function () {
    let req, atlas;

    beforeAll(async () => {
      atlas = await Atlas.builder('test')
        .setNoUpdate()
        .build();
    });

    beforeEach(async () => {
      req = {
        headers: {
          host: 'localhost:3000'
        }
      };
    });

    describe('debug disabled', () => {
      it('does not include debug property when disabled', () => {
        const visitor = assembleVisitor(req, atlas, false);
        expect(visitor).not.toHaveProperty('debug');
      });
    });

    describe('hostname', () => {
      it('assigns from x-dsa-host header', () => {
        req.headers = { 'x-dsa-host': 'example.com' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('example.com');
        expect(visitor.hostname).toBe('example.com');
        expect(visitor.debug.hostFrom).toBe('x-dsa-host header');
        expect(visitor.debug.hostnameFrom).toBe('x-dsa-host header');
      });

      it('removes the port from the x-dsa-host header', () => {
        req.headers = { 'x-dsa-host': 'example.com:8080' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('example.com:8080');
        expect(visitor.hostname).toBe('example.com');
        expect(visitor.debug.hostFrom).toBe('x-dsa-host header');
        expect(visitor.debug.hostnameFrom).toBe('x-dsa-host header');
      });

      it('assigns from x-forwarded-host header', () => {
        req.headers = { 'x-forwarded-host': 'forwarded.com:8080' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('forwarded.com:8080');
        expect(visitor.hostname).toBe('forwarded.com');
        expect(visitor.debug.hostFrom).toBe('x-forwarded-host header');
        expect(visitor.debug.hostnameFrom).toBe('x-forwarded-host header');
      });

      it('removes the port from the x-forwarded-host header', () => {
        req.headers = { 'x-forwarded-host': 'origin-sso-ui.dev-123-reg.co.uk:3000' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('origin-sso-ui.dev-123-reg.co.uk:3000');
        expect(visitor.hostname).toBe('origin-sso-ui.dev-123-reg.co.uk');
        expect(visitor.debug.hostFrom).toBe('x-forwarded-host header');
        expect(visitor.debug.hostnameFrom).toBe('x-forwarded-host header');
      });

      it('assigns from host header', () => {
        req.headers = { host: 'host.com:8080' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('host.com:8080');
        expect(visitor.hostname).toBe('host.com');
        expect(visitor.debug.hostFrom).toBe('host header');
        expect(visitor.debug.hostnameFrom).toBe('host header');
      });

      it('prioritizes x-dsa-host over other headers', () => {
        req.headers = {
          'x-dsa-host': 'priority.com',
          'x-forwarded-host': 'forwarded.com',
          'host': 'host.com'
        };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('priority.com');
        expect(visitor.hostname).toBe('priority.com');
        expect(visitor.debug.hostFrom).toBe('x-dsa-host header');
        expect(visitor.debug.hostnameFrom).toBe('x-dsa-host header');
      });

      it('prioritizes x-forwarded-host over host header', () => {
        req.headers = {
          'x-forwarded-host': 'forwarded.com',
          'host': 'host.com'
        };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('forwarded.com');
        expect(visitor.hostname).toBe('forwarded.com');
        expect(visitor.debug.hostFrom).toBe('x-forwarded-host header');
        expect(visitor.debug.hostnameFrom).toBe('x-forwarded-host header');
      });

      it('handles array headers by taking first value', () => {
        req.headers = { 'x-dsa-host': ['first.com', 'second.com'] };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.host).toBe('first.com');
        expect(visitor.hostname).toBe('first.com');
        expect(visitor.debug.hostFrom).toBe('x-dsa-host header');
        expect(visitor.debug.hostnameFrom).toBe('x-dsa-host header');
      });
    });

    describe('plid', () => {
      it('assigns from plid query parameter', () => {
        req.query = { plid: '123' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(123);
        expect(visitor.debug.plidFrom).toBe('query');
      });

      it('assigns from pl_id query parameter', () => {
        req.query = { pl_id: '123' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(123);
        expect(visitor.debug.plidFrom).toBe('query');
      });

      it('assigns from privateLabelId query parameter', () => {
        req.query = { privateLabelId: '123' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(123);
        expect(visitor.debug.plidFrom).toBe('query');
      });

      it('assigns from privatelabelid query parameter', () => {
        req.query = { privatelabelid: '123' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(123);
        expect(visitor.debug.plidFrom).toBe('query');
      });

      it('assigns from cookies', () => {
        req.cookies = { privateLabelId: '456' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(456);
        expect(visitor.debug.plidFrom).toBe('cookies');
      });

      it('assigns from info_idp cookie', () => {
        req.cookies = { info_idp: JSON.stringify({ auth: 'basic', plid: 789 }) };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(789);
        expect(visitor.debug.plidFrom).toBe('cookies');
      });

      it('defaults to NoBrand when no plid or brand found', () => {
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(3153);
        expect(visitor.debug.plidFrom).toBe('default to NoBrand for unknown hostname with no plid');
      });

      it('assign from domain brand', () => {
        req.headers = { host: '123-reg.co.uk' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(587240);
        expect(visitor.debug.plidFrom).toBe('default from domain brand');
      });

      it('overrides plid based on domain brand', () => {
        req.query = { plid: '456' };
        req.headers = { host: 'godaddy.com' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(1);
        expect(visitor.debug.plidFrom).toBe('override (from query) from domain brand');
      });

      it('trusts derived plid for secureserver.net brand', () => {
        req.query = { plid: '456' };
        req.headers = { host: 'secureserver.net' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(456);
        expect(visitor.debug.plidFrom).toBe('query');
      });

      it('default to NoBrand when no plid for secureserver.net', () => {
        req.headers = { host: 'secureserver.net' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(3153);
        expect(visitor.debug.plidFrom).toBe('default to NoBrand for secureserver.net with no plid');
      });

      it('prioritizes query over cookies', () => {
        req.query = { plid: '123' };
        req.cookies = { privateLabelId: '456' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.plid).toBe(123);
        expect(visitor.debug.plidFrom).toBe('query');
      });
    });

    describe('market', () => {
      it('assigns from x-market-id header', () => {
        req.headers = { 'x-market-id': 'fr-FR' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.market).toBe('fr-FR');
        expect(visitor.debug.marketFrom).toBe('x-market-id header');
      });

      it('assigns from cookies', () => {
        req.cookies = { market: 'es-ES' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.market).toBe('es-ES');
        expect(visitor.debug.marketFrom).toBe('market cookie');
      });

      it('assigns from query', () => {
        req.query = { market: 'de-DE' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.market).toBe('de-DE');
        expect(visitor.debug.marketFrom).toBe('query param');
      });

      it('assigns from accept-language matching market locale', () => {
        req.headers = { 'accept-language': 'fr-CA,en;q=0.9' };
        const visitor = assembleVisitor(req, atlas, true);

        // We know market was negotiated, not language, because the Atlas fallback language for 'fr' is 'fr-FR'
        expect(visitor.market).toBe('fr-CA');
        expect(visitor.debug.marketFrom).toBe('accept-language market');
      });

      it('assigns from accept-language matching language', () => {
        req.headers = { 'accept-language': 'fr,en;q=0.9' };
        const visitor = assembleVisitor(req, atlas, true);

        // We know language was negotiated because the Atlas fallback language for 'fr' is 'fr-FR'
        expect(visitor.market).toBe('fr-FR');
        expect(visitor.debug.marketFrom).toBe('accept-language language');
      });

      it('defaults to brand default market', () => {
        // Fake language header that does not match any market
        req.headers = { 'accept-language': 'zz;q=0.9' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.market).toBe('en-US');
        expect(visitor.debug.marketFrom).toBe('brand default market');
      });

      it('prioritizes cookie over header', () => {
        req.headers = {
          'x-market-id': 'fr-FR',
          'accept-language': 'es,en;q=0.9'
        };
        req.cookies = { market: 'de-DE' };
        req.query = { market: 'it-IT' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.market).toBe('de-DE');
        expect(visitor.debug.marketFrom).toBe('market cookie');
      });

      it('falls back to header when no cookie', () => {
        req.headers = {
          'x-market-id': 'fr-FR',
          'accept-language': 'es,en;q=0.9'
        };
        req.query = { market: 'it-IT' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.market).toBe('fr-FR');
        expect(visitor.debug.marketFrom).toBe('x-market-id header');
      });
    });

    describe('locale', () => {
      it('assigns from market translation locale', () => {
        req.headers = { 'x-market-id': 'fr-BE' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.locale).toBe('fr-FR');
        expect(visitor.debug.localeFrom).toBe('market translation locale');
      });

      it('uses default market translation locale', () => {
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.locale).toBe('en-US');
        expect(visitor.debug.localeFrom).toBe('market translation locale');
      });
    });

    describe('currency', () => {
      it('assigns from x-currency-id header', () => {
        req.headers = { 'x-currency-id': 'EUR' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('EUR');
        expect(visitor.debug.currencyFrom).toBe('x-currency-id header');
      });

      it('assigns from cookie when header not present', () => {
        req.cookies = { currency: 'GBP' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('GBP');
        expect(visitor.debug.currencyFrom).toBe('currency cookie');
      });

      it('assigns from query when header and cookie not present', () => {
        req.query = { currency: 'CAD' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('CAD');
        expect(visitor.debug.currencyFrom).toBe('query param');
      });

      it('defaults to market default currency', () => {
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('USD');
        expect(visitor.debug.currencyFrom).toBe('market default currency');
      });

      it('prioritizes cookie over header', () => {
        req.headers = { 'x-currency-id': 'EUR' };
        req.cookies = { currency: 'GBP' };
        req.query = { currency: 'CAD' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('GBP');
        expect(visitor.debug.currencyFrom).toBe('currency cookie');
      });

      it('falls back to header when no cookie', () => {
        req.headers = { 'x-currency-id': 'EUR' };
        req.query = { currency: 'CAD' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('EUR');
        expect(visitor.debug.currencyFrom).toBe('x-currency-id header');
      });

      it('prioritizes cookies over other sources', () => {
        req.cookies = { currency: 'GBP' };
        req.query = { currency: 'CAD' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('GBP');
        expect(visitor.debug.currencyFrom).toBe('currency cookie');
      });

      it('uses market-specific default currency', () => {
        req.headers = { 'x-market-id': 'fr-FR' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.currency).toBe('EUR');
        expect(visitor.debug.currencyFrom).toBe('market default currency');
      });
    });

    describe('visitorGuid', () => {
      it('assigns visitorGuid from X-Visitor-Id header', () => {
        req.headers = { 'x-visitor-id': 'header-visitor-123' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('header-visitor-123');
        expect(visitor.visitorId).toBe('header-visitor-123');
        expect(visitor.debug.visitorGuidFrom).toBe('X-Visitor-Id header');
      });

      it('prioritizes X-Visitor-Id header over visitor cookie', () => {
        req.headers = { 'x-visitor-id': 'header-visitor-123' };
        req.cookies = { visitor: 'vid=cookie-visitor-456' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('header-visitor-123');
        expect(visitor.visitorId).toBe('header-visitor-123');
        expect(visitor.debug.visitorGuidFrom).toBe('X-Visitor-Id header');
      });

      it('assigns visitorGuid from visitor cookie when header not present', () => {
        req.cookies = { visitor: 'vid=123456789' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('123456789');
        expect(visitor.visitorId).toBe('123456789');
        expect(visitor.debug.visitorGuidFrom).toBe('visitor cookie');
      });

      it('handles URL-encoded visitor cookie', () => {
        req.cookies = { visitor: 'vid%3D123456789' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('123456789');
        expect(visitor.visitorId).toBe('123456789');
        expect(visitor.debug.visitorGuidFrom).toBe('visitor cookie');
      });

      it('does not assign visitorGuid when neither header nor cookie present', () => {
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBeUndefined();
        expect(visitor.visitorId).toBeUndefined();
        expect(visitor.debug.visitorGuidFrom).toBeUndefined();
      });

      it('handles empty X-Visitor-Id header and falls back to cookie', () => {
        req.headers = { 'x-visitor-id': '' };
        req.cookies = { visitor: 'vid=123456789' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('123456789');
        expect(visitor.visitorId).toBe('123456789');
        expect(visitor.debug.visitorGuidFrom).toBe('visitor cookie');
      });

      it('handles X-Visitor-Id header with different casing', () => {
        // Note: Node.js automatically converts header names to lowercase
        req.headers = { 'x-visitor-id': 'header-case-123' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('header-case-123');
        expect(visitor.visitorId).toBe('header-case-123');
        expect(visitor.debug.visitorGuidFrom).toBe('X-Visitor-Id header');
      });

      it('handles null headers and falls back to cookie', () => {
        req.headers = {};
        req.cookies = { visitor: 'vid=123456789' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('123456789');
        expect(visitor.visitorId).toBe('123456789');
        expect(visitor.debug.visitorGuidFrom).toBe('visitor cookie');
      });

      it('handles missing headers property and falls back to cookie', () => {
        delete req.headers;
        req.cookies = { visitor: 'vid=123456789' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitorGuid).toBe('123456789');
        expect(visitor.visitorId).toBe('123456789');
        expect(visitor.debug.visitorGuidFrom).toBe('visitor cookie');
      });
    });

    describe('sessionId', () => {
      it('assigns from pathway cookie', () => {
        req.cookies = { pathway: 'session123' };
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitGuid).toBe('session123');
        expect(visitor.sessionId).toBe('session123');
        expect(visitor.debug.sessionIdFrom).toBe('pathway cookie');
      });

      it('does not assign sessionId when cookie not present', () => {
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor.visitGuid).toBeUndefined();
        expect(visitor.sessionId).toBeUndefined();
        expect(visitor.debug.sessionIdFrom).toBeUndefined();
      });
    });

    describe('complete visitor object', () => {
      it('creates complete visitor with all properties including X-Visitor-Id header', () => {
        req.headers = {
          'x-dsa-host': 'example.com',
          'x-market-id': 'fr-FR',
          'x-currency-id': 'EUR',
          'x-visitor-id': 'header-visitor-123'
        };
        req.query = { plid: '123' };
        req.cookies = {
          visitor: 'vid=cookie-visitor-456',
          pathway: 'session456'
        };

        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor).toEqual({
          host: 'example.com',
          hostname: 'example.com',
          plid: 123,
          market: 'fr-FR',
          locale: 'fr-FR',
          currency: 'EUR',
          visitorGuid: 'header-visitor-123',
          visitorId: 'header-visitor-123',
          visitGuid: 'session456',
          sessionId: 'session456',
          debug: {
            hostFrom: 'x-dsa-host header',
            hostnameFrom: 'x-dsa-host header',
            plidFrom: 'query',
            marketFrom: 'x-market-id header',
            localeFrom: 'market translation locale',
            currencyFrom: 'x-currency-id header',
            visitorGuidFrom: 'X-Visitor-Id header',
            sessionIdFrom: 'pathway cookie'
          }
        });
      });

      it('creates complete visitor with all properties using cookie fallback', () => {
        req.headers = {
          'x-dsa-host': 'example.com',
          'x-market-id': 'fr-FR',
          'x-currency-id': 'EUR'
        };
        req.query = { plid: '123' };
        req.cookies = {
          visitor: 'vid=visitor123',
          pathway: 'session456'
        };

        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor).toEqual({
          host: 'example.com',
          hostname: 'example.com',
          plid: 123,
          market: 'fr-FR',
          locale: 'fr-FR',
          currency: 'EUR',
          visitorGuid: 'visitor123',
          visitorId: 'visitor123',
          visitGuid: 'session456',
          sessionId: 'session456',
          debug: {
            hostFrom: 'x-dsa-host header',
            hostnameFrom: 'x-dsa-host header',
            plidFrom: 'query',
            marketFrom: 'x-market-id header',
            localeFrom: 'market translation locale',
            currencyFrom: 'x-currency-id header',
            visitorGuidFrom: 'visitor cookie',
            sessionIdFrom: 'pathway cookie'
          }
        });
      });

      it('creates minimal visitor with defaults only', () => {
        const visitor = assembleVisitor(req, atlas, true);

        expect(visitor).toEqual({
          host: 'localhost:3000',
          hostname: 'localhost',
          plid: 3153,
          market: 'en-US',
          locale: 'en-US',
          currency: 'USD',
          debug: {
            hostFrom: 'host header',
            hostnameFrom: 'host header',
            plidFrom: 'default to NoBrand for unknown hostname with no plid',
            marketFrom: 'brand default market',
            localeFrom: 'market translation locale',
            currencyFrom: 'market default currency'
          }
        });
      });
    });
  });

  describe('priority config', function () {
    let req, atlas;

    beforeAll(async () => {
      atlas = await Atlas.builder('test').setNoUpdate().build();
    });

    beforeEach(() => {
      req = {
        headers: {
          'host': 'host.example.com',
          'x-dsa-host': 'dsa.example.com',
          'x-forwarded-host': 'forwarded.example.com'
        }
      };
    });

    it('reorders hostname resolvers when priority is configured', () => {
      const visitor = assembleVisitor(req, atlas, true, {
        hostname: ['x-forwarded']
      });
      expect(visitor.hostname).toBe('forwarded.example.com');
      expect(visitor.debug.hostnameFrom).toBe('x-forwarded-host header');
    });

    it('uses default order when no priority is configured for that field', () => {
      const visitor = assembleVisitor(req, atlas, true, {});
      expect(visitor.hostname).toBe('dsa.example.com');
      expect(visitor.debug.hostnameFrom).toBe('x-dsa-host header');
    });

    it('runs remaining default resolvers after configured priority keys', () => {
      // Only 'host' header is present. Priority lists x-forwarded first,
      // but it doesn't match — fall through to x-dsa-host (also absent),
      // then host.
      req = { headers: { host: 'only-host.example.com' } };
      const visitor = assembleVisitor(req, atlas, true, {
        hostname: ['x-forwarded']
      });
      expect(visitor.hostname).toBe('only-host.example.com');
      expect(visitor.debug.hostnameFrom).toBe('host header');
    });

    it('treats an empty priority array as no priority for that field', () => {
      const visitor = assembleVisitor(req, atlas, true, { hostname: [] });
      expect(visitor.hostname).toBe('dsa.example.com');
    });

    it('reorders plid resolvers (hostname first beats query)', () => {
      // Use a hostname known to atlas test fixtures and a query plid that differs.
      // The test atlas exposes a brand for 'godaddy.com'-style domains; using one
      // ensures findBrandByDomain returns a brand. Replace 'godaddy.com' if the
      // test atlas uses a different fixture.
      req = {
        headers: { host: 'godaddy.com' },
        query: { plid: '1' }
      };
      const visitor = assembleVisitor(req, atlas, true, {
        plid: ['hostname']
      });
      expect(visitor.debug.plidFrom).toMatch(/domain brand/);
    });

    it('reorders market resolvers (query first beats cookie)', () => {
      req = {
        headers: { host: 'host.example.com' },
        cookies: { market: 'en-US' },
        query: { market: 'de-DE' }
      };
      const visitor = assembleVisitor(req, atlas, true, {
        market: ['query']
      });
      expect(visitor.debug.marketFrom).toBe('query param');
    });

    it('reorders currency resolvers (query first beats cookie)', () => {
      req = {
        headers: { host: 'host.example.com' },
        cookies: { currency: 'USD' },
        query: { currency: 'EUR' }
      };
      const visitor = assembleVisitor(req, atlas, true, {
        currency: ['query']
      });
      expect(visitor.debug.currencyFrom).toBe('query param');
    });

    it('reorders visitorGuid resolvers (cookie first beats header)', () => {
      req = {
        headers: { 'host': 'host.example.com', 'x-visitor-id': 'header-guid' },
        cookies: { visitor: 'vid=cookie-guid' }
      };
      const visitor = assembleVisitor(req, atlas, true, {
        visitorGuid: ['cookie']
      });
      expect(visitor.visitorGuid).toBe('cookie-guid');
    });
  });
});
