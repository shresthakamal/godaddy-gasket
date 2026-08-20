import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { createElement, Fragment } from 'react';

// eslint-disable-next-line no-console
const actualConsoleError = console.error;
vi.spyOn(console, 'error').mockImplementation((msg) => {
  // suppress noisy warnings from test content
  if (/(is unrecognized in this browser|validateDOMNesting)/.test(msg)) {
    return;
  }
  actualConsoleError(msg);
});

// Mock html-react-parser
const { mockParser } = vi.hoisted(() => ({
  mockParser: vi.fn()
}));

vi.mock('html-react-parser', () => ({
  default: mockParser
}));

const normalizeManifest = vi.fn();
const Html = vi.fn()
  .mockImplementation(props => createElement('html', { 'data-testid': 'mock-html', ...props }));
const Main = vi.fn()
  .mockImplementation(props => createElement('main', { 'data-testid': 'mock-main', ...props }));
const Head = vi.fn()
  .mockImplementation(props => createElement('head', { 'data-testid': 'mock-head', ...props }));
const NextScript = vi.fn()
  .mockImplementation(props => createElement('fake-script', { 'data-testid': 'next-script', ...props }));


vi.mock('../../src/server/fixup-manifest.js', () => ({
  normalizeManifest
}));

const { Presentation } = await import('../../src/server/presentation.js');

