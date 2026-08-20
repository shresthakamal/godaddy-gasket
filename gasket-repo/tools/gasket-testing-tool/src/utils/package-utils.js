import { isTemplate, isInternal } from './app-type-utils.js';
import { getPresetConfig } from '../config/preset-configs.js';

/**
 * Get the configuration file content for a preset app
 * @param {string} appType - The type of app to get the config file for
 * @returns {string} The configuration file content
 */
export function getConfigFile(appType) {
  if (isTemplate(appType)) {
    return null; // Templates don't use config files
  }

  const config = getPresetConfig(appType);
  return JSON.stringify(config);
}

/**
 * Get the preset flag based on whether a local package is used
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @returns {string} The preset flag
 */
export function getPresetFlag(useLocalPackage) {
  return useLocalPackage ? '--preset-path' : '--presets';
}

/**
 * Get the template flag based on whether a local package is used
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @returns {string} The template flag
 */
export function getTemplateFlag(useLocalPackage) {
  return useLocalPackage ? '--template-path' : '--template';
}

/**
 * Get the appropriate flag for the app type (preset or template)
 * @param {string} appType - The type of app to get the flag for
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @returns {string} The app flag
 */
export function getAppFlag(appType, useLocalPackage) {
  return isTemplate(appType)
    ? getTemplateFlag(useLocalPackage)
    : getPresetFlag(useLocalPackage);
}

/**
 * Get the internal preset based on the application type
 * @param {string} appType - The type of app to get the internal preset for
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @param {object} envManager - The environment manager
 * @returns {string} The internal preset
 */
function getInternalPreset(appType, useLocalPackage, envManager) {
  const isNextJs = appType.includes('webapp');
  const isApi = appType.includes('internal');
  const isHcs = appType.includes('hcs');
  const tag = envManager.getPreId(true);

  if (useLocalPackage) {
    const presetPath = envManager.getPresetPath(appType, true);
    if (!presetPath) {
      throw new Error(`You must set the environment variable for ${appType} to use local packages`);
    }
    return presetPath;
  }

  if (isNextJs) return `@godaddy/gasket-preset-webapp@${tag}`;
  if (isApi) return `@godaddy/gasket-preset-api@${tag}`;
  if (isHcs) return `@godaddy/gasket-preset-hcs@${tag}`;
}

/**
 * Get the internal template based on the application type
 * @param {string} appType - The type of app to get the internal template for
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @param {object} envManager - The environment manager
 * @returns {string} The internal template
 */
function getInternalTemplate(appType, useLocalPackage, envManager) {
  const tag = envManager.getPreId(true);

  if (useLocalPackage) {
    const templatePath = envManager.getTemplatePath(appType);
    if (!templatePath) {
      throw new Error(`You must set the environment variable for ${appType} to use local template packages`);
    }
    return templatePath;
  }

  const templateMap = {
    'template-webapp-app': `@godaddy/gasket-template-webapp-app@${tag}`,
    'template-webapp-pages': `@godaddy/gasket-template-webapp-pages@${tag}`,
    'template-webapp-express': `@godaddy/gasket-template-webapp-express@${tag}`,
    'template-api-express': `@godaddy/gasket-template-api-express@${tag}`,
    'template-api-fastify': `@godaddy/gasket-template-api-fastify@${tag}`,
    'template-hcs': `@godaddy/gasket-template-hcs@${tag}`
  };

  return templateMap[appType];
}

/**
 * Get the template based on the application type
 * @param {string} appType - The type of app to get the template for
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @param {object} envManager - The environment manager
 * @returns {string} The template
 */
function getTemplate(appType, useLocalPackage, envManager) {
  // Handle internal templates
  if (isInternal(appType)) {
    return getInternalTemplate(appType, useLocalPackage, envManager);
  }

  // Handle open source templates
  const tag = envManager.getPreId(false);

  if (useLocalPackage) {
    const templatePath = envManager.getTemplatePath(appType);
    if (!templatePath) {
      throw new Error(`You must set the environment variable for ${appType} to use local template packages`);
    }
    return templatePath;
  }

  const osTemplateMap = {
    'os-template-nextjs-app': `@gasket/template-nextjs-app@${tag}`,
    'os-template-nextjs-pages': `@gasket/template-nextjs-pages@${tag}`,
    'os-template-nextjs-express': `@gasket/template-nextjs-express@${tag}`,
    'os-template-api-express': `@gasket/template-api-express@${tag}`,
    'os-template-api-fastify': `@gasket/template-api-fastify@${tag}`
  };

  return osTemplateMap[appType];
}

/**
 * Get the preset based on the application type
 * @param {string} appType - The type of app to get the preset for
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @param {object} envManager - The environment manager
 * @returns {string} The preset
 */
export function getPreset(appType, useLocalPackage, envManager) {
  if (isInternal(appType)) {
    return getInternalPreset(appType, useLocalPackage, envManager);
  }

  const isNextJs = appType.includes('router');
  const tag = envManager.getPreId(false);

  if (useLocalPackage) {
    const presetPath = envManager.getPresetPath(appType, false);
    if (!presetPath) {
      throw new Error(`You must set the appropriate environment variable for "${appType}" to use local preset packages (missing preset path for "${appType}")`);
    }
    return presetPath;
  }

  return isNextJs ?
    `@gasket/preset-nextjs@${tag}` :
    `@gasket/preset-api@${tag}`;
}

/**
 * Get the appropriate package for the app type (preset or template)
 * @param {string} appType - The type of app to get the package for
 * @param {boolean} useLocalPackage - Whether to use a local package
 * @param {object} envManager - The environment manager
 * @returns {string} The app package
 */
export function getAppPackage(appType, useLocalPackage, envManager) {
  return isTemplate(appType)
    ? getTemplate(appType, useLocalPackage, envManager)
    : getPreset(appType, useLocalPackage, envManager);
}
