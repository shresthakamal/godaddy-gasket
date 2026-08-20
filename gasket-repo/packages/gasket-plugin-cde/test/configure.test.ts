import configure from '../src/configure';
import type { Gasket, GasketConfig } from '@gasket/core';

describe('configure hook', () => {
  it('sets enable: true by default', () => {
    const result = configure({} as Partial<Gasket> as Gasket, {} as Partial<GasketConfig> as GasketConfig);
    expect(result.cde.enable).toBe(true);
  });

  it('merges config.cde options', () => {
    const result = configure(
      {} as Partial<Gasket> as Gasket,
      { cde: { foo: 'bar', enable: false } } as unknown as GasketConfig
    );
    expect((result.cde as any).foo).toBe('bar');
    expect(result.cde.enable).toBe(false);
  });

  it('does not overwrite other config properties', () => {
    const result = configure(
      {} as Partial<Gasket> as Gasket,
      { other: 123 } as unknown as GasketConfig
    );
    expect((result as any).other).toBe(123);
  });
});
