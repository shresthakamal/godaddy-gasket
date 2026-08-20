import type { IncomingMessage, ServerResponse } from 'http';
import type { Gasket, GasketConfigDefinition, Hook, MaybeAsync } from '@gasket/core';
import '@godaddy/gasket-plugin-security';
import { CSPDirectives, CSPUtils, DirectiveData, HelmetConfig } from '@godaddy/gasket-plugin-security';


describe('@godaddy/gasket-plugin-security', function () {
  it('allows helmet section in Gasket config', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      helmet: {
        xPermittedCrossDomainPolicies: {
          permittedPolicies: 'all'
        }
      }
    };
  });

  it('adds a contentSecurityPolicy lifecycle', function () {
    const hook: Hook<'contentSecurityPolicy'> = (
      gasket: Gasket,
      directives: CSPDirectives,
      context: { req?: IncomingMessage, res?: ServerResponse<IncomingMessage> },
      utils: CSPUtils
    ): MaybeAsync<CSPDirectives> => {
      const { req, res } = context;
      const { createHash, createNonce } = utils;

      const nonce: DirectiveData = createNonce();
      directives['script-src'].push(nonce.directive);

      const hash: DirectiveData = createHash('some-inline-script');
      directives['script-src'].push(hash.directive);

      return directives;
    };
  });

  it('adds a helmet lifecycle', function () {
    const hook: Hook<'helmet'> = (
      gasket: Gasket,
      options: HelmetConfig,
      context: { req?: IncomingMessage, res?: ServerResponse<IncomingMessage> }
    ): MaybeAsync<HelmetConfig> => {
      const results: HelmetConfig = {
        xPermittedCrossDomainPolicies: {
          permittedPolicies: 'all'
        }
      };
      return results;
    };
  });
});
