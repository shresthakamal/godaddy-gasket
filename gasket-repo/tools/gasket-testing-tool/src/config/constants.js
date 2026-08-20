/**
 * Constants used throughout the gasket-testing-tool
 */

// Report files
export const REPORT_FILES = {
  CREATE: 'report.create.json',
  BUILD: 'report.build.json',
  TEST: 'report.test.json',
  LOCAL: 'report.local.json',
  START: 'report.start.json',
  DOCS: 'report.docs.json'
};

export const ALL_REPORTS = Object.values(REPORT_FILES);

// Directories
export const DIRS = {
  APPS: '__apps__',
  REPORTS: '.reports',
  CACHE: '.cache',
  NODE_MODULES_CACHE: '.cache/node_modules'
};

// App type categories
export const APP_CATEGORIES = {
  ALL: 'all',
  ALL_OS: 'all-os',
  ALL_INTERNAL: 'all-internal',
  ALL_TEMPLATES: 'all-templates',
  ALL_OS_TEMPLATES: 'all-os-templates',
  ALL_INTERNAL_TEMPLATES: 'all-internal-templates',
  ALL_PRESETS: 'all-presets'
};

// Server ports
export const DEFAULT_PORTS = {
  NEXTJS: 3000,
  API: 8080,
  PROXY: 80,
  HTTPS: 8443
};

// Status indicators
export const STATUS = {
  SUCCESS: '🟢',
  FAILURE: '🔴',
  PROCESSING: '🏁',
  LOCAL_PACKAGES: '🛠️',
  REMOTE_PACKAGES: '💻',
  CACHE_RESTORE: '📦'
};

// Environment variable names
export const ENV_VARS = {
  // Run flags
  RUN_BUILD: 'RUN_BUILD',
  RUN_START: 'RUN_START',
  RUN_LOCAL: 'RUN_LOCAL',
  RUN_TEST: 'RUN_TEST',
  RUN_DOCS: 'RUN_DOCS',

  // Config flags
  USE_LOCAL: 'USE_LOCAL',
  SKIP_CREATE: 'SKIP_CREATE',
  GASKET_CI: 'GASKET_CI',
  EXIT_ON_ERROR: 'EXIT_ON_ERROR',
  VERBOSE: 'VERBOSE',
  QUIET: 'QUIET',

  // Package paths - Open Source
  OS_PRESET_NEXTJS: 'OS_PRESET_NEXTJS',
  OS_PRESET_API: 'OS_PRESET_API',
  OS_PREID: 'OS_PREID',

  // Package paths - Internal
  INTERNAL_PRESET_WEBAPP: 'INTERNAL_PRESET_WEBAPP',
  INTERNAL_PRESET_API: 'INTERNAL_PRESET_API',
  INTERNAL_PRESET_HCS: 'INTERNAL_PRESET_HCS',
  INTERNAL_PREID: 'INTERNAL_PREID',
  INTERNAL_REGISTRY: 'INTERNAL_REGISTRY',

  // Template paths - Open Source
  OS_TEMPLATE_NEXTJS_APP: 'OS_TEMPLATE_NEXTJS_APP',
  OS_TEMPLATE_NEXTJS_PAGES: 'OS_TEMPLATE_NEXTJS_PAGES',
  OS_TEMPLATE_NEXTJS_EXPRESS: 'OS_TEMPLATE_NEXTJS_EXPRESS',
  OS_TEMPLATE_API_EXPRESS: 'OS_TEMPLATE_API_EXPRESS',
  OS_TEMPLATE_API_FASTIFY: 'OS_TEMPLATE_API_FASTIFY',

  // Template paths - Internal
  TEMPLATE_WEBAPP_APP: 'TEMPLATE_WEBAPP_APP',
  TEMPLATE_WEBAPP_PAGES: 'TEMPLATE_WEBAPP_PAGES',
  TEMPLATE_WEBAPP_EXPRESS: 'TEMPLATE_WEBAPP_EXPRESS',
  TEMPLATE_API_EXPRESS: 'TEMPLATE_API_EXPRESS',
  TEMPLATE_API_FASTIFY: 'TEMPLATE_API_FASTIFY',
  TEMPLATE_HCS: 'TEMPLATE_HCS'
};

// CLI commands
export const COMMANDS = {
  BUILD_ONLY: 'build_only',
  TEST_ONLY: 'test_only',
  RENDER_ONLY: 'render_only',
  PRINT_REPORTS: 'print_reports',
  REPORT_HTML: 'report_html',
  REPORT_JSON: 'report_json',
  REPORT_FAILURES: 'report_failures'
};

// Wait times (in ms)
export const WAIT_TIMES = {
  // DEFAULT: Used for general-purpose waits. 1000ms was chosen as a balance between responsiveness and allowing asynchronous operations to settle.
  DEFAULT: 1000,
  // SERVER_START: Allows time for server processes to start up before running tests. 2500ms was determined empirically to be sufficient for most environments.
  SERVER_START: 2500
};

// Error patterns to ignore
export const IGNORED_ERRORS = [
  'Not implemented: window.computedStyle',
  'Found lockfile missing swc dependencies, patching',
  'Failed to patch lockfile, please try uninstalling and reinstalling next in this workspace',
  'Error: Failed to fetch registry info',
  'Linking failure in asm.js',
  'No GASKET_ENV env variable set; defaulting to "local"',
  'Server preloading locales complete',
  'Import trace for requested module',
  'DeprecationWarning:',
  '<w> [webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo]',
  'Build dependencies behind this expression are ignored and might cause incorrect cache invalidation',
  'npm http fetch GET 200',
  'npm http cache',
  'Invalid option \'--ext\' - perhaps you meant \'-c\'?',
  '[WARNING] Docs markdown',
  'nodemon',
  'npm warn deprecated'
];
