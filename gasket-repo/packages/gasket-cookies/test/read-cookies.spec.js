import * as utils from '../src/read-cookies';

describe('ReadCookies', function () {
  const defaultStore = {
    getState: () => { return {}; }
  };
  describe('#readCookies', function () {
    it('should return cookies in json object from request', function () {
      const context = {
        req: {
          headers: {
            cookie: 'market=aa-AA; custom_cookie=something; auth_idp=auth-token; info_idp=%7B%22firstname%22%3A%20' +
            '%22Test%22%2C%20%22typ' +
            '%22%3A%20%22idp%22%2C%20%22info_shopperId%22%3A%20%228ff%22%2C%20%22plid%22%3A%20%221%22%2C%20%22' +
            'plt%22%3A%201%2C%20%22lastname%22%3A%20%22A%22%2C%20%22jti%22%3A%20%22wO8yn30D6vS_O9uhcRmaRA%22%2C' +
            '%20%22auth%22%3A%20%22basic%22%2C%20%22username%22%3A%20%221929029%22%2C%20%22iat%22%3A%201526918958' +
            '%2C%20%22info_cid%22%3A%20%226400d62c-0f41-4e0f-999a-534a39ffb7c6%22%7D'
          }
        },
        store: {
          getState: () => {
            return {
              cookieWhitelist: ['custom_cookie', 'info_idp']
            };
          }
        }
      };
      const result = utils.readCookies(context.req, context.store);
      expect(result).toEqual({
        market: 'aa-AA',
        info_idp: {
          auth: 'basic',
          firstname: 'Test',
          iat: 1526918958,
          info_cid: '6400d62c-0f41-4e0f-999a-534a39ffb7c6',
          info_shopperId: '8ff',
          jti: 'wO8yn30D6vS_O9uhcRmaRA',
          lastname: 'A',
          plid: '1',
          plt: 1,
          typ: 'idp',
          username: '1929029'
        },
        custom_cookie: 'something'
      });
    });
    describe('document cookie', function () {
      beforeEach(() => {
        document.cookie = 'market=bb-BB';
      });
      afterEach(() => {
        document.cookie = '';
      });
      it('should return cookies in json object from document', function () {
        const context = {};
        const result = utils.readCookies(context.req, defaultStore);
        expect(result).toEqual({
          market: 'bb-BB'
        });
      });
    });
  });
  describe('#loadCookies', function () {
    const req = {
      headers: {
        cookie: 'market=aa-AA; auth_idp=auth-token'
      }
    };

    it('should read cookies from request and dispatch action', function () {
      const dispatchStub = jest.fn();
      const action = utils.loadCookies(req, defaultStore);
      action(dispatchStub);
      expect(dispatchStub.mock.calls).toHaveLength(1);
    });
  });
  describe('#selectCookie', function () {
    const mockMarket = 'mo-MK';
    const mockInfoIdp = 'some-mock-idp-token';
    const mockState = {
      gasket_cookies: {
        market: mockMarket,
        info_idp: mockInfoIdp
      }
    };

    it('should return proper market id from the cookie', function () {
      expect(utils.selectCookie(mockState, 'market')).toEqual(mockMarket);
    });

    it('should return undefined for auth token from the cookie', function () {
      expect(utils.selectCookie(mockState, 'auth_idp')).toBeUndefined;
    });

    it('should only return existing values', function () {
      expect(utils.selectCookie(mockState, 'random')).toEqual(void 0);
      expect(utils.selectCookie(mockState, 'random')).not.toEqual('');
    });
  });
  describe('#cookieSelectors', function () {
    const mockMarket = 'mo-MK';
    const mockInfoIdp = 'some-mock-idp-token';
    const mockState = {
      gasket_cookies: {
        market: mockMarket,
        info_idp: mockInfoIdp
      }
    };

    it('should return proper market id from the cookie', function () {
      expect(utils.cookieSelectors.market(mockState)).toEqual(mockMarket);
    });
    it('should NOT return info_idp as it is no longer in the default whitelist', function () {
      expect(utils.cookieSelectors.info_idp).toBeUndefined;
    });
  });
  describe('#removeExtraCookies', function () {
    it('removes any cookie that has not been included in the default white list', function () {
      const cookies = {
        extra_1: 'extra_1',
        currency: 'currency',
        info_idp: 'info_idp',
        info_jomax: 'info_jomax',
        market: 'market',
        extra_2: 'extra_2'
      };
      const result = utils.removeExtraCookies(cookies);
      expect(result).toEqual({
        currency: 'currency',
        market: 'market'
      });
    });
    it('doesnt remove the cookies that are list in the custom whitelist', function () {
      const cookies = {
        extra_1: 'extra_1',
        currency: 'currency',
        extra_2: 'extra_2'
      };
      const result = utils.removeExtraCookies(cookies, ['extra_1', 'extra_2']);
      expect(result).toEqual({
        extra_1: 'extra_1',
        currency: 'currency',
        extra_2: 'extra_2'
      });
    });
    it('doesnt let you add cookies through custom whitelist if they are black listed', function () {
      const cookies = {
        extra_1: 'extra_1',
        currency: 'currency',
        auth_idp: 'auth_idp'
      };
      const result = utils.removeExtraCookies(cookies, ['extra_1', 'auth_idp']);
      expect(result).toEqual({
        extra_1: 'extra_1',
        currency: 'currency'
      });
    });
  });
  describe('#parseCookies', function () {
    it('parses the json cookies into json objects', function () {
      const cookies = {
        market: 'aa-AA',
        info_idp: '{"auth":"basic","firstname":"Test"}',
        info_jomax: '{"auth":"jomax","username":"Test"}',
        custom_cookie_1: '{"some":"thing"}',
        custom_cookie_2: 'some thing'
      };
      const result = utils.parseCookies(cookies);
      expect(result).toHaveProperty('market', expect.any(String));
      expect(result).toHaveProperty('info_idp', expect.any(Object));
      expect(result).toHaveProperty('info_jomax', expect.any(Object));
      expect(result).toHaveProperty('custom_cookie_1', expect.any(Object));
      expect(result).toHaveProperty('custom_cookie_2', expect.any(String));
    });
  });
});
