import { withGasketRequestCache } from '@gasket/request';
import { getContent } from './presentation.js';

/**
 * Default Object structure that is set as `pc` response incase of an unexpected
 * error. This ensures that code does not randomly fail on missing keys in
 * data structure.
 * @type {object}
 * @private
 */
const fallback = {
  assets: {
    css: '',
    js: ''
  },
  header: '',
  footer: '',
  globals: '',
  loaders: ''
};

const prepareContent = (pcContent, content) => {
  const { data, meta, error } = content;
  pcContent.data = {
    ...fallback,
    ...data
  };
  if (meta) pcContent.meta = meta;
  if (error) pcContent.error = error;
};

const prepareError = (pcContent, err) => {
  pcContent.data = { ...fallback };
  pcContent.error = err;
  if (err.meta) pcContent.meta = err.meta;
};

/** @type {import('@gasket/core').ActionHandler<'getPresentationCentral'>} */
const getPresentationCentral = withGasketRequestCache(
  async function getPresentationCentral(gasket, req) {
    const pcConfig = gasket.config?.presentationCentral ?? {};

    /** @type {import('.').PCContent} */
    const pcContent = {};
    if ('page' in pcConfig) pcContent.page = pcConfig.page;
    if ('disableRTL' in pcConfig) pcContent.disableRTL = pcConfig.disableRTL;

    try {
      let initialContent = await getContent(gasket, req);
      initialContent = await gasket.execWaterfall('headerContent', initialContent, { req });
      prepareContent(pcContent, initialContent);
    } catch (error) {
      prepareError(pcContent, error);
    }

    return pcContent;
  }
);

export {
  getPresentationCentral
};
