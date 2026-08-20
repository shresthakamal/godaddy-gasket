import { Plugin }  from '@gasket/core';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';
import pluginGoCaas from '@godaddy/gasket-plugin-gocaas';
import pluginHcs from '@godaddy/gasket-plugin-hcs';
import pluginJwt from '@godaddy/gasket-plugin-jwt';
import pluginOtel from '@godaddy/gasket-plugin-otel';
import pluginProxy from '@godaddy/gasket-plugin-proxy';
import pluginSecurity from '@godaddy/gasket-plugin-security';
import pluginSecurityAuthLogging from '@godaddy/gasket-plugin-security-auth-logging';
import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';
import pluginSharedHeader from '@godaddy/gasket-plugin-shared-header';
import pluginSwitchboard from '@godaddy/gasket-plugin-switchboard';
import pluginTraffic from '@godaddy/gasket-plugin-traffic';
import pluginUxp from '@godaddy/gasket-plugin-uxp';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';

describe('check plugins type', () => {
  it('should have correct type', () => {
    const plugins: Plugin[] = [
      pluginAuth,
      pluginDevCerts,
      pluginGoCaas,
      pluginHcs,
      pluginJwt,
      pluginOtel,
      pluginProxy,
      pluginSecurity,
      pluginSecurityAuthLogging,
      pluginSelfCerts,
      pluginSharedHeader,
      pluginSwitchboard,
      pluginTraffic,
      pluginUxp,
      pluginVisitor
    ];
  });
});