describe('Presentation class', () => {
  let props;

  beforeEach(async () => {
    props = {
      pcContent: {
        data: {
          assets: {
            js: '<script data-testid="pc.assets.js" />',
            css: '<link data-testid="pc.assets.css" />',
            prefetch: '<link data-testid="pc.assets.prefetch" />',
            preload: '<link data-testid="pc.assets.preload" />'
          },
          header: '<div data-testid="pc.header" />',
          footer: '<div data-testid="pc.footer" />',
          globals: '<script data-testid="pc.globals" />',
          loaders: '<script data-testid="pc.loaders" />'
        }
      },
      visitor: {
        market: 'en-US'
      }
    };

    // Get the actual parser and setup mock to call it
    const realParser = await vi.importActual('html-react-parser');
    mockParser.mockImplementation((html, options) => {
      return realParser.default(html, options);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('htmlToReact', () => {
    let presentation;

    beforeEach(() => {
      presentation = new Presentation(props);
    });

    it('returns null for falsy HTML input', () => {
      expect(presentation.htmlToReact(null)).toBeNull();
      expect(presentation.htmlToReact()).toBeNull();
      expect(presentation.htmlToReact('')).toBeNull();
    });

    it('converts HTML string to React elements', () => {
      const html = '<div data-testid="test-element">Test Content</div>';
      const elements = presentation.htmlToReact(html);
      const { getByTestId } = render(elements);

      expect(getByTestId('test-element')).toBeTruthy();
      expect(getByTestId('test-element')).toHaveTextContent('Test Content');
    });

    it('handles multiple HTML elements', () => {
      const html = '<div data-testid="first">First</div><span data-testid="second">Second</span>';
      const elements = presentation.htmlToReact(html);
      const { getByTestId } = render(createElement('div', {}, elements));

      expect(getByTestId('first')).toBeTruthy();
      expect(getByTestId('second')).toBeTruthy();
    });

    it('applies trim option when specified', () => {
      const html = '<div data-testid="test-element">Test Content</div>';
      presentation.htmlToReact(html, { trim: false });
      expect(mockParser).toHaveBeenCalledWith(html, { trim: false });

      presentation.htmlToReact(html, { trim: true });
      expect(mockParser).toHaveBeenCalledWith(html, { trim: true });
    });

    it('uses default options when none provided', () => {
      const html = '<p data-testid="default">Default options</p>';
      const elements = presentation.htmlToReact(html);

      // Verify parser was called with default trim: false
      expect(mockParser).toHaveBeenCalledWith(html, { trim: false });

      const { getByTestId } = render(elements);

      expect(getByTestId('default')).toBeTruthy();
    });
  });

  describe('renderHead', () => {
    it('renders the head elements', () => {
      const presentation = new Presentation(props);
      const elements = presentation.renderHead();
      const { getByTestId } = render(elements);

      expect(getByTestId('traceid-init')).toBeTruthy();
      expect(getByTestId('pc.assets.prefetch')).toBeTruthy();
      expect(getByTestId('pc.assets.preload')).toBeTruthy();
      expect(getByTestId('pc.assets.css')).toBeTruthy();
    });

    it('filters out whitespace text nodes', () => {
      // Mock a renderer that returns whitespace
      props.pcContent.data.assets.css = '<link data-testid="css1" />   <link data-testid="css2" />';
      const presentation = new Presentation(props);
      const elements = presentation.renderHead();

      // Ensure we get a valid Fragment element
      expect(elements).toBeTruthy();
      expect(elements.type).toBe(Fragment);

      const { getByTestId } = render(elements);
      expect(getByTestId('css1')).toBeTruthy();
      expect(getByTestId('css2')).toBeTruthy();
    });

    it('flattens nested arrays from htmlToReact results', () => {
      // Mock a renderer that could return nested arrays
      props.pcContent.data.assets.css = '<link data-testid="link1" /><link data-testid="link2" />';
      const presentation = new Presentation(props);

      const elements = presentation.renderHead();
      const { getByTestId } = render(elements);

      expect(getByTestId('link1')).toBeTruthy();
      expect(getByTestId('link2')).toBeTruthy();
    });

    it('only re-keys React elements when duplicates are found', () => {
      // Note: html-react-parser doesn't preserve key attributes from HTML as React keys
      // React elements from parser have auto-generated keys like '0', '1', etc.
      props.pcContent.data.assets.css = '<link data-testid="link1" /><link data-testid="link2" />';
      props.pcContent.data.assets.preload = '<link data-testid="preload1" />';

      const presentation = new Presentation(props);
      const elements = presentation.renderHead();

      // Check that children have unique keys
      expect(elements).toBeTruthy();
      expect(elements.type).toBe(Fragment);
      expect(elements.props.children).toBeTruthy();

      const children = elements.props.children;
      const keys = children.filter(c => c?.key).map(c => c.key);

      // All keys should be unique
      expect(keys.length).toEqual(new Set(keys).size);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('handles duplicate keys from parsed elements', () => {
      // When parser generates duplicate keys (e.g., multiple '0' keys from different render methods)
      // Mock multiple render methods returning elements with the same key
      const presentation = new Presentation(props);

      vi.spyOn(presentation, 'renderHintsPreconnect').mockReturnValue(
        createElement('link', { 'key': '0', 'data-testid': 'hint1' })
      );
      vi.spyOn(presentation, 'renderHintsDnsPrefetch').mockReturnValue(
        createElement('link', { 'key': '0', 'data-testid': 'hint2' })
      );
      vi.spyOn(presentation, 'renderUxpCssContent').mockReturnValue(
        createElement('link', { 'key': '0', 'data-testid': 'css' })
      );

      const elements = presentation.renderHead();

      const children = elements.props.children;
      const keys = children.filter(c => c?.key).map(c => c.key);

      // All keys should be unique despite starting with duplicates
      expect(keys.length).toEqual(new Set(keys).size);
      // First '0' keeps original, others get suffixed
      expect(keys).toContain('0');
      expect(keys.some(k => k === '0-1')).toBe(true);
      expect(keys.some(k => k === '0-2')).toBe(true);
    });

    it('generates keys for elements without keys', () => {
      // Elements without keys
      props.pcContent.data.assets.css = '<link data-testid="link1" /><link data-testid="link2" />';

      const presentation = new Presentation(props);
      const elements = presentation.renderHead();

      const children = elements.props.children;
      const keys = children.filter(c => c?.key).map(c => c.key);

      // All keys should be unique
      expect(keys.length).toEqual(new Set(keys).size);
      // Should use head-element prefix for missing keys
      expect(keys.some(k => k.startsWith('head-element'))).toBe(true);
    });
  });

  describe('renderBodyHeader', () => {
    it('renders the above page elements', () => {
      const presentation = new Presentation(props);
      const elements = presentation.renderBodyHeader();
      const { getByTestId } = render(elements);

      expect(getByTestId('pc.header')).toBeTruthy();
    });

    it('flattens nested arrays from htmlToReact results', () => {
      props.pcContent.data.header = '<div data-testid="header1"></div><div data-testid="header2"></div>';
      const presentation = new Presentation(props);

      const elements = presentation.renderBodyHeader();
      const { getByTestId } = render(elements);

      expect(getByTestId('header1')).toBeTruthy();
      expect(getByTestId('header2')).toBeTruthy();
    });

    it('filters whitespace text nodes', () => {
      // Include whitespace between elements
      props.pcContent.data.header = '<div data-testid="header1"></div>   \n   <div data-testid="header2"></div>';
      const presentation = new Presentation(props);

      const elements = presentation.renderBodyHeader();
      const { getByTestId } = render(elements);

      // Elements should be present without whitespace issues
      expect(getByTestId('header1')).toBeTruthy();
      expect(getByTestId('header2')).toBeTruthy();
    });

    it('ensures unique keys for parsed elements', () => {
      props.pcContent.data.header = '<div data-testid="header1"></div><div data-testid="header2"></div>';
      const presentation = new Presentation(props);

      const elements = presentation.renderBodyHeader();

      expect(elements).toBeTruthy();
      expect(elements.type).toBe(Fragment);
      expect(elements.props.children).toBeTruthy();

      const children = elements.props.children;
      const keys = children.filter(c => c?.key).map(c => c.key);

      // All keys should be unique
      expect(keys.length).toEqual(new Set(keys).size);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('generates keys for elements without keys', () => {
      // Mock renderHeaderContent to return elements without keys
      const presentation = new Presentation(props);
      vi.spyOn(presentation, 'renderHeaderContent').mockReturnValue([
        createElement('div', { 'data-testid': 'header1' }),
        createElement('div', { 'data-testid': 'header2' })
      ]);

      const elements = presentation.renderBodyHeader();
      const children = elements.props.children;
      const keys = children.filter(c => c?.key).map(c => c.key);

      // All keys should be unique
      expect(keys.length).toEqual(new Set(keys).size);
      // Should use body-header-element prefix for missing keys
      expect(keys.some(k => k.startsWith('body-header-element'))).toBe(true);
    });
  });

  describe('renderBodyFooter', () => {
    it('renders the below page elements', () => {
      const presentation = new Presentation(props);
      const elements = presentation.renderBodyFooter();
      const { getByTestId } = render(elements);

      expect(getByTestId('pc.footer')).toBeTruthy();
      expect(getByTestId('pc.globals')).toBeTruthy();
      expect(getByTestId('pc.loaders')).toBeTruthy();
    });

    it('flattens nested arrays from htmlToReact results', () => {
      props.pcContent.data.footer = '<div data-testid="footer1"></div><div data-testid="footer2"></div>';
      props.pcContent.data.globals = '<script data-testid="global1"></script><script data-testid="global2"></script>';

      const presentation = new Presentation(props);
      const elements = presentation.renderBodyFooter();
      const { getByTestId } = render(elements);

      expect(getByTestId('footer1')).toBeTruthy();
      expect(getByTestId('footer2')).toBeTruthy();
      expect(getByTestId('global1')).toBeTruthy();
      expect(getByTestId('global2')).toBeTruthy();
    });

    it('filters whitespace text nodes', () => {
      // Include whitespace between elements
      props.pcContent.data.footer = '<div data-testid="footer1"></div>   \n   <div data-testid="footer2"></div>';
      props.pcContent.data.globals = '<script data-testid="global1"></script>   \n   <script data-testid="global2"></script>';
      const presentation = new Presentation(props);

      const elements = presentation.renderBodyFooter();
      const { getByTestId } = render(elements);

      // Elements should be present without whitespace issues
      expect(getByTestId('footer1')).toBeTruthy();
      expect(getByTestId('footer2')).toBeTruthy();
      expect(getByTestId('global1')).toBeTruthy();
      expect(getByTestId('global2')).toBeTruthy();
    });

    it('ensures unique keys for parsed elements', () => {
      props.pcContent.data.footer = '<div data-testid="footer1"></div><div data-testid="footer2"></div>';
      const presentation = new Presentation(props);

      const elements = presentation.renderBodyFooter();

      expect(elements).toBeTruthy();
      expect(elements.type).toBe(Fragment);
      expect(elements.props.children).toBeTruthy();

      const children = elements.props.children;
      const keys = children.filter(c => c?.key).map(c => c.key);

      // All keys should be unique
      expect(keys.length).toEqual(new Set(keys).size);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('generates keys for elements without keys', () => {
      props.pcContent.data.footer = '<div data-testid="footer1"></div><div data-testid="footer2"></div>';
      const presentation = new Presentation(props);

      const elements = presentation.renderBodyFooter();
      const children = elements.props.children;
      const keys = children.filter(c => c?.key).map(c => c.key);

      // All keys should be unique
      expect(keys.length).toEqual(new Set(keys).size);
      // Should use body-footer-element prefix for missing keys
      expect(keys.some(k => k.startsWith('body-footer-element'))).toBe(true);
    });
  });

  describe('renderDocument', () => {
    it('renders the expected elements', () => {
      const presentation = new Presentation(props);
      const elements = presentation.renderDocument(
        Html,
        Head,
        Main,
        NextScript
      );

      const { getByTestId } = render(elements);

      // React 19 does not render <html>/<head> inside a div; only body content is in the container
      expect(getByTestId('mock-main')).toBeTruthy();
      expect(getByTestId('next-script')).toBeTruthy();
      expect(getByTestId('pc.header')).toBeTruthy();
      expect(getByTestId('pc.footer')).toBeTruthy();
    });

  });
  describe('renderLayout', () => {
    it('renders the expected elements', () => {
      const presentation = new Presentation(props);
      const children =
        createElement('p', { 'data-testid': 'page-content' }, 'Page Content');
      const elements = presentation.renderLayout({ children });

      const { getByTestId } = render(elements);

      expect(getByTestId('page-content')).toBeTruthy();
      expect(getByTestId('pc.header')).toBeTruthy();
      expect(getByTestId('pc.footer')).toBeTruthy();
    });
  });

  describe('renderMetaTraceId', () => {
    it('renders traceId meta tag if set', () => {
      props.traceId = '1234';
      const presentation = new Presentation(props);
      const element = presentation.renderMetaTraceId();
      // React 19 does not render <meta> inside a div; assert element shape instead of DOM
      expect(element.type).toEqual('meta');
      expect(element.props['data-testid']).toEqual('trace');
      expect(element.props.name).toEqual('gd:traceId');
      expect(element.props.content).toEqual('1234');
    });

    it('renders init script for trace cookie if no props.traceId', () => {
      delete props.traceId;
      const presentation = new Presentation(props);
      const elements = presentation.renderMetaTraceId();
      const { container } = render(elements);

      const element = container.querySelector('[data-testid="traceid-init"]');
      expect(element).toBeTruthy();
      expect(element.tagName).toEqual('SCRIPT');
      expect(element.textContent).toEqual(expect.stringContaining('trace-cookie'));
    });
  });

  describe('htmlProps', () => {
    it('extracts language from visitor market and sets LTR direction', () => {
      props.visitor.market = 'en-US';
      const presentation = new Presentation(props);
      const result = presentation.htmlProps();

      expect(result).toEqual({
        lang: 'en',
        dir: 'ltr'
      });
    });

    it('sets RTL direction for RTL languages', () => {
      props.visitor.market = 'ar-AE';
      const presentation = new Presentation(props);
      const result = presentation.htmlProps();

      expect(result).toEqual({
        lang: 'ar',
        dir: 'rtl'
      });
    });

    it('respects disableRTL flag and forces LTR', () => {
      props.visitor.market = 'ar-AE';
      props.pcContent.disableRTL = true;
      const presentation = new Presentation(props);
      const result = presentation.htmlProps();

      expect(result).toEqual({
        lang: 'ar',
        dir: 'ltr'
      });
    });

    it('merges custom htmlProps', () => {
      props.visitor.market = 'en-US';
      props.htmlProps = {
        'id': 'custom-html',
        'data-theme': 'dark',
        'dir': 'custom-dir' // should override
      };
      const presentation = new Presentation(props);
      const result = presentation.htmlProps();

      expect(result).toEqual({
        'lang': 'en',
        'dir': 'custom-dir', // overrides market-based dir
        'id': 'custom-html',
        'data-theme': 'dark'
      });
    });

    it('handles different market formats', () => {
      props.visitor.market = 'zh';
      const presentation = new Presentation(props);
      const result = presentation.htmlProps();

      expect(result).toEqual({
        lang: 'zh',
        dir: 'ltr'
      });
    });
  });

  describe('static getProps', () => {
    let mockGasket, mockReq;
    let mockVisitor, mockPcContent;
    beforeEach(() => {
      mockVisitor = { visitorId: 1234 };
      mockPcContent = {
        data: {},
        meta: {}
      };

      mockGasket = {
        actions: {
          getVisitor: vi.fn().mockResolvedValue(mockVisitor),
          getPresentationCentral: vi.fn().mockResolvedValue(mockPcContent)
        }
      };
      mockReq = {

      };
    });

    it('gets the visitor', async () => {
      const initialProps = await Presentation.getProps(mockGasket, mockReq);

      expect(mockGasket.actions.getVisitor).toHaveBeenCalledWith(mockReq);
      expect(initialProps).toEqual(expect.objectContaining({
        visitor: mockVisitor
      }));
    });

    it('gets the PresentationCentral content', async () => {
      const initialProps = await Presentation.getProps(mockGasket, mockReq);

      expect(mockGasket.actions.getPresentationCentral).toHaveBeenCalledWith(mockReq);
      expect(initialProps).toEqual(expect.objectContaining({
        pcContent: mockPcContent
      }));
    });

    it('normalized PC content if v3 url', async () => {
      await Presentation.getProps(mockGasket);
      expect(normalizeManifest).not.toHaveBeenCalled();

      mockPcContent.meta.url = 'hydra.api/v3/some-app';
      mockGasket.actions.getPresentationCentral.mockResolvedValue(mockPcContent);
      await Presentation.getProps(mockGasket);
      expect(normalizeManifest).toHaveBeenCalled();
    });

    it('gets the traceId if action available', async () => {
      // without action
      const results1 = await Presentation.getProps(mockGasket, mockReq);
      expect(mockGasket.actions.getVisitor).toHaveBeenCalledWith(mockReq);
      expect(results1.traceId).toBeUndefined();

      // with action
      mockGasket.actions.getTraceId = vi.fn().mockResolvedValue('1234');

      const results2 = await Presentation.getProps(mockGasket, mockReq);
      expect(mockGasket.actions.getVisitor).toHaveBeenCalledWith(mockReq);
      expect(results2.traceId).toEqual('1234');
    });
  });
});
