import parseDisposition from '../lib/parse-disposition.js';

describe('parseDisposition', function () {
  it('creates object with attachment and filename', async function () {
    const expected = {
      filename: '_.gasket.dev-godaddy.com_intermediate_chain.crt'
    };

    const result = parseDisposition('attachment;filename=_.gasket.dev-godaddy.com_intermediate_chain.crt');

    expect(result.attachment).toEqual(expected.attachment);
    expect(result.filename).toEqual(expected.filename);
  });

  it('handles quoted filenames', async function () {
    const expected = {
      filename: '_.gasket.dev-godaddy.com_intermediate_chain.crt'
    };

    const result = parseDisposition('attachment; filename="_.gasket.dev-godaddy.com_intermediate_chain.crt"');

    expect(result.attachment).toEqual(expected.attachment);
    expect(result.filename).toEqual(expected.filename);
  });

  it('creates object with missing filename', async function () {
    const expected = {
      filename: 'missing'
    };

    const result = parseDisposition('');

    expect(result.filename).toEqual(expected.filename);
  });
});
