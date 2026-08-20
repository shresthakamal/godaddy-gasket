import tls from 'tls';
import { getDefaultSni, toWildcard } from './utils.js';

const defaultProtocol = 'https';
const defaultHostname = 'local.gasket.dev-godaddy.com';
const defaultPort = 8443;


export default async function httpsProxyHook(gasket, httpsProxyConfig) {
  // this fixup only pertains to local development
  if (
    gasket.config.env.startsWith('local') &&
    'getDevCert' in gasket.actions &&
    !(httpsProxyConfig.protocol === 'http') &&
    !('ssl' in httpsProxyConfig)
  ) {
    const {
      protocol = defaultProtocol,
      hostname = defaultHostname,
      port = defaultPort
    } = httpsProxyConfig;

    const certs = await getDefaultSni(gasket);
    const SNICallback = (servername, cb) => {
      const cert = certs[toWildcard(servername)];
      const ctx = cert ? tls.createSecureContext(cert) : null;
      cb(null, ctx);
    };

    return {
      ...httpsProxyConfig,
      protocol,
      hostname,
      port,
      ssl: {
        SNICallback
      }
    };
  }

  return httpsProxyConfig;
}
