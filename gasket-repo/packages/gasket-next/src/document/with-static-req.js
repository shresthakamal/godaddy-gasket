/**
 * Make a wrapper for withGasketData HOC to inject req with necessary params
 * for Presentation Central static pages.
 * @type {import('.').withStaticReq}
 */
export function withStaticReq() {
  /** @type {import('.').WrapperCreator} */
  function WrapperCreator(Document) {
    /** @type {import('.').WrappedDocument} */
    function WrappedDocument(props) {
      return new Document(props);
    }

    /** @type {import('.').withStaticReqGetInitialProps} */
    async function getInitialProps(ctx) {
      const { req, locale } = ctx;
      try {
        if (!req.query && ctx.query) {
          req.query = ctx.query;
        }
        if (locale) {
          req.query.market = locale;
          req.query.locale = locale;
        }
      } catch {
        // TODO: assemble a mock req object for static page renders
        throw new Error('Missing required path params for static page render.');
      }

      return await Document.getInitialProps(ctx);
    }

    WrappedDocument.getInitialProps = getInitialProps;

    return WrappedDocument;
  }

  return WrapperCreator;
}
