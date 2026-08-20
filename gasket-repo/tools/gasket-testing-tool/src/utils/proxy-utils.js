import { readFile, writeFile } from 'fs/promises';
import { getGasketConfigExt, hasCustomServer, isApi } from './app-type-utils.js';
import { getAppPath } from './file-utils.js';

/**
 * Update proxy port configuration
 * @param {string} appType - The type of app to update
 */
async function updateProxyPort(appType) {
  const ext = getGasketConfigExt(appType);
  const gasketPath = `${getAppPath(appType)}/gasket${ext}`;
  const file = await readFile(gasketPath, 'utf8');
  const updated = file.replace(/port: 80/, 'port: 8080');
  await writeFile(gasketPath, updated, 'utf8');
  console.log(`Updated port for ${appType}`);
}

/**
 * Update proxy hostname configuration
 * @param {string} appType - The type of app to update
 */
async function updateProxyHost(appType) {
  const ext = getGasketConfigExt(appType);
  const gasketPath = `${getAppPath(appType)}/gasket${ext}`;
  const file = await readFile(gasketPath, 'utf8');
  const updated = file.replace(/hostname: .+/, 'hostname: \'localhost\',');
  await writeFile(gasketPath, updated, 'utf8');
  console.log(`Updated hostname for ${appType}`);
}

/**
 * Update proxy protocol configuration
 * @param {string} appType - The type of app to update
 */
async function updateProxyProtocol(appType) {
  const ext = getGasketConfigExt(appType);
  const gasketPath = `${getAppPath(appType)}/gasket${ext}`;
  const file = await readFile(gasketPath, 'utf8');
  const updated = file.replace(/protocol: 'https'/, 'protocol: \'http\'');
  await writeFile(gasketPath, updated, 'utf8');
  console.log(`Updated protocol for ${appType}`);
}

/**
 * Add empty SNI callback for proxy
 * @param {string} appType - The type of app to update
 */
async function addEmptySNICallback(appType) {
  const ext = getGasketConfigExt(appType);
  const gasketPath = `${getAppPath(appType)}/gasket${ext}`;
  const file = await readFile(gasketPath, 'utf8');
  const exists = file.includes('SNICallback');

  if (!exists) {
    const updated = file.replace(/ws: true,/, 'ws: true,\n    SNICallback: () => {},\n    ssl: false,');
    await writeFile(gasketPath, updated, 'utf8');
    console.log(`Added SNICallback for ${appType}`);
  }
}

/**
 * Update custom server configuration
 * @param {string} appType - The type of app to update
 */
async function updateCustomServerConfig(appType) {
  if (hasCustomServer(appType) || isApi(appType)) {
    const ext = getGasketConfigExt(appType);
    const gasketPath = `${getAppPath(appType)}/gasket${ext}`;
    const file = await readFile(gasketPath, 'utf8');
    const updated = file.replace(
      /data: gasketData/,
      'data: gasketData,\n  http: 8443,\n  hostname: \'localhost\''
    );
    await writeFile(gasketPath, updated, 'utf8');
    console.log(`Updated custom server config for ${appType}`);
  }
}

/**
 * Update proxy configuration for CI environment
 * @param {string} appType - The type of app to update
 */
export async function updateProxy(appType) {
  await updateProxyPort(appType);
  await updateProxyHost(appType);
  await updateProxyProtocol(appType);
  await addEmptySNICallback(appType);
  await updateCustomServerConfig(appType);
}

/**
 * Remove OTEL configuration for CI environment
 * @param {string} appType - The type of app to update
 */
export async function removeOtel(appType) {
  if (
    appType.includes('webapp') ||
    appType.includes('internal') ||
    appType.startsWith('template-')
  ) {
    const packagePath = `${getAppPath(appType)}/package.json`;
    const file = await readFile(packagePath, 'utf8');
    const updated = file.replace(
      "NODE_OPTIONS='--import @godaddy/gasket-otel/register' ",
      ''
    );
    await writeFile(packagePath, updated, 'utf8');
    console.log(`Updated package.json for ${appType}`);
  }
}
