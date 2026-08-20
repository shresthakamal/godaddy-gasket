import { describe, it, expect } from 'vitest';
import pluginIndex from '../lib/index.js';

describe('HCS Gasket Plugin', () => {
  it('Expect the plugin name to be same as module', () => {
    expect(pluginIndex.name).toEqual('@godaddy/gasket-plugin-hcs');
  });

  it('Expect the plugin to have these hooks defined', () => {
    expect(pluginIndex).toHaveProperty('hooks');
    expect(pluginIndex.hooks).toMatchObject({
      create: {
        handler: expect.any(Function),
        timing: { before: ['@gasket/plugin-intl'] }
      },
      express: expect.any(Object),
      metadata: expect.any(Function)
    });
  });
});
