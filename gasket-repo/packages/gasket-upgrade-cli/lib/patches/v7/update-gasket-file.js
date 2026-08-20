const withPatchSpinner = require('../with-patch-spinner');
const { runShellCommand } = require('@gasket/utils');
const createOnlyPluginsMap = require('../../utils/create-only-plugins');
const shortNameMapping = require('../../utils/short-name-map');
const deprecatedPluginsMap = require('../../utils/removed-plugins');
const renamedPluginsMap = require('../../utils/renamed-plugins');
const packageUpdatesMap = require('../../utils/updated-packages');
const path = require('path');

/**
 * Transforms short plugin names to their full package names.
 * @param {string} pluginName - The short name of the plugin.
 * @returns {string} - The transformed full package name.
 */
function getFullPluginName(pluginName) {
  return shortNameMapping[pluginName] || pluginName;
}

/**
 * Handles plugins that have been renamed by updating dependencies and returning the new name.
 * @param {string} pluginName - The name of the plugin.
 * @param {object} dependencies - The `dependencies` object from `package.json`.
 * @returns {string} - The renamed plugin name or the original name if not renamed.
 */
function resolveRenamedPlugin(pluginName, dependencies) {
  if (renamedPluginsMap[pluginName]) {
    delete dependencies[pluginName];
    dependencies[renamedPluginsMap[pluginName]] =
      pluginName.includes('@gasket') ? '^7.2.0' : '^3.2.0';
    return renamedPluginsMap[pluginName];
  }
  return pluginName;
}

/**
 * Checks if a plugin is deprecated and removes it from dependencies if so.
 * @param {string} pluginName - The name of the plugin.
 * @param {object} dependencies - The `dependencies` object from `package.json`.
 * @returns {boolean} - True if the plugin is deprecated, false otherwise.
 */
function isDeprecatedPlugin(pluginName, dependencies) {
  if (deprecatedPluginsMap[pluginName]) {
    delete dependencies[pluginName];
    return true;
  }
  return false;
}

/**
 * Updates package dependencies in `package.json` based on the update rules.
 * @param {object} packageJson - The parsed `package.json` object.
 */
function applyPackageUpdates(packageJson) {
  const { add: addPackages, remove: removePackages } = packageUpdatesMap;

  // Add new packages
  Object.keys(addPackages).forEach((pkgName) => {
    if (typeof addPackages[pkgName] === 'object') {
      const { version, when } = addPackages[pkgName];
      if (when(packageJson.dependencies)) {
        packageJson.dependencies[pkgName] = version;
      }
    } else {
      packageJson.dependencies[pkgName] = addPackages[pkgName];
    }
  });

  // Remove deprecated packages
  Object.keys(removePackages).forEach((pkgName) => {
    delete packageJson.dependencies[pkgName];
  });
}

/**
 * Extracts and parses plugin configuration from the Gasket configuration file.
 * @param {string} gasketConfigContent - The content of the `gasket.config.js` file.
 * @param {object} packageJson - The parsed `package.json` object.
 * @returns {string[]} - A list of plugin package names.
 */
