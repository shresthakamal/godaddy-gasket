/* -- GENERATED FILE - DO NOT EDIT -- */
import { makeIntlManager } from '@gasket/intl';

const manifest = {
  defaultLocaleFilePath: 'locales',
  staticLocaleFilePaths: [
    'locales'
  ],
  defaultLocale: 'en-US',
  locales: [
    'en-US',
    'fr-FR'
  ],
  localesMap: {},
  imports: {
    'locales/fr-FR': () => import('./locales/fr-FR.json', { with: { type: 'json' } }),
    'locales/en-US': () => import('./locales/en-US.json', { with: { type: 'json' } })
  }
};

export default makeIntlManager(manifest);
