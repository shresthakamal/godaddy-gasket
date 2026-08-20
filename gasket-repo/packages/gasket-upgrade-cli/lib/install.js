/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const ora = require('ora');
const { promisify } = require('util');
const { PackageManager } = require('@gasket/utils');
const withSpinner = require('./with-spinner');

const rimraf = promisify(require('rimraf'));

/**
 * Removes existing node modules then installs
 * @param {object} context - Context
 * @param {object} context.cwd - Path to target project root
 * @param {object} context.flags - Command line flags
 * @async
 */
async function cleanInstall({ cwd, flags }) {

  if (!flags.install) {
    ora('Install skipped.').warn();
    return;
  }

  //
  // assume npm unless we find a yarn.lock
  //
  let cmd = 'npm';
  let lockFile = 'package-lock.json';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    cmd = 'yarn';
    lockFile = 'yarn.lock';
  }

  const manager = new PackageManager({ packageManager: cmd, dest: cwd });

  await withSpinner('Clean node_modules', () => rimraf(path.join(cwd, 'node_modules')))();

  await withSpinner(`Remove ${lockFile}`, () => rimraf(path.join(cwd, lockFile)))();

  await withSpinner(`Install node modules (${cmd})`, () => manager.install())();
}

module.exports = cleanInstall;
