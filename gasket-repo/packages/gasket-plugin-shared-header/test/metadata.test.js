import { describe, it, expect } from 'vitest';
import metadata from '../lib/metadata.js';

describe('metadata', () => {

  it('has actions metadata', () => {
    // @ts-expect-error - minimal mock for testing
    const meta = metadata({}, {});
    // @ts-expect-error - accessing metadata property
    expect(meta.actions.map(i => i.name)).toEqual([
      'getSharedHeader'
    ]);
  });

  it('has lifecycles metadata', () => {
    // @ts-expect-error - minimal mock for testing
    const meta = metadata({}, {});
    // @ts-expect-error - accessing metadata property
    expect(meta.lifecycles.map(i => i.name)).toEqual([
      'sharedHeader'
    ]);
  });
});
