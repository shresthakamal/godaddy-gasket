import { vi } from 'vitest';
import { createElement, Fragment } from 'react';
import { render } from '@testing-library/react';

// eslint-disable-next-line no-console
const actualConsoleError = console.error;
vi.spyOn(console, 'error').mockImplementation((msg) => {
  // suppress noisy warnings from test content
  if (/(is unrecognized in this browser|validateDOMNesting|list should have a unique)/.test(msg)) {
    return;
  }
  actualConsoleError(msg);
});

const request = vi.fn();
const makeGasketRequest = vi.fn();

vi.mock('@gasket/nextjs/request', () => ({
  request
}));

vi.mock('@gasket/request', () => ({
  makeGasketRequest
}));

const { Presentation: DefaultPresentation } = await import('../../src/server/presentation.js');
const renderLayoutSpy = vi.spyOn(DefaultPresentation.prototype, 'renderLayout');

const { makeLayout, makeDynamicLayout } = await import('../../src/layout/make-layout.js');
const getPropsSpy = vi.spyOn(DefaultPresentation, 'getProps');


describe('makeLayout', () => {
  let mockGasket, mockProps, mockReq, mockInitialProps;

  beforeEach(() => {
    mockGasket = {};

    mockProps = {
      children: createElement('div', { 'data-testid': 'page-content' }, 'Page Content'),
      params: {
        search: 'yes'
      }
    };

    mockReq = {};
    mockInitialProps = {
      test: 'test',
      visitor: {
        market: 'en-US'
      },
      pcContent: {
        data: {}
      }
    };

    request.mockReturnValue(mockReq);
    makeGasketRequest.mockReturnValue(mockReq);
    getPropsSpy.mockResolvedValue(mockInitialProps);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function testMakeLayout(name, makeLayoutFn) {
    it('should return Functional Component', () => {
      const Layout = makeLayoutFn(mockGasket);
      expect(typeof Layout).toEqual('function');
    });

    it('calls Presentation getProps', async () => {
      const Layout = makeLayoutFn(mockGasket);
      // eslint-disable-next-line new-cap
      await Layout(mockProps);

      expect(getPropsSpy).toHaveBeenCalledWith(mockGasket, expect.objectContaining(mockReq));
    });

    it('renders default Presentation', async () => {
      const Layout = makeLayoutFn(mockGasket);
      // eslint-disable-next-line new-cap
      const elements = await Layout(mockProps);
      expect(renderLayoutSpy).toHaveBeenCalledWith(mockProps);

      const { getByTestId } = render(elements);
      expect(getByTestId('page-content')).toBeTruthy();
    });

    it('renders custom Presentation', async () => {
      class CustomPresentation extends DefaultPresentation {
        renderLayout() {
          return createElement('fake-tag', { 'data-testid': 'custom-content' });
        }
      }

      const renderMockLayoutSpy = vi.spyOn(CustomPresentation.prototype, 'renderLayout');

      const Layout = makeLayoutFn(mockGasket, CustomPresentation);
      // eslint-disable-next-line new-cap
      const elements = await Layout(mockProps);
      expect(renderLayoutSpy).not.toHaveBeenCalled();
      expect(renderMockLayoutSpy).toHaveBeenCalledWith(mockProps);

      const { container, getByTestId } = render(elements);
      expect(getByTestId('custom-content')).toBeTruthy();
      expect(container.innerHTML).toContain('</fake-tag>');
    });

    it('Converts scripts to NextScript with excludes', async () => {
      class CustomPresentation extends DefaultPresentation {
        renderUxpScripts() {
          return createElement(Fragment, null,
            // expect kept
            createElement('script', { 'src': '//some.cdn/hash12345/header.js', 'data-testid': 'script-header' }),
            createElement('script', { 'src': '//some.cdn/hash12345/heartbeat.js', 'data-testid': 'script-heartbeat' }),
            createElement('script', { 'src': '//some.cdn/ux-assets/extra.js', 'data-testid': 'script-extra' }),
            // expect removed
            createElement('script', { 'src': '//some.cdn/hash12345/vendor.js', 'data-testid': 'script-vendor' }),
            createElement('script', { 'src': '//some.cdn/ux-assets/react.umd.js', 'data-testid': 'script-react' }),
            createElement('script', {
              'src': '//some.cdn/ux-assets/react-dom.umd.js',
              'data-testid': 'script-react-dom'
            }),
            createElement('script', {
              'src': '//some.cdn/hash12345/vendor.min.js',
              'data-testid': 'script-vendor-min'
            }),
            createElement('script', {
              'src': '//some.cdn/ux-assets/react.dev.umd.js',
              'data-testid': 'script-react-dev'
            }),
            createElement('script', {
              'src': '//some.cdn/ux-assets/react-dom.dev.umd.js',
              'data-testid': 'script-react-dom-dev'
            })
          );
        }
      }

      const Layout = makeLayoutFn(mockGasket, CustomPresentation);
      // eslint-disable-next-line new-cap
      const elements = await Layout(mockProps);

      const { getByTestId, getAllByTestId } = render(elements);
      expect(getByTestId('script-heartbeat')).toBeTruthy();

      const found = getAllByTestId(/script-/);
      expect(found).toHaveLength(3);

      expect(found[0]).toHaveAttribute('data-nscript', 'afterInteractive');
    });

    it('ignores preload scripts from manifest', async () => {
      const constructorSpy = vi.fn();

      class CustomPresentation extends DefaultPresentation {
        constructor(...args) {
          constructorSpy(...args);
          super(...args);
        }
      }

      mockInitialProps.pcContent.data.hints = {
        preload: {
          css: '<link href="/styles.css"/>',
          js: '<script src="preload.js" />'
        }
      };

      const expected = JSON.parse(JSON.stringify(mockInitialProps));
      delete expected.pcContent.data.hints.preload.js;

      const Layout = makeLayoutFn(mockGasket, CustomPresentation);
      // eslint-disable-next-line new-cap
      await Layout(mockProps);

      expect(constructorSpy).toHaveBeenCalledWith(expected);
    });
  }

  describe('makeLayout', () => {
    testMakeLayout('makeLayout', makeLayout);

    it('creates a GasketRequest with dynamic route params', async () => {
      const Layout = makeLayout(mockGasket);
      // eslint-disable-next-line new-cap
      await Layout(mockProps);

      expect(makeGasketRequest).toHaveBeenCalledWith({
        headers: {},
        query: mockProps.params
      });
    });
  });

  describe('makeDynamicLayout', () => {
    testMakeLayout('makeDynamicLayout', makeDynamicLayout);

    it('creates a request() with dynamic route params', async () => {
      const Layout = makeDynamicLayout(mockGasket);
      // eslint-disable-next-line new-cap
      await Layout(mockProps);

      expect(request).toHaveBeenCalledWith(mockProps.params);
    });
  });
});
