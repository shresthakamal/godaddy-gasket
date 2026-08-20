const withPatchSpinner = require('../with-patch-spinner');

const label = 'Update Enzyme adapter';

const oldAdapter = 'enzyme-adapter-react-16';
const newAdapter = '@wojtekmaj/enzyme-adapter-react-17';
const newAdapterVersion = '^0.6.6';

function fixup({ updateContent, files }, spinner) {
  let hasAdapter = false;
  updateContent('package.json', content => {
    if (content.devDependencies && oldAdapter in content.devDependencies) {
      hasAdapter = true;
      delete content.devDependencies[oldAdapter];
      content.devDependencies[newAdapter] = newAdapterVersion;
    }
    return content;
  });

  if (hasAdapter) {
    files.forEach((content, filePath) => {
      if (typeof content !== 'object') {
        if (content.includes(oldAdapter)) {
          files.set(filePath, content.replace(oldAdapter, newAdapter));
        }
      }
    });
  } else {
    spinner.info(`${label} (skipped)`);
  }
}

module.exports = withPatchSpinner(label, fixup);
