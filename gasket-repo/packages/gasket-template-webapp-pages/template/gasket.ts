import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginData from '@gasket/plugin-data';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginSecurity from '@godaddy/gasket-plugin-security';
import pluginTraffic from '@godaddy/gasket-plugin-traffic';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';
import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';
import pluginAtlas from '@godaddy/gasket-plugin-atlas';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';
import pluginUxp from '@godaddy/gasket-plugin-uxp';
import pluginOtel from '@godaddy/gasket-plugin-otel';
import { gdEnv } from '@godaddy/gasket-utils';
import gasketData from './gasket-data.js';

export default makeGasket({
  env: gdEnv(), // Use GD_ENV from Katana unless GASKET_ENV is set
  environments: {
    'local.analyze': {
      dynamicPlugins: [
        '@gasket/plugin-analyze'
      ]
    }
  },
  plugins: [
    pluginCommand,
    pluginDynamicPlugins,
    pluginLogger,
    pluginData,
    pluginWebpack,
    pluginWinston,
    pluginAuth,
    pluginSecurity,
    pluginTraffic,
    pluginVisitor,
    pluginDevCerts,
    pluginSelfCerts,
    pluginAtlas,
    pluginHttpsProxy,
    pluginNextjs,
    pluginIntl,
    pluginUxp,
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
  httpsProxy: {
    protocol: 'https',
    port: 8443,
    xfwd: true,
    ws: true,
    target: {
      host: 'localhost',
      port: 3000
    }
  },
  intl: {
    locales: [
      'en-US',
      'fr-FR'
    ],
    defaultLocale: 'en-US',
    managerFilename: 'intl.ts',
    nextRouting: false
  },
  uxp: {
    useMintl: true
  },
  presentationCentral: {
    params: {
      app: 'gasket-template-webapp-pages',
      manifest: 'internal-header',
      react: '19'
    }
  },
  data: gasketData
} as GasketConfigDefinition);
