/**
 * Utilities for working with app types
 */

/**
 * Check if an app type is a template
 * @param {string} appType - The type of app to check
 * @returns {boolean} Whether the app type is a template
 */
export function isTemplate(appType) {
  return appType.startsWith('template-') || appType.startsWith('os-template-');
}

/**
 * Check if an app type is internal
 * @param {string} appType - The type of app to check
 * @returns {boolean} Whether the app type is internal
 */
export function isInternal(appType) {
  // Internal presets: contain webapp, internal, or hcs
  if (appType.includes('webapp') || appType.includes('internal') || appType.includes('hcs')) {
    return true;
  }

  // Internal templates: start with 'template-' (but NOT 'os-template-')
  if (isTemplate(appType)) {
    return appType.startsWith('template-') && !appType.startsWith('os-template-');
  }

  // Everything else is open source
  return false;
}

/**
 * Check if an app type is an API
 * @param {string} appType - The type of app to check
 * @returns {boolean} Whether the app type is an API
 */
export function isApi(appType) {
  return (
    appType.includes('api') ||
    appType.includes('express') ||
    appType.includes('fastify') ||
    appType.includes('hcs')
  ) && !(
    appType.includes('page-router') ||
    appType.includes('webapp') ||
    appType.includes('nextjs')
  );
}

/**
 * Check if an app type is HCS
 * @param {string} appType - The type of app to check
 * @returns {boolean} Whether the app type is HCS
 */
export function isHcs(appType) {
  return appType.includes('hcs');
}

/**
 * Check if an app type uses TypeScript
 * @param {string} appType - The type of app to check
 * @returns {boolean} Whether the app type uses TypeScript
 */
export function isTypeScript(appType) {
  if (appType === 'template-hcs') return false;
  return appType.includes('ts') || appType.includes('template'); // templates are ts by default except for hcs
}

/**
 * Check if an app type uses custom Express server
 * @param {string} appType - The type of app to check
 * @returns {boolean} Whether the app type uses custom Express server
 */
export function hasCustomServer(appType) {
  return appType.includes('page-router-express') ||
    appType === 'template-webapp-express' ||
    appType === 'os-template-nextjs-express';
}

/**
 * Get the file extension for gasket config
 * @param {string} appType - The type of app to check
 * @returns {string} The file extension for gasket config
 */
export function getGasketConfigExt(appType) {
  return isTypeScript(appType) ? '.ts' : '.js';
}

/**
 * Filter for OS (open source) app types
 * @param {string} type - The type of app to filter
 * @returns {boolean} Whether the app type is an OS (open source) app type
 */
export function osFilter(type) {
  return !type.includes('internal') &&
    !type.includes('webapp') &&
    !type.includes('hcs') &&
    !isTemplate(type);
}

/**
 * Filter for internal app types
 * @param {string} type - The type of app to filter
 * @returns {boolean} Whether the app type is an internal app type
 */
export function internalFilter(type) {
  return type.includes('internal') ||
    type.includes('webapp') ||
    type.includes('hcs');
}

/**
 * Filter for template app types
 * @param {string} type - The type of app to filter
 * @returns {boolean} Whether the app type is a template app type
 */
export function templateFilter(type) {
  return isTemplate(type);
}

/**
 * Filter for open source template app types
 * @param {string} type - The type of app to filter
 * @returns {boolean} Whether the app type is an open source template app type
 */
export function osTemplateFilter(type) {
  return type.startsWith('os-template-');
}

/**
 * Filter for internal template app types
 * @param {string} type - The type of app to filter
 * @returns {boolean} Whether the app type is an internal template app type
 */
export function internalTemplateFilter(type) {
  return isTemplate(type) && !type.startsWith('os-template-');
}

/**
 * Filter for all preset app types (excludes templates)
 * @param {string} type - The type of app to filter
 * @returns {boolean} Whether the app type is a preset app type
 */
export function presetFilter(type) {
  return !isTemplate(type);
}

/**
 * Check if app type is an OS preset
 * @param {string} type - The type of app to check
 * @returns {boolean} Whether the app type is an OS preset
 */
export function isOsPreset(type) {
  return osFilter(type) && !isTemplate(type);
}

/**
 * Check if app type is an internal preset
 * @param {string} type - The type of app to check
 * @returns {boolean} Whether the app type is an internal preset
 */
export function isInternalPreset(type) {
  return internalFilter(type) && !isTemplate(type);
}

/**
 * Check if app type is an OS template
 * @param {string} type - The type of app to check
 * @returns {boolean} Whether the app type is an OS template
 */
export function isOsTemplate(type) {
  return osTemplateFilter(type);
}

/**
 * Check if app type is an internal template
 * @param {string} type - The type of app to check
 * @returns {boolean} Whether the app type is an internal template
 */
export function isInternalTemplate(type) {
  return internalTemplateFilter(type);
}
