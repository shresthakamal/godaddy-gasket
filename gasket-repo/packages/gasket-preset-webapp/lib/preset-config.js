// Default Plugins - included by default for all presets
import pluginCommand from '@gasket/plugin-command';
import pluginData from '@gasket/plugin-data';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';

import pluginAnalyze from '@gasket/plugin-analyze';
import pluginHttps from '@gasket/plugin-https';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import pluginIntl from '@gasket/plugin-intl';
import pluginLint from '@gasket/plugin-lint';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginSecurity from '@godaddy/gasket-plugin-security';
import pluginTraffic from '@godaddy/gasket-plugin-traffic';
import pluginUxp from '@godaddy/gasket-plugin-uxp';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';
import pluginOtel from '@godaddy/gasket-plugin-otel';
import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';
import pluginAtlas from '@godaddy/gasket-plugin-atlas';

/**
 * presetConfig hook
 * @type {import('@gasket/core').HookHandler<'presetConfig'>}
 */
export default async function presetConfig(gasket, context) {
  const plugins = [
    pluginAnalyze,
    pluginCommand,
    pluginDynamicPlugins,
    pluginGit,
    pluginLogger,
    pluginMetadata,
    pluginData,
    pluginDocs,
    pluginDocusaurus,
    pluginIntl,
    pluginLint,
    pluginNextjs,
    pluginWebpack,
    pluginWinston,
    pluginAuth,
    pluginSecurity,
    pluginTraffic,
    pluginUxp,
    pluginVisitor,
    pluginDevCerts,
    pluginOtel,
    pluginSelfCerts,
    pluginAtlas
  ];

  if (context.nextServerType === 'customServer') {
    const frameworkPlugin = await import('@gasket/plugin-express');

    plugins.push(pluginHttps);
    plugins.push(frameworkPlugin.default || frameworkPlugin);
  } else if (context.nextDevProxy) {
    plugins.push(pluginHttpsProxy);
  }

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(
      context.testPlugins.map(async function (testPlugin) {
        const plugin = await import(testPlugin);

        plugins.push(plugin ? plugin.default || plugin : null);
      })
    );
  }

  if (context.typescript) {
    const typescriptPlugin = await import('@gasket/plugin-typescript');

    plugins.push(typescriptPlugin.default || typescriptPlugin);
  }

  return {
    plugins: plugins.filter(Boolean)
  };
}
