// Default Plugins - included by default for all presets
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';

import pluginData from '@gasket/plugin-data';
import pluginHttps from '@gasket/plugin-https';
import pluginLint from '@gasket/plugin-lint';
import pluginWinston from '@gasket/plugin-winston';
import pluginSecurity from '@godaddy/gasket-plugin-security';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';
import pluginOtel from '@godaddy/gasket-plugin-otel';
import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';

/** @type {import('@gasket/core').Preset} */
export default async function presetConfig(gasket, context) {
  const plugins = new Set([
    pluginCommand,
    pluginDynamicPlugins,
    pluginGit,
    pluginLogger,
    pluginMetadata,
    pluginHttps,
    pluginDocs,
    pluginDocusaurus,
    pluginData,
    pluginWinston,
    pluginLint,
    pluginSecurity,
    pluginVisitor,
    pluginDevCerts,
    pluginOtel,
    pluginSelfCerts
  ]);

  const frameworkPlugin = context.server === 'express'
    ? await import('@gasket/plugin-express')
    : await import('@gasket/plugin-fastify');

  plugins.add(frameworkPlugin.default || frameworkPlugin);

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(context.testPlugins.map(async (testPlugin) => {
      const plugin = await import(testPlugin);
      plugins.add(plugin ? plugin.default || plugin : null);
    }));
  }


  if (context.typescript) {
    const typescriptPlugin = await import('@gasket/plugin-typescript');
    plugins.add(typescriptPlugin.default || typescriptPlugin);
  }

  if (context.useSwagger) {
    const swaggerPlugin = await import('@gasket/plugin-swagger');
    plugins.add(swaggerPlugin.default || swaggerPlugin);
  }

  return {
    plugins: Array.from(plugins)
  };
}
