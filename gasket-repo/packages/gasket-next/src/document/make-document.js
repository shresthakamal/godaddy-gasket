import { Presentation as DefaultPresentation } from '../server/presentation.js';

/** @type {import('.').makeDocument} */
export function makeDocument(
  gasket,
  nextDocument,
  Presentation = DefaultPresentation
) {
  /** @type {import('.').PresentationDocument} */
  function PresentationDocument(props) {
    const presentation = new Presentation(props);
    const { Head, Html, Main, NextScript } = nextDocument;
    return presentation.renderDocument(Html, Head, Main, NextScript);
  }

  /** @type {import('.').GasketDocumentGetInitialProps} */
  async function getInitialProps(ctx) {
    const { req } = ctx;

    const presentationProps = await Presentation.getProps(gasket, req);
    const initialProps = await ctx.defaultGetInitialProps(ctx);

    return {
      ...initialProps,
      ...presentationProps
    };
  }

  PresentationDocument.getInitialProps = getInitialProps;

  return PresentationDocument;
}
