import path from 'path';
import glob from 'glob';
import { promisify } from 'util';
import fs from 'fs-extra';

import { WarehouseSDK } from 'warehouse.ai-api-client';
import { getFilesAndDir, createTarball } from 'warehouse.ai-api-client/lib/utils/file.js';

const globAsync = promisify(glob);

/**
 * pause for a given number of milliseconds
 * @param {number} ms - The time to wait in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified time
 * @private
 */
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * copy a directory
 * @param {string} src - The source directory
 * @param {string} dest - The destination directory
 * @param {string[]} excludePattern - The pattern to exclude
 * @private
 */
async function copyDirectory(src, dest, excludePattern) {
  await fs.emptyDir(dest);

  const files = await globAsync(`${src}/**/*`, { ignore: excludePattern });

  // Filter out directories to only copy files
  const filesToCopy = [];
  for (const file of files) {
    const stat = await fs.lstat(file);
    if (stat.isFile()) {
      filesToCopy.push(file);
    }
  }

  // Copy files with controlled concurrency
  const copyFile = async (file) => {
    const destPath = path.join(dest, path.relative(src, file));
    await fs.ensureDir(path.dirname(destPath));
    await fs.copyFile(file, destPath);
  };

  // Process in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < filesToCopy.length; i += batchSize) {
    const batch = filesToCopy.slice(i, i + batchSize);
    await Promise.all(batch.map(copyFile));
  }
}

/**
 * verify the files that are present
 * @param {string[]} files - The files to verify
 * @param {string[]} expectedFiles - The expected files that should be present
 * @private
 */
function verifyPublishFiles(files, expectedFiles = []) {
  const missingFiles = expectedFiles.filter(file => !files.includes(file));

  if (missingFiles.length) {
    throw new Error(`Missing expected files: ${missingFiles.join(', ')}.`);
  }
}

/**
 * get the package name and version
 * @param {import('@gasket/core').Gasket} gasket - The Gasket instance
 * @returns {Promise<{packageName: string, packageVersion: string}>} The package name and version
 * @private
 */
async function getPackageNameAndVersion(gasket) {
  const pkgFile = path.join(gasket.config.root, 'package.json');
  const pkgContent = await fs.readFile(pkgFile, 'utf8');
  const pkg = JSON.parse(pkgContent);
  return {
    packageName: pkg.name,
    packageVersion: pkg.version
  };
}

/**
 * upload a tarball file to warehouse
 * @param {import('@gasket/core').Gasket} gasket - The Gasket instance
 * @param {import('warehouse.ai-api-client').WarehouseSDK} client - The Warehouse SDK instance
 * @param {string} tarPath - The path to the tarball
 * @returns {Promise<unknown>} The data from the upload
 * @private
 */
