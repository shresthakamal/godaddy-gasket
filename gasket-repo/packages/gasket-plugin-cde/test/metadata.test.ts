import { describe, it, expect } from 'vitest';
import metadata from '../src/metadata';
import type { Gasket } from '@gasket/core';
import type { PluginData } from '@gasket/plugin-metadata';

describe('metadata hook', () => {
  it('returns expected lifecycles and configurations', () => {
    const result = metadata({} as Partial<Gasket> as Gasket, {} as Partial<PluginData> as PluginData);
    expect(result.lifecycles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'appEvaluationEvent' })
      ])
    );
    expect(result.configurations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'cde', properties: expect.objectContaining({ enable: expect.any(Object) }) })
      ])
    );
  });

  it('merges with existing data', () => {
    const result = metadata({} as Partial<Gasket> as Gasket, { foo: 'bar' } as unknown as PluginData);
    expect((result as any).foo).toBe('bar');
  });
});
