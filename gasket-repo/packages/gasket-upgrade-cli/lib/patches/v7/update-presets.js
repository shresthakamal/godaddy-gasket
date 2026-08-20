const withPatchSpinner = require('../with-patch-spinner');
const { runShellCommand } = require('@gasket/utils');
const createOnlyPluginMap = require('../../utils/create-only-plugins');
const path = require('path');

/**
 * Update presets - flatten dependencies
 *
 * @param {Map} files - Collection of filePaths to content
 * @param {function} updateContent - Transform content
 */
async function updatePresets({ updateContent, files, git, cwd, messages }) {
  const pkg = files.get('package.json');
  const presets = Object.keys(pkg.dependencies).filter((key) => key.includes('@gasket/preset') || key.includes('gasket-preset'));

  for (const preset of presets) {
    let stringDeps = (
      await runShellCommand('npm', ['info', preset, 'dependencies'], {
        cwd: process.cwd()
      })
    ).stdout;
    stringDeps = stringDeps.replace(/'/g, '"');

    const deps = Object.entries(JSON.parse(stringDeps)).reduce((acc, [key, value]) => {
      if (createOnlyPluginMap[key]) return acc;
      acc[key] = value;
      return acc;
    }, {});

    updateContent('package.json', (content) => {
      delete content.dependencies[preset];
      Object.assign(content.dependencies, deps);
      return content;
    });

    try {
      await git.add(path.join(cwd, 'package.json'));
    } catch {
      messages.push('Git error adding package.json');
    }
  }
}

module.exports = withPatchSpinner('Update presets', updatePresets);
