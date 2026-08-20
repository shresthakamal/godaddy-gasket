// Default Plugins - included by default for all presets
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';

import pluginIntl from '@gasket/plugin-intl';
import pluginHcs from '@godaddy/gasket-plugin-hcs';
import pluginData from '@gasket/plugin-data';
import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';
import pluginLint from '@gasket/plugin-lint';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginWinston from '@gasket/plugin-winston';
import pluginSecurity from '@godaddy/gasket-plugin-security';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import pluginWebpack from '@gasket/plugin-webpack';

/** @type {import('@gasket/core').HookHandler<'presetConfig'>} */
export default async function presetConfig(gasket, context) {
  let typescriptPlugin;
  const testPlugins = [];

  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(
      context.testPlugins.map(async (testPlugin) => {
        const plugin = await import(testPlugin);

        testPlugins.push(plugin ? plugin.default || plugin : null);
      })
    );
  }

  if (context.typescript) {
    typescriptPlugin = await import('@gasket/plugin-typescript');
  }

  return {
    plugins: [
      pluginCommand,
      pluginDynamicPlugins,
      pluginGit,
      pluginLogger,
      pluginMetadata,
      pluginIntl,
      pluginHcs,
      pluginExpress,
      pluginHttps,
      pluginDocs,
      pluginDocusaurus,
      pluginData,
      pluginWinston,
      pluginSwagger,
      pluginLint,
      pluginSecurity,
      pluginVisitor,
      pluginWebpack,
      typescriptPlugin ? typescriptPlugin.default || typescriptPlugin : null,
      ...testPlugins
    ].filter(Boolean)
  };
}
