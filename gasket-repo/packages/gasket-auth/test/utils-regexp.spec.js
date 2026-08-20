import * as utils from '../src/utils';

/**
 * Test RegExp against expected pass/fail cases
 * @param {RegExp} re - RegExp
 * @param {string[]} expectedToPass - array of strings expected to pass
 * @param {string[]} expectedToFail - array of strings expected to fail
 */
function testRegExp(re, expectedToPass, expectedToFail) {
  it('has expected passes', function () {
    expectedToPass.forEach((str) => {
      expect(re.test(str)).toBe(true);
    });
  });

  it('has expected failures', function () {
    expectedToFail.forEach((str) => {
      expect(re.test(str)).toBe(false);
    });
  });
}

describe('Utils RegExp', function () {
  describe('reBaseDomain', function () {
    testRegExp(
      utils.reBaseDomain,
      [
        'local.gasket.dev-godaddy.com',
        'local.gasket.dev-godaddy.com:1234',
        'local.gasket.test-mediatemple.net',
        '123-reg.co.uk'
      ],
      ['localhost', '192.168.1.1', '0.0.0.0:1234']
    );

    it('captures expected part', function () {
      [
        ['www.godaddy.com', 'www', 'godaddy.com'],
        ['local.gasket.dev-godaddy.com', 'local.gasket', 'dev-godaddy.com'],
        [
          'local.gasket.int.dev-godaddy.com:1234',
          'local.gasket.int',
          'dev-godaddy.com'
        ],
        ['www.mediatemple.net', 'www', 'mediatemple.net'],
        [
          'local.gasket.test-mediatemple.net',
          'local.gasket',
          'test-mediatemple.net'
        ],
        [
          'local.gasket.test-mediatemple.net:1234',
          'local.gasket',
          'test-mediatemple.net'
        ],
        ['local.gasket.123-reg.co.uk', 'local.gasket', '123-reg.co.uk'],
        ['some.place.123-reg.co.uk:8080', 'some.place', '123-reg.co.uk']
      ].forEach(([host, expectedSub, expectedBase]) => {
        const match = host.match(utils.reBaseDomain);
        expect(match).toHaveProperty('groups');
        expect(match.groups.sub).toEqual(expectedSub);
        expect(match.groups.base).toEqual(expectedBase);
      });
    });
  });

  describe('reTransformableUrl', function () {
    testRegExp(
      utils.reTransformableUrl,
      [
        'https://sso.godaddy.com',
        'https://sso.dev-godaddy.com',
        'https://www.godaddy.com/offers/some-product/sso',
        'https://www.afternic.com/login'
      ],
      [
        'localhost',
        '192.168.1.1',
        '0.0.0.0:1234',
        'https://www.godaddy.com/some-page',
        'https://www.newbrand.com/login',
        'https://www.newbrand.com/sso'
      ]
    );
  });
});
