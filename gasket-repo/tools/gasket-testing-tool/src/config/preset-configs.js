/**
 * Preset configurations for gasket-testing-tool
 */

const SHARED_PRESET_CONFIG = {
  appDescription: 'Gasket App',
  packageManager: 'npm',
  testPlugin: 'unit',
  testPlugins: [
    '@gasket/plugin-vitest'
  ],
  gitInit: false,
  useDocs: true,
  useDocusaurus: true,
  codeStyle: 'godaddy'
};

const OS_PRESET_CONFIG = {
  'app-router': {
    typescript: false,
    nextServerType: 'appRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'app-router-proxy': {
    typescript: false,
    nextServerType: 'appRouter',
    nextDevProxy: true,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'app-router-ts': {
    typescript: true,
    nextServerType: 'appRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'app-router-ts-proxy': {
    typescript: true,
    nextServerType: 'appRouter',
    nextDevProxy: true,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'page-router': {
    typescript: false,
    nextServerType: 'pageRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'page-router-proxy': {
    typescript: false,
    nextServerType: 'pageRouter',
    nextDevProxy: true,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'page-router-ts': {
    typescript: true,
    nextServerType: 'pageRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'page-router-ts-proxy': {
    typescript: true,
    nextServerType: 'pageRouter',
    nextDevProxy: true,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false
  },
  'page-router-express': {
    typescript: false,
    nextServerType: 'customServer',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    server: 'express'
  },
  'page-router-express-ts': {
    typescript: true,
    nextServerType: 'customServer',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    server: 'express'
  },
  'express': {
    codeStyle: 'godaddy',
    server: 'express',
    typescript: false,
    useSwagger: true
  },
  'express-ts': {
    codeStyle: 'godaddy',
    server: 'express',
    typescript: true,
    useSwagger: true
  },
  'fastify': {
    codeStyle: 'godaddy',
    server: 'fastify',
    typescript: false,
    useSwagger: true
  },
  'fastify-ts': {
    codeStyle: 'godaddy',
    server: 'fastify',
    typescript: true,
    useSwagger: true
  }
};

const INTERNAL_PRESET_CONFIG = {
  'webapp-app-router': {
    typescript: false,
    useAppRouter: true,
    nextServerType: 'appRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    uxp: {
      isGoDark: false,
      header: 'internal-header',
      useRtl: false
    }
  },
  'webapp-app-router-ts': {
    typescript: true,
    useAppRouter: true,
    nextServerType: 'appRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    uxp: {
      isGoDark: false,
      header: 'internal-header',
      useRtl: false
    }
  },
  'webapp-page-router': {
    typescript: false,
    nextServerType: 'pageRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    uxp: {
      isGoDark: false,
      header: 'internal-header',
      useRtl: false
    }
  },
  'webapp-page-router-ts': {
    typescript: true,
    nextServerType: 'pageRouter',
    nextDevProxy: false,
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    uxp: {
      isGoDark: false,
      header: 'internal-header',
      useRtl: false
    }
  },
  'webapp-page-router-express': {
    typescript: false,
    nextServerType: 'customServer',
    nextDevProxy: false,
    server: 'express',
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    uxp: {
      isGoDark: false,
      header: 'internal-header',
      useRtl: false
    }
  },
  'webapp-page-router-express-ts': {
    typescript: true,
    nextServerType: 'customServer',
    nextDevProxy: false,
    server: 'express',
    addSitemap: false,
    hasGasketIntl: true,
    useRedux: false,
    uxp: {
      isGoDark: false,
      header: 'internal-header',
      useRtl: false
    }
  },
  'internal-express': {
    codeStyle: 'godaddy',
    server: 'express',
    typescript: false,
    useSwagger: true,
    hasGasketIntl: true
  },
  'internal-express-ts': {
    codeStyle: 'godaddy',
    server: 'express',
    typescript: true,
    useSwagger: true,
    hasGasketIntl: true
  },
  'hcs-express': {
    codeStyle: 'godaddy',
    server: 'express',
    typescript: false,
    useSwagger: true,
    hasGasketIntl: true
  }
};

export const PRESET_CONFIGS = {
  ...OS_PRESET_CONFIG,
  ...INTERNAL_PRESET_CONFIG
};

/**
 * Get the full configuration for a preset by merging shared config with preset-specific config
 * @param {string} appType - The type of app to get the preset config for
 * @returns {object} The full configuration for the preset
 */
export function getPresetConfig(appType) {
  const presetConfig = PRESET_CONFIGS[appType];
  if (!presetConfig) {
    throw new Error(`No preset configuration found for app type: ${appType}`);
  }

  return {
    ...SHARED_PRESET_CONFIG,
    ...presetConfig
  };
}

/**
 * Get all available preset names
 * @returns {string[]} The list of all available preset names
 */
export function getAvailablePresets() {
  return Object.keys(PRESET_CONFIGS);
}

/**
 * Check if a preset exists
 * @param {string} appType - The type of app to check if the preset exists for
 * @returns {boolean} Whether the preset exists
 */
export function hasPreset(appType) {
  return appType in PRESET_CONFIGS;
}
