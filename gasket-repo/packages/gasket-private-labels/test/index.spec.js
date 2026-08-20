import * as exported from '../lib/index.js';

describe('index', function () {
  it('has expected exports', () => {
    const expected = [
      'getEnvPlids',
      'getPlidFromHost',
      'getPlidFromDomain',
      'getProdPlidFromOte',
      'isPrivateLabelHost',
      'isSecureServerHost'
    ];

    const exports = Object.keys(exported);
    expect(exports).toEqual(expected);
    expect(exports).toHaveLength(expected.length);
  });
});
