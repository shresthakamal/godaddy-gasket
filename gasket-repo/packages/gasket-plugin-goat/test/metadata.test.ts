import { describe, it, expect } from 'vitest';
import { metadata } from '../src/metadata.js';

describe('metadata hook', () => {
  it('returns actions metadata', () => {
    const result = metadata({} as any, {});

    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].name).toBe('getGoat');
  });

  it('returns configurations metadata', () => {
    const result = metadata({} as any, {});

    expect(result.configurations).toHaveLength(1);
    expect(result.configurations[0].name).toBe('goat');
  });
});
