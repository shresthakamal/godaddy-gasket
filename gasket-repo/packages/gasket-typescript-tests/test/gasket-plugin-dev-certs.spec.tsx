///<reference types="@godaddy/gasket-plugin-dev-certs"/>

import { GasketConfigDefinition } from '@gasket/core';

describe('@godaddy/gasket-plugin-dev-certs', () => {
  it('injects config types', () => {

    const config: GasketConfigDefinition = {
      plugins: [],
      environments: {
        local: {
          devCerts: {
            path: '.certs',
            commonNames: [
              'example.dev-godaddy.com'
            ]
          }
        }
      }
    };
  });
});
