const withPatchSpinner = require('../with-patch-spinner');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const label = 'Update next/image imports using Next.js codemod';

/**
 * Transforms a file using the Next.js codemod.
 *
 * @param {string} filePath - The path to the file to transform
 * @returns {string[]} An array of modified values
 */
async function transform(filePath) {
  try {
    const { stdout } = await exec(
      `npx @next/codemod@^13 next-image-to-legacy-image ${filePath} --force`,
      { encoding: 'utf-8' }
    );
    const okkRegex = /OKK\s+(.*?)\s+/g;
    const modified = [];

    let match = okkRegex.exec(stdout);
    while (match != null) {
      const value = match[1].trim();
      modified.push(value);
      match = okkRegex.exec(stdout);
    }

    return modified;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return [];
  }
}

/**
 * Updates Next.js image components in a single file.
 *
 * @param {string} content - The content of a file
 * @param {string} filePath - The path to the file
 * @returns {string[]} An array of modified values
 */
async function updateNextImageInFile(content, filePath) {
  const reNextImageImport = /next\/image/g;

  if (typeof content !== 'object' && reNextImageImport.test(content)) {
    return await transform(filePath);
  }
  return [];
}

/**
 * Updates Next.js image components in the provided context.
 *
 * @param {object} context - The context containing files and messages
 * @param {Map<string, string>} context.files - A Map containing file content
 * with file paths as keys.
 * @param {string[]} context.messages - An array to store update messages.
 * @param {object} spinner - The spinner object for logging
 */
async function updateNextImageComponents({ files, messages }, spinner) {
  const modifiedFiles = [];

  await Promise.all(
    Array.from(files).map(async ([filePath, content]) => {
      const modified = await updateNextImageInFile(content, filePath);
      if (modified.length) {
        modifiedFiles.push({ filePath, modified });
      }
    })
  );

  if (modifiedFiles.length) {
    modifiedFiles.forEach(({ modified }) => {
      messages.push(
        ...modified.map(
          (f) => `${f} - updated to rename \`next/image\` imports`
        )
      );
    });
  } else {
    spinner.info(`${label} (avoided)`);
  }
}

module.exports = withPatchSpinner(label, updateNextImageComponents);
