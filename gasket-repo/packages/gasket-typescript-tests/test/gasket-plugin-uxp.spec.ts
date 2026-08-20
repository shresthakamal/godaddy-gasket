
import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, GasketConfigDefinition, Hook, MaybeAsync } from '@gasket/core';
import '@godaddy/gasket-plugin-uxp';
import type { PCParams, PCContent } from '@godaddy/gasket-plugin-uxp';
import { GasketRequest } from '@gasket/request';


describe('@godaddy/gasket-plugin-uxp', () => {
  it('adds a presentationCentral section to Gasket config', () => {
    const config: GasketConfigDefinition = {
      plugins: [],
      presentationCentral: {
        params: {
          app: 'my-app',
          header: 'internal-header',
          uxcore: 2200
        }
      }
    };
  });

  it('adds a presentationCentral lifecycle', () => {
    const hook: Hook<'presentationCentral'> = (gasket: Gasket, params: PCParams,
      context: { req?: GasketRequest }): MaybeAsync<void> => {
      const { req } = context;
      params.privateLabel = 3490;
      params.market = 'nl-NL';
      // @ts-expect-error - params.bogus is not typed
      params.bogus = true;
    };
  });


  it('adds a headerContent lifecycle', () => {
    const handler: Hook<'headerContent'> = (gasket: Gasket, content: PCContent,
      context: { req?: IncomingMessage, res?: OutgoingMessage }): MaybeAsync<PCContent> => {
      const { req, res } = context;
      return {
        ...content,
        data: {
          ...content.data,
          assets: {
            css: [
              content.data.assets?.css,
              '<link rel="stylesheet" href="https://cdn.com/some/fancy.css" media="all"/>'
            ].join(''),
            js: 'test',
            prefetch: 'test',
            preload: 'test'
          }
        }
      };
    };
  });
});
