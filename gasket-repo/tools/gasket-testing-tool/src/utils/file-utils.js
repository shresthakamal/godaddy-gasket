import path from 'path';
import { mkdir, access, writeFile, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { DIRS } from '../config/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - The path to the directory to create
 */
export async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - The path to the file to check
 * @returns {boolean} Whether the file exists
 */
export async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create the applications directory
 * @returns {Promise<void>}
 */
export async function createAppsDir() {
  await ensureDir(DIRS.APPS);
}

/**
 * Create the reports directory
 * @returns {Promise<void>}
 */
export async function createReportsDir() {
  await ensureDir(DIRS.REPORTS);
}

/**
 * Create a report file with initial content
 * @param {string} filename - The name of the report file to create
 * @returns {Promise<void>}
 */
export async function createReportFile(filename) {
  const filePath = path.join(DIRS.REPORTS, filename);
  if (!(await fileExists(filePath))) {
    await writeFile(filePath, JSON.stringify({}), 'utf8');
  }
}

/**
 * Create multiple report files
 * @param {string[]} files - The names of the report files to create
 * @returns {Promise<void>}
 */
export async function createReportFiles(files) {
  await createReportsDir();
  for (const file of files) {
    await createReportFile(file);
  }
}

/**
 * Read a JSON file
 * @param {string} filePath - The path to the JSON file to read
 * @returns {Promise<object>} The JSON file content
 */
export async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return null;
  }
}

/**
 * Write a JSON file
 * @param {string} filePath - The path to the JSON file to write
 * @param {object} data - The data to write to the JSON file
 * @returns {Promise<void>}
 */
export async function writeJsonFile(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Create a registry file for internal applications
 * @param {string} appType - The type of app to create the registry file for
 * @param {string} registry - The registry to use for the internal applications
 * @returns {Promise<void>}
 */
export async function createRegistryFile(appType, registry) {
  const { isInternal } = await import('./app-type-utils.js');

  if (isInternal(appType) && registry) {
    if (!(await fileExists('./.npmrc'))) {
      await writeFile('./.npmrc', `registry=${registry}`, 'utf8');
    }
  }
}

/**
 * Write environment file template
 * @returns {Promise<void>}
 */
export async function writeEnvFile() {
  if (await fileExists('.env')) {
    return;
  }

  const contents = `
# See README.md for more information

# ===== PRESET VARIABLES =====
# OS_PRESET_NEXTJS=/<local-path-to>/packages/gasket-preset-nextjs
# OS_PRESET_API=/<local-path-to>/packages/gasket-preset-api

# INTERNAL_PRESET_WEBAPP=/<local-path-to>/packages/gasket-preset-webapp
# INTERNAL_PRESET_API=/<local-path-to>/packages/gasket-preset-api
# INTERNAL_PRESET_HCS=/<local-path-to>/packages/gasket-preset-hcs

# ===== TEMPLATE VARIABLES =====
# Open Source Templates
# OS_TEMPLATE_NEXTJS_APP=/<local-path-to>/packages/gasket-template-nextjs-app
# OS_TEMPLATE_NEXTJS_PAGES=/<local-path-to>/packages/gasket-template-nextjs-pages
# OS_TEMPLATE_NEXTJS_EXPRESS=/<local-path-to>/packages/gasket-template-nextjs-express
# OS_TEMPLATE_API_EXPRESS=/<local-path-to>/packages/gasket-template-api-express
# OS_TEMPLATE_API_FASTIFY=/<local-path-to>/packages/gasket-template-api-fastify

# Internal Templates
# TEMPLATE_WEBAPP_APP=/<local-path-to>/packages/gasket-template-webapp-app
# TEMPLATE_WEBAPP_PAGES=/<local-path-to>/packages/gasket-template-webapp-pages
# TEMPLATE_WEBAPP_EXPRESS=/<local-path-to>/packages/gasket-template-webapp-express
# TEMPLATE_API_EXPRESS=/<local-path-to>/packages/gasket-template-api-express
# TEMPLATE_API_FASTIFY=/<local-path-to>/packages/gasket-template-api-fastify
# TEMPLATE_HCS=/<local-path-to>/packages/gasket-template-hcs

# ===== GENERAL VARIABLES =====
# SKIP_CREATE=1
# RUN_BUILD=1
# RUN_START=1
# RUN_LOCAL=1
# RUN_TEST=1
# RUN_DOCS=1
# Skip local package prompt and default to local packages
# USE_LOCAL=1

# ===== LOGGING OPTIONS =====
# VERBOSE=1        # Show all output with detailed logging
# QUIET=1          # Show only errors

# INTERNAL_REGISTRY=https://some-registry.com`;

  await writeFile('.env', contents, 'utf8');
}

/**
 * Get the project root directory
 * @returns {string} The project root directory
 */
export function getProjectRoot() {
  return path.resolve(__dirname, '..', '..');
}

/**
 * Get the full path to an app directory
 * @param {string} appType - The type of app to get the path for
 * @returns {string} The full path to the app directory
 */
export function getAppPath(appType) {
  return path.join(DIRS.APPS, appType);
}

/**
 * Get the full path to a report file
 * @param {string} filename - The name of the report file to get the path for
 * @returns {string} The full path to the report file
 */
export function getReportPath(filename) {
  return path.join(DIRS.REPORTS, filename);
}
