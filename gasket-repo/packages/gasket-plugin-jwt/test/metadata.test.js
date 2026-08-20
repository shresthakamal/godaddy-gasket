import { describe, it, expect } from 'vitest';
import metadata from '../lib/metadata.js';

describe('metadata', () => {

  it('has the expected actions', () => {
    // @ts-expect-error - minimal mock for testing
    const meta = metadata({}, {});
    // @ts-expect-error - custom config property
    expect(meta.actions.map(i => i.name)).toEqual([
      'getJwt'
    ]);
  });
});
