// https://nextjs.org/docs/basic-features/image-optimization#using-the-image-component
const withPatchSpinner = require('../with-patch-spinner');

const reImageImport = /import\s+(\w+).+(?:jpe?g|png|gif|webp)'(?:.+)?/g;
const reImgTag = /<img[^>]+src={\s+(\w+)\s+}(?:[^>])+>/g;

const label = `Update imported images`;

function transform(filePath, content, modified) {
  const importedVars = [];

  content.replace(reImageImport, function replaceImport(match, variable) {
    importedVars.push(variable);
    return match;
  });

  let useNextImage = false;

  let fixed = content.replace(reImgTag, function replaceImg(match) {
    // only update the image tag if the src= references an imported var
    if (importedVars.some(v => match.includes(v))) {
      useNextImage = true;
      return match.replace('<img', '<Image');
    }
    return match;
  });

  // if we did update an img tag, be sure to include Image with other imports
  if (useNextImage) {
    modified.push(filePath);
    fixed = fixed.replace('import', `import Image from 'next/image';\nimport`);
  }

  return fixed;
}

async function updateImages(context, spinner) {
  const { files, messages, nextSteps } = context;

  const modified = [];
  files.forEach((content, filePath) => {
    if (typeof content !== 'object') {
      if (reImageImport.test(content)) {
        files.set(filePath, transform(filePath, content, modified));
      }
    }
  });

  if (modified.length) {
    messages.push(...modified.map(f => `${f} - updated to use \`next/image\``));
    nextSteps.push(`Legacy image imports were detected and modified to use next/image.
    Be sure to check the results in your app and adjust accordingly.
    For reference, see: https://nextjs.org/docs/api-reference/next/image`);
  } else {
    spinner.info(`${label} (avoided)`);
  }
}


module.exports = withPatchSpinner(label, updateImages);
