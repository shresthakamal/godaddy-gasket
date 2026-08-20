import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginHcs from '@godaddy/gasket-plugin-hcs';
import pluginExpress from '@gasket/plugin-express';
import pluginRoutes from './plugins/routes-plugin.js';
import pluginHttps from '@gasket/plugin-https';
import pluginData from '@gasket/plugin-data';
import pluginWinston from '@gasket/plugin-winston';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginSecurity from '@godaddy/gasket-plugin-security';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginIntl from '@gasket/plugin-intl';
import { gdEnv } from '@godaddy/gasket-utils';
import gasketData from './gasket-data.js';

export default makeGasket({
  env: gdEnv(), // Use GD_ENV from Katana unless GASKET_ENV is set
  plugins: [
    pluginCommand,
    pluginDynamicPlugins,
    pluginLogger,
    pluginHcs,
    pluginExpress,
    pluginRoutes,
    pluginHttps,
    pluginData,
    pluginWinston,
    pluginSwagger,
    pluginSecurity,
    pluginVisitor,
    pluginWebpack,
    pluginIntl
  ],
  environments: {
    local: {
      hcs: {
        pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1',
        pcsOverrideQuery: {},
        defaultCacheMaxAge: 600
      }
    },
    development: {
      hcs: {
        pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1',
        pcsOverrideQuery: {},
        defaultCacheMaxAge: 600
      }
    },
    test: {
      hcs: {
        pcsUrl: 'https://uxp-platform-content-service-test.uxp-test.prod.onkatana.net/v1',
        pcsOverrideQuery: {},
        defaultCacheMaxAge: 600
      }
    },
    production: {
      hcs: {
        pcsUrl: 'https://uxp-platform-content-service-prod.uxp-prod.prod.onkatana.net/v1',
        pcsOverrideQuery: {},
        defaultCacheMaxAge: 600
      }
    }
  },
  intl: {
    experimentalImportAttributes: true,
    locales: [
      'en-US',
      'fr-FR'
    ]
  },
  commands: {
    docs: {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-metadata',
        '@gasket/plugin-docusaurus'
      ]
    }
  },
  swagger: {
    jsdoc: {
      definition: {
        info: {
          title: 'hcs-express',
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
});
