import contentDisposition from 'content-disposition';

/**
 * Parse a Content-Disposition header value into an object
 * @type {import('.').parseDisposition}
 */
function parseDisposition(str) {
  if (!str) {
    return { filename: 'missing' };
  }

  const { parameters } = contentDisposition.parse(str);
  const { filename } = parameters;
  return { filename };
}

export default parseDisposition;
