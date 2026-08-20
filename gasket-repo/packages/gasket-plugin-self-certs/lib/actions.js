/// <reference types="@gasket/plugin-logger" />

import { createCertificate } from '@godaddy/quickcert';

const certMap = new Map();

/** @type {import('@gasket/core').ActionHandler<'getSelfCert'>} */
export async function getSelfCert(gasket, commonName) {
  if (!certMap.has(commonName)) {
    // slow, but has to be done to start up the server
    const startTime = Date.now();
    const certKeys = await createCertificate({
      commonName
    });

    certMap.set(commonName, certKeys);

    const timing = Date.now() - startTime;

    gasket.logger.info(`Generated self-signed certificate in ${timing}ms.`);
  }

  return certMap.get(commonName);
}
