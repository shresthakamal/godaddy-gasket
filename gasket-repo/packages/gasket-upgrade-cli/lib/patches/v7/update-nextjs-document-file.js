const withPatchSpinner = require('../with-patch-spinner');

const inDocuImportReplacement = `
  import { makeDocument } from '@godaddy/gasket-next/document';
  import { withGasketData } from '@gasket/nextjs/document';
  import * as NextDocument from 'next/document';
  import gasket from '../gasket.mjs';
`.replace(/^\s+|\s+$/gm, '');

const osDocuExportReplacement = `
  import gasket from '../gasket.mjs';
  export default withGasketData(gasket)(Document.default || Document);
`.replace(/^\s+|\s+$/gm, '');

function fixup(contents) {
  // skip for repeat upgrade runs
  if (contents.includes(`import { withGasketData } from '@gasket/nextjs/document';`)) return contents;

  // Internal fixup
  if (contents.includes('@godaddy/gasket-next/document')) {
    contents = contents.replace(`import Document from '@godaddy/gasket-next/document';`,
      inDocuImportReplacement);
    contents = contents.replace(
      'export default Document;',
      'export default withGasketData(gasket)(makeDocument(gasket, NextDocument));'
    );
  } else if (contents.includes(`import Document from 'next/document'`)) {
    // OS fixup
    contents = contents.replace(
      `import { withGasketData } from '@gasket/nextjs';`,
      `import { withGasketData } from '@gasket/nextjs/document';`
    );
    contents = contents.replace('export default withGasketData()(Document);', osDocuExportReplacement);
  }

  return contents;
}

/**
 * Finds and fixes the _document file
 *
 * @param {Map} files - Collection of filePaths to content
 */
function fixupDocumentFile({ files }) {
  const content = files.get('pages/_document.js');
  if (content) {
    files.set('pages/_document.js', fixup(content));
  }
}

module.exports = withPatchSpinner('Update Nextjs _document file', fixupDocumentFile);
