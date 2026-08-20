/* eslint-disable no-console, no-sync, max-statements */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

/**
 * Shortcut to stringfy and object in a readable way
 * @param {object} json - Object to stringify very prettily
 * @returns {string} pretty
 */
const prettyPrint = (json) => JSON.stringify(json, null, 2) + '\n';

/**
 * Set standard properties in packages
 * @param {object} pkgJson - package.json contents
 */
function fixedProperties(pkgJson) {
  const { name } = pkgJson;

  pkgJson.author = 'GoDaddy Operating Company, LLC';
  pkgJson.publishConfig = {
    registry:
      'https://gdartifactory1.jfrog.io/artifactory/api/npm/npm-gasket-core-local/'
  };
  pkgJson.license = 'UNLICENSED';

  if (!pkgJson.maintainers) {
    console.warn(`${name} does not have maintainers.`);
  }

  if (['@godaddy/gasket', 'generate-docs-index'].includes(name)) return;

  pkgJson.repository = {
    type: 'git',
    url: 'https://github.com/gdcorp-uxp/gasket.git',
    directory: `packages/${name.replace('@godaddy/', '')}`
  };
}

/**
 * Checks for expected scripts and warns if missing
 * @param {object} pkgJson - package.json contents
 */
function checkScripts(pkgJson) {
  const { name, scripts } = pkgJson;

  const expected = ['test', 'test:coverage', 'posttest'];

  expected.forEach((s) => {
    if (scripts && !(s in scripts)) {
      console.warn(`${name} does not have script: ${s}`);
    }
  });
}

/**
 * Clears maintainers from package.json
 * @param {object} pkgJson - package.json contents
 */
function checkMaintainers(pkgJson) {
  delete pkgJson.maintainers;
}

/**
 * Ensure homepage matches package location in repo
 * @param {object} pkgJson - package.json contents
 */
function checkHomepage(pkgJson) {
  const { name } = pkgJson;

  if (name === '@godaddy/gasket') {
    return;
  }

  const pkgName = name.replace('@godaddy/', '');
  pkgJson.homepage = `https://github.com/gdcorp-uxp/gasket/tree/main/packages/${pkgName}`;
}

/**
 * Add files[] to package.json for packing
 * @param {string} pkgPath path to a package.json file
 * @param {object} pkgJson - package.json contents
 */
function fixupPublishFiles(pkgPath, pkgJson) {
  const pkgDir = path.dirname(pkgPath);
  const actual = fs.readdirSync(pkgDir);
  const files = new Set(pkgJson.files || []);

  const possible = [
    'src',
    'lib',
    '.babelrc',
    'babel.config.js',
    'generator',
    'docs',
    'bin'
  ];

  possible.filter((f) => actual.includes(f)).forEach((f) => files.add(f));
  if (files.size) {
    pkgJson.files = Array.from(files);
  }
}

/**
 * Read, fix up, and write out updated package.json file
 * @param {string} pkgPath path to a package.json file
 * @returns {Promise} promise
 */
async function fixupPackage(pkgPath) {
  let pkgJson;
  try {
    pkgJson = JSON.parse(await fs.promises.readFile(pkgPath));
  } catch (e) {
    console.error(e.message);
    return;
  }

  fixedProperties(pkgJson);
  fixupPublishFiles(pkgPath, pkgJson);

  checkScripts(pkgJson);
  checkMaintainers(pkgJson);
  checkHomepage(pkgJson);

  await fs.promises.writeFile(pkgPath, prettyPrint(pkgJson));
  console.log('aligned', path.relative(projectRoot, pkgPath));
}
/**
 * Finds all the packages and fixes them up
 * @returns {Promise} promise
 */
async function main() {
  const packagesDir = path.join(projectRoot, 'packages');
  const lockFile = path.join(projectRoot, 'package-lock.json');

  const paths = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory()
    )
    .map((dirent) => path.join(packagesDir, dirent.name, 'package.json'));

  paths.push(path.join(projectRoot, 'package.json'));
  paths.push(path.join(projectRoot, 'scripts', 'generate-docs-index', 'package.json'));

  // Keep track of updated dependencies which will be pruned from the lockfile
  // to ensure a clean installation of desired versions.
  const updatedSet = new Set(
  );

  const aligned = await Promise.all(paths.map(async pkgPath => {
    await fixupPackage(pkgPath);
    return path.relative(projectRoot, pkgPath);
  }));

  console.log(chalk.bold(`Aligned ${aligned.length} packages`));
  console.log(chalk.bold(`Updated ${updatedSet.size} dependencies`));

  if (updatedSet.size) {
    const lockJson = JSON.parse(await fs.promises.readFile(lockFile));
    const lockDepNames = Object.keys(lockJson.packages);
    lockDepNames.forEach(depName => {
      updatedSet.forEach(updatedDepName => {
        if (depName.endsWith(`node_modules/${updatedDepName}`)) {
          delete lockJson.packages[depName];
        }
      });
    });

    await fs.promises.writeFile(lockFile, prettyPrint(lockJson));
    console.log(chalk.bold('Removed lockfile entries'));
    updatedSet.forEach(depName => {
      console.log(chalk.gray(`- ${depName}`));
    });
  }

  console.log('\nFinished.');
}

main();
