const path = require('path');
const simpleGit = require('simple-git');
const { promisify } = require('util');

const fs = require('fs').promises;

const glob = promisify(require('glob'));

const prettyJSON = json => JSON.stringify(json, null, 2) + '\n';

/**
 * Extended Map to keeps track of modified files
 */
class FileSet extends Map {
  constructor() {
    super();
    this._modified = new Set();
    this._set = super.set;
  }

  set(k, v) {
    super.set(k, v);
    this._modified.add(k);
  }

  delete(k) {
    super.delete(k);
    this._modified.delete(k);
  }
}

/**
 * Add a file map and updateContent function to a context
 * @param {object} [init] - Optional existing context to start from
 * @returns {object} context
 */
function makeContext(init = {}) {
  const cwd = init.cwd || process.cwd();
  const pkg = init.pkg || require(path.join(cwd, 'package.json'));

  const context = {
    cwd,
    pkg,
    git: simpleGit(),
    files: new FileSet(),
    messages: [],
    nextSteps: [],
    ...init
  };

  /**
   * Callback to transform string content or an object for .json files.
   * @callback transformCallback
   * @param {string|object} content - Loaded file contents
   * @returns {string|object} transformed content
   */

  /**
   * If a given filePath is loaded, transform its content with provided function.
   * @param {string} filePath - Relative path to a file
   * @param {transformCallback} transform - Callback to modify content of file is found
   */
  function updateContent(filePath, transform) {
    const { files } = context;
    const content = files.get(filePath);
    if (content) {
      files.set(filePath, transform(content));
    }
  }

  /**
   * If a given filePath is loaded, transform its content with provided function.
   * @param {string} filePath - Relative path to a file
   * @param {string} content - File content
   */
  function addContent(filePath, content) {
    const { files } = context;
    files.set(filePath, content);
  }

  context.updateContent = updateContent;
  context.addContent = addContent;

  return context;
}

/**
 * Utility class to load, patch, and save file contents.
 */
class Patcher {
  /**
   * @param {object} context - Context
   * @param {object} context.cwd - Path to target project root
   */
  constructor(context) {
    this.context = makeContext(context);
  }

  /**
   * Loads all javascript files as well as package.json
   * @async
   */
  async load() {
    const { cwd, files } = this.context;

    const filePaths = (await glob('**/*.{js,jsx,ts,tsx}', {
      cwd,
      ignore: ['node_modules/**', 'build/**', '.next/**', '.dist/**']
    }));

    filePaths.push('package.json');

    /**
     *
     * @param relPath
     */
    async function readContents(relPath) {
      const absPath = path.join(cwd, relPath);

      // Verify that we actually are reading a file rather
      // than a directory with a .{js,jsx,ts,tsx} extension
      const stat = await fs.stat(absPath);

      if (stat.isFile()) {
        let content = await fs.readFile(absPath, 'utf8');

        if (path.extname(absPath) === '.json') {
          content = JSON.parse(content);
        }

        files._set(relPath, content);
      }
    }

    return await Promise.all(filePaths.map(filePath => readContents(filePath)));
  }

  /**
   * Apply provided patches to all files
   * @param {Function} patches File patching function
   * @async
   */
  async apply(patches) {
    const _patches = patches.filter(Boolean);
    // handle prompts
    for (const patch of _patches) {
      if ('prompt' in patch) await patch.prompt(this.context);
    }

    // apply the patches
    for (const patch of _patches) {
      await patch(this.context);
    }
  }

  /**
   * Save changes to all files
   * @async
   */
  async save() {
    const { cwd, files, git } = this.context;

    const promises = [];
    files.forEach((content, relPath) => {
      if (files._modified.has(relPath)) {
        const absPath = path.join(cwd, relPath);

        if (path.extname(absPath) === '.json' && typeof content !== 'string') {
          content = prettyJSON(content);
        }
        promises.push(fs.writeFile(absPath, content, 'utf8'));
      }
    });

    await Promise.all(promises);
    await git.add(Array.from(files._modified));
  }
}

module.exports = Patcher;
module.exports.makeContext = makeContext;
