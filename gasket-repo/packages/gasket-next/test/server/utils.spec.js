/* eslint-disable max-len */
import { expect } from 'vitest';
import {
  getLangFromReq,
  buildElem,
  elemBuilder,
  ensureArray,
  arrayOrSingle,
  trimInline,
  safeStringify
} from '../../src/server/utils';

describe('utils', () => {
  describe('getLangFromReq', () => {
    it('gets the lang correctly', () => {
      const res = {
        locals: {
          visitor: {
            market: 'fr-FR'
          }
        }
      };
      const result = getLangFromReq(res);
      expect(result).toEqual('fr');
    });

    it('falls back to en if no res or visitor data', () => {
      const result = getLangFromReq();
      expect(result).toEqual('en');
    });
  });

  describe('elemBuilder', () => {
    let result;
    const link = [{
      href: '//img6.dev-wsimg.com/ux/fonts/gd-sage/1.0/gd-sage-bold.woff2',
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    },
    {
      href: '//img6.dev-wsimg.com/ux/fonts/sherpa/2.0/gdsherpa-vf.woff2',
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    }];

    const linkResult = `<link href="//img6.dev-wsimg.com/ux/fonts/gd-sage/1.0/gd-sage-bold.woff2" rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" /><link href="//img6.dev-wsimg.com/ux/fonts/sherpa/2.0/gdsherpa-vf.woff2" rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" />`;

    const js = {
      uxcore: [
        {
          src: 'https://img6.dev-wsimg.com/wrhs/uxcore2.js',
          defer: true,
          async: false
        },
        {
          src: 'https://img6.dev-wsimg.com/wrhs/vendor~uxcore2.js',
          defer: true,
          async: false
        }
      ],
      heartbeat: [
        {
          src: 'https://img6.dev-wsimg.com/wrhs/heartbeat.js',
          defer: false,
          async: true
        }
      ],
      polyfill: [
        {
          src: 'https://img1.wsimg.com/poly/v3/polyfill.js?features=Promise,Promise.prototype.finally,fetch,AbortController,Intl.~locale.en-US&rum=0&unknown=polyfill&flags=gated',
          defer: false,
          async: false
        }
      ],
      manifest: [
        {
          src: 'https://img6.dev-wsimg.com/wrhs/appheader.js',
          defer: true,
          async: false
        }
      ],
      tcc: [
        {
          src: 'https://img6.dev-wsimg.com/wrhs/tcc.js',
          defer: false,
          async: true
        }
      ],
      utag: [
        {
          src: 'https://tags.tiqcdn.com/utag/godaddy/godaddy/dev/utag.js',
          defer: false,
          async: true
        }
      ]
    };

    const jsResult = `<script src="https://img6.dev-wsimg.com/wrhs/uxcore2.js" defer></script><script src="https://img6.dev-wsimg.com/wrhs/vendor~uxcore2.js" defer></script><script src="https://img6.dev-wsimg.com/wrhs/heartbeat.js" async></script><script src="https://img1.wsimg.com/poly/v3/polyfill.js?features=Promise,Promise.prototype.finally,fetch,AbortController,Intl.~locale.en-US&amp;rum=0&amp;unknown=polyfill&amp;flags=gated"></script><script src="https://img6.dev-wsimg.com/wrhs/appheader.js" defer></script><script src="https://img6.dev-wsimg.com/wrhs/tcc.js" async></script><script src="https://tags.tiqcdn.com/utag/godaddy/godaddy/dev/utag.js" async></script>`;

    it('builds script html elements', () => {
      result = elemBuilder(js, 'script');
      expect(result).toEqual(jsResult);
    });

    it('builds link html elements', () => {
      result = elemBuilder(link, 'link');
      expect(result).toEqual(linkResult);
    });

    it('returns already built string html element', () => {
      result = elemBuilder('<style>SOME STYLES</style>', 'link');
      expect(result).toEqual('<style>SOME STYLES</style>');
    });
  });

  // eslint-disable-next-line max-statements
  describe('buildElem', () => {
    let result;

    const link = {
      href: '//img6.dev-wsimg.com/ux/fonts/gd-sage/1.0/gd-sage-bold.woff2',
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    };

    const script = {
      src: 'https://img6.dev-wsimg.com/wrhs/uxcore2.js',
      defer: true,
      async: false
    };

    const meta = {
      name: 'msapplication-TileColor',
      content: '#111111'
    };

    const htmlUnsafeLink = {
      href: '//img6.dev-wsimg.com/ux/fonts/gd-sage/1.0/gd-sage-bold.woff2',
      rel: 'preload',
      as: 'font',
      foo: '<some> "weird" value'
    };

    const htmlEncodedScript = {
      src: 'https://img6.dev-wsimg.com/wrhs/uxcore2.js',
      defer: true,
      foo: '&lt;some&gt; &quot;weird&quot; value'
    };

    const scriptElem = '<script src="https://img6.dev-wsimg.com/wrhs/uxcore2.js" defer></script>';

    const linkElem = '<link href="//img6.dev-wsimg.com/ux/fonts/gd-sage/1.0/gd-sage-bold.woff2" rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" />';

    const htmlLinkElem = '<link href="//img6.dev-wsimg.com/ux/fonts/gd-sage/1.0/gd-sage-bold.woff2" rel="preload" as="font" foo="&lt;some&gt; &quot;weird&quot; value" />';

    const htmlScriptElem = '<script src="https://img6.dev-wsimg.com/wrhs/uxcore2.js" defer foo="&lt;some&gt; &quot;weird&quot; value"></script>';

    it('builds script html element', () => {
      result = buildElem(script, 'script');
      expect(result).toEqual(scriptElem);
    });

    it('builds link html element', () => {
      result = buildElem(link, 'link');
      expect(result).toEqual(linkElem);
    });

    it('returns already built string html element', () => {
      result = buildElem('SOME STYLES', 'link');
      expect(result).toEqual('<style>SOME STYLES</style>');
    });

    it('builds meta html element', () => {
      result = buildElem(meta, 'meta');
      expect(result).toEqual('<meta name="msapplication-TileColor" content="#111111" />');
    });

    it('renders safe html entities', () => {
      result = buildElem(htmlUnsafeLink, 'link');
      expect(result).toEqual(htmlLinkElem);
    });

    it('retains encoded html entities', () => {
      result = buildElem(htmlEncodedScript, 'script');
      expect(result).toEqual(htmlScriptElem);
    });

  });

  describe('ensureArray', function () {
    it('returns unmodified array', function () {
      const arg = ['item'];
      expect(ensureArray(arg)).toBe(arg);
    });

    it('returns argument in array', function () {
      const arg = 'item';
      expect(ensureArray(arg)).toEqual([arg]);
    });
  });

  describe('arrayOrSingle', function () {
    it('returns unmodified array', function () {
      const arg = ['item1', 'item2'];
      expect(arrayOrSingle(arg)).toBe(arg);
    });

    it('returns single item', function () {
      const arg = ['item'];
      expect(arrayOrSingle(arg)).toBe('item');
    });
  });

  describe('trimInline', function () {
    it('trims new lines and leading whitepace', function () {
      const result = trimInline(`
      const somevar = 'value';
      const another = 'value2';
`);
      expect(result).toEqual("const somevar = 'value';const another = 'value2';");
    });

    it('trims comment lines', function () {
      const result = trimInline(`
      const somevar = 'value';
      // some comment line
      const another = 'value2'; // left alone
`);
      expect(result).toEqual("const somevar = 'value';const another = 'value2'; // left alone");
    });
  });

  describe('safeStringify', () => {
    it('should stringify a simple object correctly', () => {
      const obj = { key: 'value' };
      const result = safeStringify(obj);
      expect(result).toEqual('{"key":"value"}');
    });

    it('should escape script tags in the stringified object', () => {
      const obj = { key: '<script>alert("Hello")</script>' };
      const result = safeStringify(obj);
      expect(result).toEqual('{"key":"<script>alert(\\"Hello\\")<\\/script>"}');
    });

    it('should escape HTML comments in the stringified object', () => {
      const obj = { key: '<!-- This is a comment -->' };
      const result = safeStringify(obj);
      expect(result).toEqual('{"key":"<\\!-- This is a comment -->"}');
    });

    it('should handle nested objects correctly', () => {
      const obj = { key: { nestedKey: 'value' } };
      const result = safeStringify(obj);
      expect(result).toEqual('{"key":{"nestedKey":"value"}}');
    });

    it('should handle arrays correctly', () => {
      const obj = { key: ['value1', 'value2'] };
      const result = safeStringify(obj);
      expect(result).toEqual('{"key":["value1","value2"]}');
    });
  });
});
