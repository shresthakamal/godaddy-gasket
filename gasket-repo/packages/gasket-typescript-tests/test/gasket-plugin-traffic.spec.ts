import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, it } from 'vitest';
import type { Gasket, Hook, MaybeAsync } from '@gasket/core';
import type { TrafficOptions } from '@godaddy/gasket-plugin-traffic';

describe('@godaddy/gasket-plugin-traffic', () => {

  it('adds a trafficDataLayer lifecycle', () => {
    const hook: Hook<'trafficDataLayer'> = (
      gasket: Gasket,
      context: {
        req?: IncomingMessage,
        res?: ServerResponse<IncomingMessage>
      }
    ): MaybeAsync<TrafficOptions> => {
      return {
        'app': 'example-app',
        'tcc.spa': true,
        // @ts-expect-error - context.bogus is not typed
        'bogus': true
      };
    };
  });

  it('adds a tccData lifecycle', () => {
    const hook: Hook<'tccData'> = (
      gasket: Gasket,
      data: TrafficOptions,
      context: {
        req?: IncomingMessage
      }
    ): MaybeAsync<TrafficOptions> => {
      const { server, ...rest } = data;
      return {
        ...rest,
        app: 'example-app'
      };
    };
  });
});
