const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-nextjs-document-file');
const patch = wrapper.wrapped;

const internal = `
import Document from '@godaddy/gasket-next/document';

export default Document;
`;

const snapshotInternal = `
import { makeDocument } from '@godaddy/gasket-next/document';
import { withGasketData } from '@gasket/nextjs/document';
import * as NextDocument from 'next/document';
import gasket from '../gasket.mjs';

export default withGasketData(gasket)(makeDocument(gasket, NextDocument));
`;

const os = `
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs';
export default withGasketData()(Document);
`;

const snapshotOs = `
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.mjs';
export default withGasketData(gasket)(Document.default || Document);
`;

const filePath = 'pages/_document.js';

describe('v7 patch - update nextjs _document', function () {
  let mockContext;

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('updates internal', async function () {
    mockContext = makeContext();
    mockContext.files.set(filePath, internal);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(snapshotInternal);
  });

  it('updates os', async function () {
    mockContext = makeContext();
    mockContext.files.set(filePath, os);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(snapshotOs);
  });
});
