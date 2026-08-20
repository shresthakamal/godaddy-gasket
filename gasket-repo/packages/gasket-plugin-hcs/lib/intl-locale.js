/// <reference types="@gasket/plugin-intl"/>

/** @type {import('@gasket/core').HookHandler<'intlLocale'>} */
async function intlLocale(gasket, locale, { req }) {
  return req?.query?.market || locale || 'en-US';
}

export default {
  timing: {
    after: [
      '@godaddy/gasket-plugin-visitor'
    ]
  },
  handler: intlLocale
};
