import { describe, it, expect } from 'vitest';
import intlLocale from '../lib/intl-locale.js';

describe('Intl Locale Hook', () => {
  const mockGasket = { };
  const defaultLocale = 'en-Default';

  it('returns the market query param from req', async () => {
    const locale = await intlLocale.handler(mockGasket, defaultLocale, { req: { query: { market: 'ja-JP' } } });
    expect(locale).toEqual('ja-JP');
  });

  it('returns the default locale when no market query', async () => {
    const locale = await intlLocale.handler(mockGasket, defaultLocale, { req: { } });
    expect(locale).toEqual(defaultLocale);
  });

  it('returns en-US when no default locale and no market query', async () => {
    const locale = await intlLocale.handler(mockGasket, void 0, { req: {} });
    expect(locale).toEqual('en-US');
  });
});
