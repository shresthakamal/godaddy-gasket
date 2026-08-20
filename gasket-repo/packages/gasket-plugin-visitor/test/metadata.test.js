import { describe, it, expect } from 'vitest';
import metadata from '../lib/metadata.js';

describe('metadata', () => {

  it('has actions metadata', () => {
    const meta = metadata({}, {});
    expect(meta.actions.map(i => i.name)).toEqual([
      'getVisitor'
    ]);
  });

  it('has lifecycles metadata', () => {
    const meta = metadata({}, {});
    expect(meta.lifecycles.map(i => i.name)).toEqual([
      'visitor'
    ]);
  });

  it('has configurations metadata', () => {
    const meta = metadata({}, {});
    expect(meta.configurations.map(i => i.name)).toEqual([
      'visitor.priority'
    ]);
  });
});
