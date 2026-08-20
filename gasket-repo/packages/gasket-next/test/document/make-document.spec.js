import { vi } from 'vitest';
import { createElement } from 'react';
import { render } from '@testing-library/react';

// eslint-disable-next-line no-console
const actualConsoleError = console.error;
vi.spyOn(console, 'error').mockImplementation((msg) => {
  // suppress noisy warnings from test content
  if (/(is unrecognized in this browser|validateDOMNesting)/.test(msg)) {
    return;
  }
  actualConsoleError(msg);
});

const Html = vi.fn().mockImplementation(props => createElement('html', { ...props }));
const Main = vi.fn().mockImplementation(props => createElement('main', { ...props }));
const Head = vi.fn().mockImplementation(props => createElement('head', { ...props }));
const NextScript = vi.fn().mockImplementation(
  props => createElement('fake-script', { 'data-testid': 'next-script', ...props })
);

const nextDocument = {
  Html,
  Main,
  Head,
  NextScript
};

vi.mock('next/document', () => ({
  Html,
  Main,
  Head,
  NextScript
}));

const { Presentation: DefaultPresentation } = await import('../../src/server/presentation.js');
const renderDocumentSpy = vi.spyOn(DefaultPresentation.prototype, 'renderDocument');

const { makeDocument } = await import('../../src/document/make-document.js');
const getPropsSpy = vi.spyOn(DefaultPresentation, 'getProps').mockResolvedValue({ test: 'test' });

describe('makeDocument', () => {
  let mockGasket, mockGasketData;

  beforeEach(() => {
    mockGasketData = { config: {} };

    mockGasket = {
      actions: {
        getGasketData: vi.fn().mockResolvedValue(mockGasketData)
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return Functional Component with getInitialProps', () => {
    const Document = makeDocument(mockGasket, nextDocument);
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
        locale: 'en-US'
      };
    });

    it('calls Presentation getProps', () => {
      const Document = makeDocument(mockGasket, nextDocument);
      Document.getInitialProps(ctx);

      expect(getPropsSpy).toHaveBeenCalledWith(mockGasket, expect.any(Object));
    });

    it('retains req.query if set', () => {
      const mockReq = { mockReq: 'mockReq', query: { from: 'mockReq' } };
      ctx.req = mockReq;
      ctx.query = { from: 'ctx' };
      const Document = makeDocument(mockGasket, nextDocument);
      Document.getInitialProps(ctx);

      // same instance?
      expect(getPropsSpy).toHaveBeenCalledWith(mockGasket, mockReq);

      // query from mockReq?
      expect(getPropsSpy).toHaveBeenCalledWith(mockGasket, {
        mockReq: 'mockReq',
        query: {
          from: 'mockReq'
        }
      });
    });
  });

  it('renders default Presentation', () => {
    const Document = makeDocument(mockGasket, nextDocument);
    const visitor = { market: 'en-US' };
    const pcContent = {
      data: {
        assets: {
          js: '<script data-testid="pc.assets.js" />'
        }
      }
    };
    const wrapper = render(createElement(Document, { test: 'test', visitor, pcContent }));

    expect(renderDocumentSpy).toHaveBeenCalledWith(Html, Head, Main, NextScript);
    // React 19 does not render <html>/<head>/<body> inside a div; only body content appears
    expect(wrapper.container.innerHTML).toContain('<main');
  });

  it('renders custom Presentation', () => {
    class CustomPresentation extends DefaultPresentation {
      renderDocument() {
        return createElement('fake-tag', { 'data-testid': 'custom-content' });
      }
    }

    const renderMockDocumentSpy = vi.spyOn(CustomPresentation.prototype, 'renderDocument');

    const Document = makeDocument(mockGasket, nextDocument, CustomPresentation);
    const visitor = { market: 'en-US' };
    const pcContent = { data: 'test' };
    const { container, getByTestId } = render(createElement(Document, { test: 'test', visitor, pcContent }));


    expect(renderMockDocumentSpy).toHaveBeenCalledWith(Html, Head, Main, NextScript);
    expect(getByTestId('custom-content')).toBeTruthy();
    expect(container.innerHTML).toContain('</fake-tag>');
  });
});
