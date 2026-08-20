import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginHttps from '@gasket/plugin-https';
import pluginData from '@gasket/plugin-data';
import pluginWinston from '@gasket/plugin-winston';
import pluginSecurity from '@godaddy/gasket-plugin-security';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';
import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';
import pluginExpress from '@gasket/plugin-express';
import pluginRoutes from './plugins/routes-plugin.js';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginOtel from '@godaddy/gasket-plugin-otel';
import { gdEnv } from '@godaddy/gasket-utils';
import gasketData from './gasket-data.js';

export default makeGasket({
  env: gdEnv(), // Use GD_ENV from Katana unless GASKET_ENV is set
  plugins: [
    pluginCommand,
    pluginDynamicPlugins,
    pluginLogger,
    pluginHttps,
    pluginData,
    pluginWinston,
    pluginSecurity,
    pluginVisitor,
    pluginDevCerts,
    pluginSelfCerts,
    pluginExpress,
    pluginRoutes,
    pluginSwagger,
    pluginOtel
  ],
  commands: {
    docs: {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-metadata',
        '@gasket/plugin-docusaurus'
      ]
    }
  },
  // Use 8444 locally so aiusage-next's HTTPS proxy can keep the default 8443.
  https: {
    port: 8444
  },
  swagger: {
    jsdoc: {
      definition: {
        info: {
          title: 'gasket-template-api-express',
          version: '0.0.0'
        }
      },
      apis: [
        './routes/*',
        './plugins/*'
      ]
    }
  },
  data: gasketData
} as GasketConfigDefinition);
