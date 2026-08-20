import { vi } from 'vitest';
import {
  getDefaultSni,
  toWildcard
} from '../lib/utils.js';

describe('utils', function () {

  it('getDefaultSni returns certs for default hostnames', async function () {
    const mockGasket = {
      actions: {
        getDevCert: vi.fn().mockImplementation(hostname => {
          return {
            cert: `${hostname}.crt`,
            key: `${hostname}.key`
          };
        })
      }
    };

    const sni = await getDefaultSni(mockGasket);

    expect(sni).toEqual({
      '*.gasket.dev-godaddy.com': { cert: '*.gasket.dev-godaddy.com.crt', key: '*.gasket.dev-godaddy.com.key' },
      '*.gasket.int.dev-godaddy.com': { cert: '*.gasket.int.dev-godaddy.com.crt', key: '*.gasket.int.dev-godaddy.com.key' },
      '*.gasket.dev-secureserver.net': { cert: '*.gasket.dev-secureserver.net.crt', key: '*.gasket.dev-secureserver.net.key' },
      '*.gasket.dev-gdcorp.tools': { cert: '*.gasket.dev-gdcorp.tools.crt', key: '*.gasket.dev-gdcorp.tools.key' },
      '*.gasket.int.dev-gdcorp.tools': { cert: '*.gasket.int.dev-gdcorp.tools.crt', key: '*.gasket.int.dev-gdcorp.tools.key' }
    });
  });

  it('getDefaultSni returns certs for custom sniNames config', async function () {
    const mockGasket = {
      config: {
        devCerts: {
          sniNames: ['*.custom.com', '*.example.org']
        }
      },
      actions: {
        getDevCert: vi.fn().mockImplementation(hostname => {
          return {
            cert: `${hostname}.crt`,
            key: `${hostname}.key`
          };
        })
      }
    };

    const sni = await getDefaultSni(mockGasket);

    expect(sni).toEqual({
      '*.custom.com': { cert: '*.custom.com.crt', key: '*.custom.com.key' },
      '*.example.org': { cert: '*.example.org.crt', key: '*.example.org.key' }
    });
    expect(mockGasket.actions.getDevCert).toHaveBeenCalledTimes(2);
    expect(mockGasket.actions.getDevCert).toHaveBeenCalledWith('*.custom.com');
    expect(mockGasket.actions.getDevCert).toHaveBeenCalledWith('*.example.org');
  });

  it('toWildcard converts local.gasket.* to *.gasket.*', function () {
    expect(toWildcard('local.gasket.dev-godaddy.com')).toEqual('*.gasket.dev-godaddy.com');
  });
});
