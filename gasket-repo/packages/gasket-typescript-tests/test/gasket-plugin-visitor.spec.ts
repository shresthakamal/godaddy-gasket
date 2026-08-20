
import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, Hook, MaybeAsync } from '@gasket/core';
import '@godaddy/gasket-plugin-visitor';
import type { Visitor } from '@godaddy/gasket-plugin-visitor';


describe('@godaddy/gasket-plugin-visitor', () => {

  it('adds a visitor lifecycle', () => {
    const hook: Hook<'visitor'> = (gasket: Gasket, visitor: Visitor,
      context: { req?: IncomingMessage, res?: OutgoingMessage }): MaybeAsync<Visitor> => {

      const locale: string = visitor.locale;
      const market: string = visitor.market;
      const plid: number|undefined = visitor.plid;

      return {
        ...visitor,
        locale: 'test'
      };
    };
  });
});
