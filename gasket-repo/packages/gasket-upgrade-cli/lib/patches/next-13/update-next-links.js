const withPatchSpinner = require('../with-patch-spinner');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const label = 'Update next/link components using Next.js codemod';

/**
 * Transforms a file using the Next.js codemod.
 *
 * @param {string} filePath - The path to the file to transform
 * @returns {string[]} An array of modified values
 */
async function transform(filePath) {
  try {
    const { stdout } = await exec(
      `npx @next/codemod@^13 new-link ${filePath} --force`,
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
 * Updates Next.js Link components in a single file.
 *
 * @param {string} content - The content of a file
 * @param {string} filePath - The path to the file
 * @returns {string[]} An array of modified values
 */
async function updateNextLinkInFile(content, filePath) {
  const reNextLinkImport = /next\/link/g;

  if (typeof content !== 'object' && reNextLinkImport.test(content)) {
    return await transform(filePath);
  }
  return [];
}

/**
 * Updates Next.js Link components in the provided context.
 *
 * @param {object} context - The context containing files, messages, and
 * nextSteps
 * @param {Map<string, string>} context.files - A Map containing file content
 * with file paths as keys.
 * @param {string[]} context.messages - An array to store update messages.
 * @param {string[]} context.nextSteps - An array to store next steps or
 * instructions.
 * @param {object} spinner - A spinner object for displaying progress or
 * information.
 */
async function updateNextLinkComponents(
  { files, messages, nextSteps },
  spinner
) {
  const modifiedFiles = [];

  await Promise.all(
    Array.from(files).map(async ([filePath, content]) => {
      const modified = await updateNextLinkInFile(content, filePath);
      if (modified.length) {
        modifiedFiles.push({ filePath, modified });
      }
    })
  );

  if (modifiedFiles.length) {
    modifiedFiles.forEach(({ modified }) => {
      messages.push(
        ...modified.map(
          (f) => `${f} - updated to use the latest version of \`next/link\``
        )
      );
    });

    nextSteps.push(`Legacy Link components were detected and modified to use the latest version of the next/link component.
    Be sure to check the results in your app and adjust accordingly.
    For reference, see: https://nextjs.org/docs/pages/api-reference/components/link`);
  } else {
    spinner.info(`${label} (avoided)`);
  }
}

module.exports = withPatchSpinner(label, updateNextLinkComponents);
