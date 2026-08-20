import { describe, it, expect, vi } from 'vitest';
import { configure } from '../src/configure.js';

function makeGasket(actions: Record<string, any> = {}) {
  return { actions, config: {} } as any;
}

describe('configure hook', () => {
  it('passes through goat config', () => {
    const gasket = makeGasket();
    const result = configure(gasket, { goat: { baseUrl: 'https://api.example.com', appId: '1', projectId: '2' } } as any);

    expect(result.goat!.baseUrl).toBe('https://api.example.com');
    expect(result.goat!.appId).toBe('1');
    expect(result.goat!.projectId).toBe('2');
  });

  it('accepts ids in their natural numeric form', () => {
    const gasket = makeGasket();
    const result = configure(gasket, {
      goat: { baseUrl: 'https://api.example.com', appId: 7774, projectId: 6554 }
    } as any);

    expect(result.goat!.appId).toBe(7774);
    expect(result.goat!.projectId).toBe(6554);
  });

  it('throws when required config is missing', () => {
    const gasket = makeGasket();
    expect(() => configure(gasket, {} as any))
      .toThrow('GOAT config error - missing required config (baseUrl)');
  });
});
