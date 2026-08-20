import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import intlLocaleHook from '../lib/intl-locale.js';

describe('intlLocaleHook', function () {

  describe('with locales defined', function () {
    let mockGasket, req;

    beforeEach(function () {
      mockGasket = {
        actions: {
          getVisitor: vi.fn().mockResolvedValue({ locale: 'fr-FR' })
        },
        config: {
          intl: {
            locales: ['en-US', 'fr-FR'],
            defaultLocale: 'en-US'
          }
        }
      };

      req = {};
    });

    afterEach(function () {
      vi.clearAllMocks();
    });

    it('uses locale if in supported locales', async function () {
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('fr-FR');
    });

    it('uses default if locale NOT in supported locales', async function () {
      mockGasket.actions.getVisitor.mockResolvedValue({ locale: 'de-DE' });
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('en-US');
    });

    it('resolves locale when supported', async () => {
      mockGasket.actions.getVisitor.mockResolvedValue({ locale: 'fr-FR' });
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('fr-FR');
    });

    it('resolves default with unsupported locale', async () => {
      mockGasket.actions.getVisitor.mockResolvedValue({ locale: 'en-CA' });
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('en-US');
    });

    it('resolves default with unsupported lang', async () => {
      mockGasket.actions.getVisitor.mockResolvedValue({ locale: 'en' });
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('en-US');
    });

    it('resolves lang when supported', async () => {
      mockGasket.config.intl.locales = ['en', 'fr'];
      mockGasket.actions.getVisitor.mockResolvedValue({ locale: 'fr-CA' });
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('fr');
    });

    it('resolves mapped locales', async () => {
      mockGasket.config.intl.localesMap = {
        'fr-CA': 'fr-FR'
      };
      mockGasket.actions.getVisitor.mockResolvedValue({ locale: 'fr-CA' });
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('fr-FR');
    });

    it('resolves mapped lang', async () => {
      mockGasket.config.intl.localesMap = {
        fr: 'fr-FR'
      };
      mockGasket.actions.getVisitor.mockResolvedValue({ locale: 'fr-CA' });
      const results = await intlLocaleHook(mockGasket, 'any', { req });
      expect(results).toEqual('fr-FR');
    });
  });
});
