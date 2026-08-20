import type { Gasket, GasketConfigDefinition, Hook, MaybeAsync } from '@gasket/core';
import type { CSPDirectives } from '@godaddy/gasket-plugin-security';
import '@godaddy/gasket-plugin-security-logger';


describe('@godaddy/gasket-plugin-security-logger', function () {
  it('allows securityLogger section in Gasket config', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      securityLogger: {
        aws: {
          accountId: '123456789',
          accountName: 'gd-aws-usa-gpd-myteam-prod'
        },
        serviceFullName: 'prefixed-name-of-my-service',

        disabled: false
      }
    };
  });

  it('supports logger.security', function () {
    const hook: Hook<'contentSecurityPolicy'> = (gasket: Gasket, directives: CSPDirectives): MaybeAsync<CSPDirectives> => {

      gasket.logger.security('A Record was changed', {
        event: {
          kind: 'event',
          category: 'database',
          type: ['change'],
          outcome: 'success',
          action: 'dns_record_change'
        }
      });

      return directives;
    };
  });
});
