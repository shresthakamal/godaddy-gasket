import { expect } from 'vitest';
import * as exported from '../src/index.js';

describe('index', () => {

  it('has expected exports', () => {
    const expected = [
      'App',
      'createApp',
      'withPageEnhancers',
      'reportWebVitals',
      'VisitorLink'
    ];

    const exports = Object.keys(exported);
    expect(exports).toEqual(expected);
    expect(exports).toHaveLength(expected.length);
  });
});

