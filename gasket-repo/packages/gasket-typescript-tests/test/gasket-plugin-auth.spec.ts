import type { Gasket, GasketConfigDefinition, Hook, MaybeAsync } from '@gasket/core';
import type { GasketRequest } from '@gasket/request';
import '@godaddy/gasket-plugin-auth';
import { AuthRealm, AuthRealmType, AuthRisk, AuthRiskType } from '@godaddy/gasket-plugin-auth';
import type { AuthData } from '@godaddy/gasket-plugin-auth';


describe('@godaddy/gasket-plugin-auth', function () {
  it('allows auth section in Gasket config', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      auth: {
        appName: 'example-app',
        basePath: '/example'
      }
    };
  });

  it('requires all apiProxy parts if configured', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      auth: {
        // @ts-expect-error - GasketConfigDefinition is not typed
        apiProxy: {
          host: 'asd'
        }
      }
    };
  });

  it('support AuthRealm as enum', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      auth: {
        realm: AuthRealm.idp
      }
    };

    const config2: GasketConfigDefinition = {
      plugins: [],
      auth: {
        realm: 'idp'
      }
    };

    const config3: GasketConfigDefinition = {
      plugins: [],
      auth: {
        realm: AuthRealm.idpInt
      }
    };

    const config4: GasketConfigDefinition = {
      plugins: [],
      auth: {
        realm: 'idp_int'
      }
    };

    const configBad: GasketConfigDefinition = {
      plugins: [],
      auth: {
        // @ts-expect-error - not legit realm
        realm: 'bogus'
      }
    };

    const configBad2: GasketConfigDefinition = {
      plugins: [],
      auth: {
        // @ts-expect-error - not a valid realm, needs underscore
        realm: 'idpInt'
      }
    };

    const realm: AuthRealmType | undefined = config.auth?.realm;
  });

  it('support AuthRisk as enum', function () {
    const config: GasketConfigDefinition = {
      plugins: [],
      auth: {
        risk: AuthRisk.low
      }
    };

    const configBad: GasketConfigDefinition = {
      plugins: [],
      auth: {
        // @ts-expect-error
        realm: 'bogus'
      }
    };

    const risk: AuthRiskType | undefined = config.auth?.risk;
  });

  it('adds a authChecked lifecycle', function () {
    const hook: Hook<'authChecked'> = (gasket: Gasket, authData: AuthData): MaybeAsync<void> => {
      authData.message = 'some string';
      authData.success = true;
      const r: GasketRequest = authData.req;

      authData.extra = 'hello';
      authData.extraData = {};
    };
  });
});
