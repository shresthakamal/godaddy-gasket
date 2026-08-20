/* eslint-disable no-sync */
const withPatchSpinner = require('../with-patch-spinner');
const fs = require('fs');
const path = require('path');

const label = 'Rename config/ to gasket-data/';

const renameFileOrDirMap = {
  'config': 'gasket-data',
  'app.config.js': 'gasket-data.config.js'
};

const renameMapKeys = Object.keys(renameFileOrDirMap);

function createPath(cwd, name) {
  return path.join(cwd, name);
}

function createRegex(name, file) {
  if (file) {
    return new RegExp(`(?:require\\(['"].*?\\/${name}['"]\\)|import.*?['"].*?\\/${name}['"])`, 'g');
  }
  return new RegExp(`(?:require\\(['"].*?\\/(${name}\\/.*?)['"]\\)|import.*?['"].*?\\/(${name}\\/.*?)['"])`, 'g');
}

function fixupRefs(content, existsKeysList) {
  existsKeysList.forEach((key) => {
    const file = key.includes('.');
    content = content.replace(createRegex(key, file), function rename(match) {
      const dirRegex = new RegExp(`\\b${key}(?![^/]*\\.)\\b`);
      if (key.includes('.')) {
        return match.replace(key, renameFileOrDirMap[key]);
      }
      return match.replace(dirRegex, renameFileOrDirMap[key]);
    });
  });
  return content;
}

/**
 * Renames config files and updates file paths
 *
 * @param {Map} files - Collection of filePaths to content
 * @param {Object} git - git utilities
 * @param {Object} cwd - current working directory
 */
async function configureResponseDataPlugin({ cwd, git, files, messages }) {
  const existsKeysList = [];
  for (const oldName of renameMapKeys) {
    const oldNamePath = createPath(cwd, oldName);
    if (fs.existsSync(oldNamePath) && !fs.existsSync(createPath(cwd, renameFileOrDirMap[oldName]))) {

      const newPath = createPath(cwd, renameFileOrDirMap[oldName]);
      try {
        await git.mv(oldNamePath, newPath);
      } catch {
        messages.push(`Git error renaming renaming ${oldNamePath} to ${newPath}`);
      }
      existsKeysList.push(oldName);
    }
  }

  if (existsKeysList.length > 0) {
    files.forEach((content, filePath) => {
      if (typeof content !== 'object') {
        let nextFilePath = filePath;
        if (filePath.includes('config/')) {
          files.delete(filePath);
          nextFilePath = filePath.replace('config/', 'gasket-data/');
        }
        files.set(nextFilePath, fixupRefs(content, existsKeysList));
      }
    });
  }
}

module.exports = withPatchSpinner(label, configureResponseDataPlugin);
