/// <reference types="@gasket/plugin-https" />

import { getDefaultSni } from './utils.js';

const defaultPort = 8443;
const defaultHostname = 'local.gasket.dev-godaddy.com';
const isLocalGasket = /.+\.gasket\.(int\.)?dev-.+/i;
const secureServerTypes = ['https', 'http2'];
const { isArray } = Array;

/** @type {import('@gasket/core').HookHandler<'serverConfig'>} */
export default async function serverConfigHook(gasket, config) {
  // this fixup only pertains to local development
  if (!gasket.config.env.startsWith('local')) {
    return config;
  }

  const { hostname = defaultHostname } = config || {};
  const newConfig = {
    ...config
  };

  // Assign defaults for server configs
  await Promise.all(
    secureServerTypes.map(async key => {
      if (key in newConfig && !isArray(newConfig[key])) {
        newConfig[key] = {
          root: config.root,
          port: defaultPort,
          ...(config[key])
        };

        if (isLocalGasket.test(hostname) && 'getDevCert' in gasket.actions) {
          newConfig[key].sni = await getDefaultSni(gasket);
        }
      }
    })
  );

  return newConfig;
}
