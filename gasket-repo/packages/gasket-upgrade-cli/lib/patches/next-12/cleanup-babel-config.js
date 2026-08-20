const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const withPatchSpinner = require('../with-patch-spinner');

const label = 'Cleanup babel config';

const babelConfig =
  `require('@babel/register')({
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          modules: 'commonjs'
        }
      }
    ]
  ]
});
`;

async function findBabelConfig(context) {
  const { cwd, pkg } = context;

  if ('babel' in pkg) return 'package.json';

  const existing = await glob('+(.babel|babel)*', { cwd, dot: true });
  return existing[0];
}

async function fixup(context, spinner) {
  const { git, pkg, updateContent, addContent } = context;
  const configFile = await findBabelConfig(context);

  if (!configFile) {
    spinner.info(`${ label } (skipped)`);
    return;
  }

  if (configFile === 'package.json') {
    updateContent('package.json', content => {
      delete content.babel;
      return content;
    });
  } else {
    await git.rm(configFile);
  }

  // If the app is using mocha, add the setup file to support commonjs
  if (pkg.devDependencies && 'mocha' in pkg.devDependencies && pkg.scripts) {

    updateContent('package.json', content => {
      // find the mocha script where setup env is required then add setup file
      const script = Object.entries(content.scripts).find(([, v]) => v.includes('setup-env'));

      if (script) {
        addContent(path.join('test', 'setup.js'), babelConfig);

        const [key, value] = script;
        content.scripts[key] = value
          .replace(/-+r(?:equire)? setup-env/, '-r setup-env -r ./test/setup.js');
      }
      return content;
    });
  }
}

module.exports = withPatchSpinner(label, fixup);
