/* eslint-disable no-console */
const { Command } = require('commander');
const Patcher = require('./patcher');
const install = require('./install');
const printReport = require('./print-report');
const withSpinner = require('./with-spinner');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const pkg = require('../package.json');

const program = new Command();

program
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'show CLI version')
  .addHelpCommand(true)
  .option('install', 'Clean and install node modules', true)
  .option('--no-install', 'Skip installing node modules');

program
  .option('--next-13', 'Upgrade to Next v13 for Gasket v6/v2', false)
  .option('--next-12', 'Upgrade to Next v12 for Gasket v6/v2', false)
  .option('--v7', 'Upgrade to Gasket v7/v3', false)
  .option('--v6', 'Upgrade to Gasket v6/v2', false);

program.parse(process.argv);

/**
 * Runs the main functionality of the tool.
 */
async function run() {
  const flags = program.opts();
  const patcher = new Patcher({ flags });
  await prepareFiles(patcher);
  const patches = await detectPatches(patcher);
  await applyPatches(patches, patcher);
  await finishPatching(patcher);
  await saveModifiedFiles(patcher);
  await installRequiredModules(patcher);
  await lintFix();
  printPatchingReport(patcher);
}

/**
 * Defines the patches to apply for different versions.
 */
const patchesToApply = {
  'v6': [
    require('./patches/v6/update-dependencies'),
    require('./patches/v6/update-imports'),
    require('./patches/v6/rename-static-dir'),
    require('./patches/v6/move-locales-to-public'),
    require('./patches/v6/ignore-locales-artifacts'),
    require('./patches/v6/update-golf-manifest'),
    require('./patches/v6/configure-intl-plugin'),
    require('./patches/v6/update-eslint-locales-config'),
    require('./patches/v6/update-locale-paths'),
    require('./patches/v6/cleanup-redux-reducers'),
    require('./patches/v6/update-redux-store'),
    require('./patches/v6/update-css-modules'),
    require('./patches/v6/add-custom-error-page')
  ],
  'v7': [
    require('./patches/v7/configure-response-data-plugin'),
    require('./patches/v7/rename-deprecated-functions'),
    require('./patches/v7/update-elastic-apm-setup'),
    require('./patches/v7/update-nextjs-document-file'),
    require('./patches/v7/update-nextjs-app-file'),
    require('./patches/v7/update-logger'),
    require('./patches/v7/update-dependencies'),
    require('./patches/v7/update-imports'),
    require('./patches/v7/rename-locale-required'),
    require('./patches/v7/update-presets'),
    require('./patches/v7/update-gasket-file'),
    require('./patches/v7/add-server-file'),
    require('./patches/v7/update-package-scripts'),
    require('./patches/v7/update-to-esm'),
    require('./patches/v7/add-next-config'),
    require('./patches/v7/fixup-package-scripts')
  ],
  'next-12': [
    require('./patches/next-12/update-dependencies'),
    require('./patches/next-12/rename-static-dir'),
    require('./patches/next-12/setup-rtlcss'),
    require('./patches/next-12/update-enzyme-adapter'),
    require('./patches/next-12/update-eslint'),
    require('./patches/next-12/update-images'),
    require('./patches/next-12/cleanup-babel-config')
  ],
  'next-13': [
    require('./patches/next-13/update-dependencies'),
    require('./patches/next-13/update-next-image-legacy'),
    require('./patches/next-13/update-next-images'),
    require('./patches/next-13/update-next-links'),
    require('./patches/next-13/update-eslint')
  ]
};

/**
 * Prepares files for patching.
 * @param {Patcher} patcher - The Patcher instance.
 */
async function prepareFiles(patcher) {
  console.log('\nPreparing');
  await withSpinner('Load files', () => patcher.load())();
}

/**
 * Detects which patches are needed.
 * @param {Patcher} patcher - The Patcher instance.
 * @returns {object} - An object containing detected patches.
 */
async function detectPatches({ context }) {
  const patchSets = ['next-13', 'next-12', 'v7', 'v6'].reduce((acc, cur) => {
    acc[cur] = context.flags[cur];
    return acc;
  }, {});

  const hasPatches = Object.values(patchSets).some((v) => v === true);

  if (hasPatches) {
    return patchSets;
  }

  console.log('\nDetecting support');

  const checks = [
    ['v6', require('./patches/v6/check')],
    ['next-12', require('./patches/next-12/check')],
    ['next-13', require('./patches/next-13/check')],
    ['v7', require('./patches/v7/check')]
  ];

  const patches = {};
  const makeExec = (check) => {
    return async (ctx, spinner) => {
      const [name, fn] = check;
      const results = await fn(ctx);
      patches[name] = !results;
      if (!results) spinner.warn(`${fn.label} (needed)`);
      return results;
    };
  };

  for (const check of checks) {
    const [, fn] = check;
    await withSpinner(fn.label, makeExec(check))(context);
  }

  context.patches = patches;
  return patches;
}

/**
 * Applies detected patches.
 * @param {object} detectedPatches - An object containing detected patches.
 * @param {Patcher} patcher - The Patcher instance.
 */
async function applyPatches(detectedPatches, patcher) {
  console.log('\nApplying');

  const patchVersions = ['v6', 'next-12', 'next-13', 'v7'];

  for (const version of patchVersions) {
    if (detectedPatches[version]) {
      console.log(`- Apply ${version.replace('-', ' ').toUpperCase()} Patches`);
      await patcher.apply(patchesToApply[version]);
    }
  }
}

/**
 * Finishes the patching process.
 * @param {Patcher} patcher - The Patcher instance.
 */
async function finishPatching(patcher) {
  console.log('- Finish Patches');
  try {
    await patcher.apply([require('./patches/common/sort-package')]);
  } catch (error) {
    console.error('Error while finishing patches:', error);
  }
}

/**
 * Saves modified files.
 * @param {Patcher} patcher - The Patcher instance.
 */
async function saveModifiedFiles(patcher) {
  await withSpinner('Save files', () => patcher.save())();
}

/**
 * Installs required modules.
 * @param {Patcher} patcher - The Patcher instance.
 */
async function installRequiredModules(patcher) {
  try {
    await install(patcher.context);
  } catch (error) {
    console.error('Error while installing modules:', error);
  }
}

/**
 * Runs ESLint with the --fix option to automatically fix linting issues in
 * the code.
 */
async function lintFix() {
  try {
    await withSpinner('Run ESLint with --fix', async () => {
      await exec('npm run lint:fix');
    })();
  } catch (error) {
    console.error(`Error running ESLint with --fix: ${error.message}`);
  }
}

/**
 * Prints the patching report.
 * @param {Patcher} patcher - The Patcher instance.
 */
function printPatchingReport(patcher) {
  try {
    printReport(patcher.context);
  } catch (error) {
    console.error('Error while printing report:', error);
  }
}

module.exports = run;
