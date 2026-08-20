const withPatchSpinner = require('../with-patch-spinner');
const path = require('path');
const fs = require('fs');

function removeComments(content) {
  // Regular expression to remove single-line comments (//) and multi-line comments (/* */)
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\/\/.*/g, ''); // Remove single-line comments
}

function hasEsmExportOrImport(content) {
  const importRegex = /^\s*import\s+.*\s+from\s+['"].*['"];/m;
  const esmExportRegex = /^\s*export\s+(default|{.*}|const|let|var|function|class|interface|type)\b/m;

  return importRegex.test(content) || esmExportRegex.test(content);
}

function isFileESM(fullPath, content) {
  const ext = path.extname(fullPath);

  if (ext === '.mjs') {
    return true;
  }

  if (ext === '.cjs') {
    return false;
  }

  // Remove comments from the content
  const contentNoComments = removeComments(content);

  // Check for ESM (import/export) syntax after removing comments
  if (hasEsmExportOrImport(contentNoComments)) {
    return true;
  }

  // Check for CommonJS (require/module.exports) syntax after removing comments
  if (contentNoComments.includes('require(') || contentNoComments.includes('module.exports')) {
    return false;
  }

  // Fallback to CommonJS if no clear indicators are found
  return false;
}

async function renameFilesToCjs(files, git, messages) {
  for (const [filePath, content] of files.entries()) {
    const ext = path.extname(filePath);
    if (typeof content !== 'object' && !filePath.includes('gasket.config.js')) {
      const isESM = isFileESM(filePath, content);
      if (!isESM) {
        if (ext === '.js') {
          // Rename .js files to .cjs if they are not ESM
          const newPath = filePath.replace('.js', '.cjs');

          // Regex pattern to match only require statements for local files
          const regex = /(?<!\w)require\((['"])(\.{1,2}\/[^\1]+?)(?!\.\w+)(\1)\)/g;

          // Replace with .cjs extension
          const updatedContent = content.replace(regex, (match, quote, pth, endQuote) => {
            return `require(${quote}${pth}.cjs${endQuote})`;
          });

          try {
            await git.mv(filePath, newPath);
          } catch {
            messages.push(`Git error renaming renaming ${filePath} to ${newPath}`);
          }

          files.set(newPath, updatedContent);
          files.delete(filePath);
        }
      }
    }
  }
}

function updateEsmImports(files, cwd) {
  files.forEach((content, filePath) => {
    if (typeof content !== 'object' && !filePath.includes('gasket.config.js')) {
      const fullPath = path.join(cwd, filePath);
      const isESM = isFileESM(fullPath, content);
      if (isESM) {
        const importRegexLocal = /import\s+(?:[\w*{}\s,]+?\s+from\s+)?['"](\.\.\/[^'"]+)['"]/g;
        const importRegexWithDefaults =
          /import\s+(?!\*\s+as\s+NextDocument\b)([^'"]+)\s+from\s+(['"])(next\/document|next\/image)(\2)/g;

        // Update imports for known .default interop cases
        let updatedContent = content.replace(importRegexWithDefaults, (match, importName, quote, importPath) => {
          // Check if the import is for next/document or next/image
          if (importPath === 'next/document') {
            // For Document, add the default interop without changing the import path
            // eslint-disable-next-line max-len
            return `import ${importName}Default from '${importPath}';\nconst ${importName} = ${importName}Default.default || ${importName}Default`;
          } else if (importPath === 'next/image') {
            // For Image, add .js as an extension and add the default interop
            const newImportPath = `${importPath}.js`;
            // eslint-disable-next-line max-len
            return `import ${importName}Default from '${newImportPath}';\nconst ${importName} = ${importName}Default.default || ${importName}Default;`;
          }
        });

        // Update imports for local files
        updatedContent = updatedContent.replace(importRegexLocal, (match, importPath) => {
          const fullPth = path.resolve(path.dirname(filePath), importPath);
          // Check for possible extensions
          const extensions = ['.js', '.jsx', '.cjs'];
          for (const ext of extensions) {
            // eslint-disable-next-line no-sync
            if (fs.existsSync(`${fullPth}${ext}`)) {
              return match.replace(importPath, `${importPath}${ext}`);
            }
          }

          // If no valid extension found, return the original import statement
          return match;
        });
        files.set(filePath, updatedContent);
      }
    }
  });
}

/**
 * Finds and udpates for esm
 *
 * @param {Map} files - Collection of filePaths to content
 */
async function fixupEsm({ files, git, cwd, messages }) {
  await renameFilesToCjs(files, git, messages);
  updateEsmImports(files, cwd);
}

module.exports = withPatchSpinner('Update to esm', fixupEsm);
