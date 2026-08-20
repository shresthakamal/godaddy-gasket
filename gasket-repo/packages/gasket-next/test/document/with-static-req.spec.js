import { vi } from 'vitest';
import NextDocument from 'next/document';

// Mock NextDocument to have getInitialProps method
vi.mock('next/document', () => ({
  default: {
    default: {
      getInitialProps: vi.fn().mockResolvedValue({
        html: '',
        head: [],
        styles: []
      })
    }
  }
}));

// eslint-disable-next-line no-console
const actualConsoleError = console.error;
vi.spyOn(console, 'error').mockImplementation((msg) => {
  // suppress noisy warnings from test content
  if (/(is unrecognized in this browser|validateDOMNesting)/.test(msg)) {
    return;
  }
  actualConsoleError(msg);
});

const { withStaticReq } = await import('../../src/document/with-static-req');

describe('withStaticReq', () => {
  it('should return Functional Component with getInitialProps', () => {
    const Document = withStaticReq()(NextDocument.default);
    expect(typeof Document).toEqual('function');
    expect(Document).toHaveProperty('getInitialProps');
  });

  describe('getInitialProps', () => {
    let ctx;

    beforeEach(() => {
      ctx = {
        req: {},
        res: {},
        defaultGetInitialProps: vi.fn(),
        locale: 'en-US',
        query: {
          plid: 1
        }
      };
    });

    it('attaches query from ctx if missing on req', async () => {
      const mockReq = { mockReq: 'mockReq' };
      ctx.req = mockReq;
      ctx.query = { from: 'ctx' };
      const Document = withStaticReq()(NextDocument.default);
      await Document.getInitialProps(ctx);

      expect(ctx.query).toEqual(ctx.req.query);
    });

    it('mutates req as expected', async function () {
      const Document = withStaticReq()(NextDocument.default);
      await Document.getInitialProps(ctx);
      expect(ctx.req).toHaveProperty('query');
      expect(ctx.req.query).toHaveProperty('plid');
      expect(ctx.req.query).toHaveProperty('locale');
      expect(ctx.req.query).toHaveProperty('market');
      expect(ctx.req.query.plid).toEqual(ctx.query.plid);
      expect(ctx.req.query.locale).toEqual(ctx.locale);
      expect(ctx.req.query.market).toEqual(ctx.locale);
    });

    it('throws error if ctx.query is not defined', async function () {
      delete ctx.query;
      const Document = withStaticReq()(NextDocument.default);
      await expect(Document.getInitialProps(ctx)).rejects.toThrow('Missing required path params for static page render.');
    });

    it('does not set locale on req.query if not defined', async function () {
      delete ctx.locale;
      const Document = withStaticReq()(NextDocument.default);
      await Document.getInitialProps(ctx);
      expect(ctx.req).toHaveProperty('query');
      expect(ctx.req.query).toHaveProperty('plid');
      expect(ctx.req.query).not.toHaveProperty('locale');
      expect(ctx.req.query).not.toHaveProperty('market');
      expect(ctx.req.query.plid).toEqual(ctx.query.plid);
    });
  });
});
