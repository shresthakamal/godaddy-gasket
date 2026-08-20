import 'dotenv/config';
import { ENV_VARS } from './constants.js';

/**
 * Manages environment variables for the testing tool
 */
export class EnvManager {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load and parse environment variables
   * @returns {object} The loaded configuration
   */
  loadConfig() {
    const config = {};

    // Parse run flags (value must be '1' to be true)
    Object.keys(ENV_VARS).forEach(key => {
      const envVar = ENV_VARS[key];
      const value = process.env[envVar];

      if (key.startsWith('RUN_') ||
          ['SKIP_CREATE', 'GASKET_CI', 'EXIT_ON_ERROR', 'VERBOSE', 'QUIET'].includes(key)) {
        config[key] = value === '1';
      } else if (key === 'USE_LOCAL') {
        config[key] = value === '1';
      } else {
        // Package paths and registry
        config[key] = value;
      }
    });

    return config;
  }

  /**
   * Get a specific configuration value
   * @param {string} key - The key to get the configuration value for
   * @returns {string} The configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Check if we should run a specific task
   * @param {string} task - The task to check
   * @returns {boolean} Whether we should run the specific task
   */
  shouldRun(task) {
    const key = `RUN_${task.toUpperCase()}`;
    return this.config[key];
  }

  /**
   * Check if we're in CI mode
   * @returns {boolean} Whether we're in CI mode
   */
  isCI() {
    return this.config.GASKET_CI === true;
  }

  /**
   * Check if we should exit on error
   * @returns {boolean} Whether we should exit on error
   */
  shouldExitOnError() {
    return this.config.EXIT_ON_ERROR === true;
  }

  /**
   * Check if we should use local packages
   * @returns {boolean} Whether we should use local packages
   */
  useLocalPackages() {
    return this.config.USE_LOCAL === true;
  }

  /**
   * Check if we should skip app creation
   * @returns {boolean} Whether we should skip app creation
   */
  shouldSkipCreate() {
    return this.config.SKIP_CREATE === true;
  }

  /**
   * Get internal registry URL
   * @returns {string} The internal registry URL
   */
  getInternalRegistry() {
    return this.config.INTERNAL_REGISTRY;
  }

  /**
   * Get preset path based on type
   * @param {string} type - The type of app to get the preset path for
   * @param {boolean} isInternal - Whether the preset is internal
   * @returns {string} The preset path
   */
  getPresetPath(type, isInternal = false) {
    if (isInternal) {
      if (type.includes('webapp')) return this.config.INTERNAL_PRESET_WEBAPP;
      if (type.includes('internal')) return this.config.INTERNAL_PRESET_API;
      if (type.includes('hcs')) return this.config.INTERNAL_PRESET_HCS;
    } else {
      const isNextJs = type.includes('router');
      return isNextJs ? this.config.OS_PRESET_NEXTJS : this.config.OS_PRESET_API;
    }
    return null;
  }

  /**
   * Get template path based on type
   * @param {string} templateType - The type of template to get the path for
   * @returns {string} The template path
   */
  getTemplatePath(templateType) {
    const templateEnvMap = {
      // Open Source Templates
      'os-template-nextjs-app': 'OS_TEMPLATE_NEXTJS_APP',
      'os-template-nextjs-pages': 'OS_TEMPLATE_NEXTJS_PAGES',
      'os-template-nextjs-express': 'OS_TEMPLATE_NEXTJS_EXPRESS',
      'os-template-api-express': 'OS_TEMPLATE_API_EXPRESS',
      'os-template-api-fastify': 'OS_TEMPLATE_API_FASTIFY',

      // Internal Templates
      'template-webapp-app': 'TEMPLATE_WEBAPP_APP',
      'template-webapp-pages': 'TEMPLATE_WEBAPP_PAGES',
      'template-webapp-express': 'TEMPLATE_WEBAPP_EXPRESS',
      'template-api-express': 'TEMPLATE_API_EXPRESS',
      'template-api-fastify': 'TEMPLATE_API_FASTIFY',
      'template-hcs': 'TEMPLATE_HCS'
    };

    const envVar = templateEnvMap[templateType];
    return envVar ? this.config[envVar] : null;
  }

  /**
   * Get prerelease tag for packages
   * @param {boolean} isInternal - Whether the packages are internal
   * @returns {string} The prerelease tag
   */
  getPreId(isInternal = false) {
    return isInternal
      ? (this.config.INTERNAL_PREID || 'latest')
      : (this.config.OS_PREID || 'latest');
  }

  /**
   * Get logger options
   * @returns {object} The logger options
   */
  getLoggerOptions() {
    return {
      verbose: this.config.VERBOSE === true,
      quiet: this.config.QUIET === true
    };
  }
}
