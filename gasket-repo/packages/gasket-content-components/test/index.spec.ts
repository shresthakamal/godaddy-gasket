import { describe, it, expect } from 'vitest';
import * as exported from '../src/index';

describe('index', function () {
  it('has expected exports', function () {
    const expected = [
      'toReactNode',
      'toFlattenedContent',
      'withContentParamsProvider',
      'ContentParamsProvider',
      'useContentParams'
    ];

    expected.forEach(function (name) {
      expect(exported).toHaveProperty(name);
    });

    expect(Object.keys(exported).length).toBeGreaterThanOrEqual(expected.length);
  });
});
