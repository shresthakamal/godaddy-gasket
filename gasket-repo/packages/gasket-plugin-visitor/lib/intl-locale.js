/// <reference types="@gasket/intl" />
/// <reference types="@gasket/plugin-intl" />


/**
 * Resolve the locale to use for locale file loading
 * TODO: This logic is borrowed from the intl-manager.js file in the gasket-intl package.
 * @param {import('@gasket/plugin-intl').IntlConfig} intlConfig - Intl configuration
 * @returns {(function(string): string)} resolve function
 */
function makeResolveLocale(intlConfig) {
  return function resolveLocale(locale) {
    const { defaultLocale, locales, localesMap = {} } = intlConfig ?? {};

    if (locale in localesMap) {
      return localesMap[locale];
    }

    if (locales.includes(locale)) {
      return locale;
    }

    // attempt fallback to language
    if (locale.indexOf('-') > 0) {
      return resolveLocale(locale.split('-')[0]);
    }

    return defaultLocale;
  };
}

/**
 * Choose the locale for the current user
 * @type {import('@gasket/core').HookHandler<'intlLocale'>}
 */
export default async function intlLocaleHook(gasket, _, { req }) {
  const { locale } = await gasket.actions.getVisitor(req);
  const resolveLocale = makeResolveLocale(gasket.config?.intl);
  return resolveLocale(locale);
}
