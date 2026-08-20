import { describe, it, expect } from 'vitest';
import * as utils from '../utils.js';

describe('Utils exports', function () {

  it('has expected exports', function () {

    const expected = [
      'getPrivateLabelIdFromQuery',
      'getPrivateLabelIdFromCookie',
      'getPrivateLabelId',
      'getMarket'
    ];

    const keys = Object.keys(utils);
    expect(keys).toEqual(expected);
    expect(keys).toHaveLength(expected.length);
  });
});