function parsePluginsFromConfig(gasketConfigContent, packageJson) {
  const pluginConfigRegex = /plugins\s*:\s*\{([^}]*)\}/;
  const pluginConfigMatch = gasketConfigContent.match(pluginConfigRegex);
  let pluginPackages = [];

  if (pluginConfigMatch) {
    const pluginsContent = pluginConfigMatch[1].trim();
    const presetsMatch = pluginsContent.match(/presets\s*:\s*\[\s*([^]*?)\s*\]/);
    const addMatch = pluginsContent.match(/add\s*:\s*\[\s*([^]*?)\s*\]/);

    const presets = presetsMatch
      ? presetsMatch[1].replace(/'/g, '').split(',').map((p) => p.trim())
      : [];

    const additionalPlugins = addMatch
      ? addMatch[1].replace(/'/g, '').split(',').map((p) => p.trim())
      : [];

    pluginPackages = [...presets, ...additionalPlugins]
      .map(getFullPluginName)
      .map((pkgName) => resolveRenamedPlugin(pkgName, packageJson.dependencies))
      .filter((pkgName) => !!pkgName && !isDeprecatedPlugin(pkgName, packageJson.dependencies));
  }

  return pluginPackages;
}

/**
 * Generates import statements and plugin registration code for the updated Gasket file.
 * @param {string[]} pluginPackages - List of plugin package names.
 * @param {string} projectDirectory - The root directory of the project.
 * @returns {Promise<{ importStatements: Set<string>, pluginRegistration: Set<string> }>} - Updated code.
 */
async function generatePluginImports(pluginPackages, projectDirectory) {
  const importStatements = new Set();
  const pluginRegistration = new Set();

  for (const packageName of pluginPackages) {
    if (createOnlyPluginsMap[packageName]) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (packageName.includes('preset')) {
      try {
        const result = await runShellCommand(
          'npm',
          ['info', `${packageName}`, 'dependencies'],
          { cwd: projectDirectory }
        );
        const dependencies = result.stdout.match(/@[\w/-]+/g) || [];

        dependencies
          .filter((dep) => dep.includes('gasket') && !createOnlyPluginsMap[dep])
          .map(getFullPluginName)
          .map((dep) => resolveRenamedPlugin(dep, {})) // Empty object as dependencies are fetched dynamically
          .forEach((dep) => {
            const variableName = dep
              .replace(/^@[\w-]+\//, '')
              .replace(/-./g, (match) => match.charAt(1).toUpperCase());
            importStatements.add(`import ${variableName} from '${dep}';`);
            pluginRegistration.add(`    ${variableName}`);
          });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch dependencies for ${packageName}:`, error);
      }
    } else {
      const variableName = packageName
        .replace(/^@[\w-]+\//, '')
        .replace(/-./g, (match) => match.charAt(1).toUpperCase());
      importStatements.add(`import ${variableName} from '${packageName}';`);
      pluginRegistration.add(`    ${variableName}`);
    }
  }

  return { importStatements, pluginRegistration };
}

/**
 * Cleans and formats the Gasket configuration file content.
 * @param {string} gasketConfigContent - The content of the `gasket.config.js` file.
 * @returns {string} - The cleaned and formatted configuration content.
 */
function formatGasketConfigContent(gasketConfigContent) {
  // Step 1: Remove doc blocks (/* ... */) and single-line comments (// ...)
  const cleanedContent = gasketConfigContent.replace(/\/\*[\s\S]*?\*\/|[^:]\/\/.*/g, '');
  // Step 2: Remove `plugins: {}` part
  const withoutPlugins = cleanedContent.replace(/plugins\s*:\s*\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\},?/g, '');
  // Step 3: Remove `module.exports = {}` but keep its contents
  const withoutModuleExports = withoutPlugins.replace(/^module\.exports\s*=\s*\{|\};\s*$/gs, '');
  // Step 4: Remove extra blank lines but preserve indentation
  const compressedContent = withoutModuleExports.replace(/\n\s*\n/g, '\n').trim();

  // Step 5: Adjust the indentation based on the level of nesting
  let indentLevel = 1; // Start with one level of indentation
  return compressedContent
    .split('\n')
    .map((line) => {
      if (line.includes('}') || line.includes(']')) indentLevel -= 1;
      const indentedLine = '  '.repeat(indentLevel) + line.trim();
      if (line.includes('{') || line.includes('[')) indentLevel += 1;
      return indentedLine;
    })
    .join('\n');
}

/**
 * Main function to update the Gasket configuration file.
 * @param {object} context - The context object containing addContent, files, git, and cwd properties.
 */
async function updateGasketConfigFile({ addContent, files, git, cwd }) {
  const gasketConfigContent = files.get('gasket.config.js');
  const packageJson = files.get('package.json');

  const pluginPackages = parsePluginsFromConfig(gasketConfigContent, packageJson);
  const { importStatements, pluginRegistration } = await generatePluginImports(pluginPackages, cwd);
  const formattedConfig = formatGasketConfigContent(gasketConfigContent);
  const needsRequire = formattedConfig.includes('require(');

  // Split string at module.exports into to variables
  const idx = formattedConfig.indexOf('module.exports');
  const preConfigStr = formattedConfig.slice(0, idx);
  const configStr = formattedConfig.slice(idx, formattedConfig.length);

  applyPackageUpdates(packageJson);

  const fileExtension = packageJson.type === 'module' ? '.js' : '.mjs';
  const newConfigFilename = `gasket${fileExtension}`;

  addContent(
    newConfigFilename,
    `
import { makeGasket } from '@gasket/core';
${[...importStatements].join('\n')}
${needsRequire ? `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
` : ''}
${preConfigStr}
export default makeGasket({
  plugins: [
${[...pluginRegistration].join(',\n')}
  ],
${configStr}
});`
  );

  git.add(path.join(cwd, newConfigFilename));
  git.rm(path.join(cwd, 'gasket.config.js'));
  files.delete('gasket.config.js');
}

module.exports = withPatchSpinner('Update Gasket Configuration File', updateGasketConfigFile);
