import { vi, describe, expect, it } from 'vitest';
import * as SwitchboardModule from '@switchboard/client';
import { makeGasket } from '@gasket/core';
import '@gasket/plugin-https';
import plugin from '../src/index.js';

vi.spyOn(console, 'warn').mockImplementation(() => {
});

vi.mock('@switchboard/client');
const { destroyClient } = vi.mocked(SwitchboardModule);

describe('The onSignal lifecycle hook', () => {
  it('destroys the switchboard client', async () => {
    const gasket = makeGasket({ plugins: [plugin] });
    gasket.config = {
      switchboard: {
        callingService: ''
      }
    } as any;

    await gasket.exec('onSignal');

    expect(destroyClient).toHaveBeenCalledWith('gasket');
  });
});