async function uploadToWarehouse(gasket, client, tarPath) {
  try {
    const data = await client()._request.uploadFile({
      endpoint: '/cdn',
      filepath: tarPath,
      query: {
        use_single_fingerprint: true
      }
    });
    gasket.logger.info(`warehouse: upload: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (err) {
    gasket.logger.error(`warehouse: upload: ${err.message}`);
    throw err;
  }
}

/**
 * verify the upload to warehouse
 * @param {import('@gasket/core').Gasket} gasket - The Gasket instance
 * @param {import('warehouse.ai-api-client').WarehouseSDK} client - The Warehouse SDK instance
 * @param {object} params - The parameters for the verification
 * @param {string} params.env - The environment
 * @param {string} params.packageName - The name of the package
 * @param {string} params.packageVersion - The version of the package
 * @param {string} params.variant - The variant
 * @returns {Promise<unknown>} The verification results
 * @private
 */
async function verifyUploadToWarehouse(gasket, client, { env, packageName, packageVersion, variant }) {
  try {
    const results = await client().object().get({
      name: packageName,
      env,
      version: packageVersion,
      acceptedVariants: [variant]
    });
    gasket.logger.info(`warehouse: verify: ${JSON.stringify(results, null, 2)}`);
    return results;
  } catch (err) {
    gasket.logger.error(`warehouse: verify: ${err.message}`);
    throw err;
  }
}

/**
 * set the head in warehouse
 * @param {import('@gasket/core').Gasket} gasket - The Gasket instance
 * @param {import('warehouse.ai-api-client').WarehouseSDK} client - The Warehouse SDK instance
 * @param {object} params - The parameters for the set head
 * @param {string} params.env - The environment
 * @param {string} params.packageName - The name of the package
 * @param {string} params.packageVersion - The version of the package
 * @returns {Promise<void>} A promise that resolves when the head is set
 * @private
 */
async function setHeadInWarehouse(gasket, client, { env, packageName, packageVersion }) {
  try {
    const results = await client().object().setHead({
      name: packageName,
      env,
      version: packageVersion
    });
    gasket.logger.info(`warehouse: set-head: ${JSON.stringify(results, null, 2)}`);
  } catch (err) {
    if (err.message && err.message.includes('is already set for object')) {
      let parsedMessage = null;
      if (typeof err.message === 'string' && err.message.includes('409 Conflict ')) {
        const jsonPart = err.message.split('409 Conflict ')[1];
        try {
          const parsed = JSON.parse(jsonPart);
          parsedMessage = parsed && parsed.message ? parsed.message : jsonPart;
        } catch (parseErr) {
          gasket.logger.error(`failed to parse error message. ${parseErr.message}`);
          parsedMessage = jsonPart || err.message;
        }
      } else {
        parsedMessage = err.message;
      }
      gasket.logger.info(
        `warehouse: set-head: ${parsedMessage} (caught)`
      );
    } else {
      gasket.logger.error(`warehouse: set-head: ${err.message}`);
      throw err;
    }
  }
}

/** @type {import('@gasket/core').HookHandler<'commands'>} */
function commands(gasket) {
  return {
    id: 'hcs-publish',
    description: 'Publish HCS assets to Warehouse',
    options: [
      {
        name: 'setHead',
        description: 'Whether to set the head in warehouse',
        required: false,
        short: 'h',
        type: 'boolean'
      }
    ],
    action: async ({ setHead = false }) => {
      gasket.logger.info(`Starting Warehouse publish with setHead: ${setHead}`);

      try {
        if (!gasket?.config?.env || !gasket?.config?.wrhs) {
          gasket.logger.error('Missing required configuration for publishing to Warehouse');
          return;
        }

        if (gasket.config.env === 'local') {
          gasket.logger.info('Skipping Warehouse publish for local environment');
          return;
        }

        const { env, wrhs: warehouseConfig } = gasket.config;
        const { baseUrl, username, password, variant = '_default', expiry, mustIncludeFiles = [], excludeFiles = [] } = warehouseConfig;

        const { packageName, packageVersion } = await getPackageNameAndVersion(gasket);

        gasket.logger.info(`Publishing ${packageName}@${packageVersion} to Warehouse in ${env} environment for variant ${variant}`);
        const client = () => new WarehouseSDK({ baseUrl, username, password });

        gasket.logger.info('Copying files to build-wrhs directory');
        const normalizedExcludeFiles = excludeFiles.map((p) => (p.includes('/') ? p : `**/${p}`));
        await copyDirectory('build', 'build-wrhs', ['**/*.server.js*', '**/*.server.cjs*', '**/*.map*', ...normalizedExcludeFiles]);

        const { dir, files } = await getFilesAndDir('build-wrhs');
        verifyPublishFiles(files, mustIncludeFiles);

        const { tarPath, deleteTarball } = await createTarball(dir, files);
        gasket.logger.info(`warehouse: bundle ready`);

        const uploadData = await uploadToWarehouse(gasket, client, tarPath);

        // after upload, delete the tarball
        deleteTarball();

        const asset = { name: packageName, env, version: packageVersion, data: uploadData, variant };

        if (expiry) {
          asset.expiration = expiry;
        }
        gasket.logger.info(`warehouse: variant: ${variant}, expiration: ${expiry ?? 'never'}`);

        try {
          await client().object().create(asset);
          gasket.logger.info(`warehouse: object created`);
        } catch (err) {
          gasket.logger.error(`warehouse: create: ${err.message}`);
          throw err;
        }

        await pause(2000);

        await verifyUploadToWarehouse(gasket, client, { env, packageName, packageVersion, variant });

        if (setHead) {
          await setHeadInWarehouse(gasket, client, { env, packageName, packageVersion });
        } else {
          gasket.logger.info(`warehouse: set-head: skipped`);
        }
      } catch (err) {
        gasket.logger.error(`warehouse: error during publish: ${err.message}`);
        throw err;
      }
    }
  };
}

export default commands;
