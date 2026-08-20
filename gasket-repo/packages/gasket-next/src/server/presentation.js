/// <reference types="@godaddy/gasket-plugin-visitor"/>
/// <reference types="@godaddy/gasket-plugin-uxp"/>
/// <reference types="@godaddy/gasket-plugin-otel"/>
/// <reference types="@godaddy/gasket-plugin-traffic"/>

import { createElement, Fragment, cloneElement, isValidElement } from 'react';
import parser from 'html-react-parser';
// @ts-ignore - no types
import { isRTL } from '@godaddy/atlas/is-rtl';
import { normalizeManifest } from './fixup-manifest.js';
import { arrayOrSingle, ensureArray, safeStringify, trimInline } from './utils.js';

/**
 * Helper to recursively filter whitespace text nodes from parsed HTML
 * @param {any} item - The item to filter
 * @returns {any} The filtered item
 */
function filterWhitespace(item) {
  if (!item) return null;
  // Filter out whitespace-only text nodes
  if (typeof item === 'string' && item.trim() === '') return null;
  // Recursively process arrays
  if (Array.isArray(item)) {
    return item.map(filterWhitespace).filter(Boolean);
  }
  return item;
}

/**
 * Ensures React elements have unique keys, only modifying when duplicates are found
 * @param {Array} children - Array of React elements and other children
 * @param {string} prefix - Prefix to use for generated keys
 * @returns {Array} Array with deduplicated keys
 */
function deduplicateKeys(children, prefix = 'element') {
  const seenKeys = new Set();

  return children.map(child => {
    if (isValidElement(child)) {
      const currentKey = child.key;

      // If no key or duplicate key found, generate a unique one
      if (!currentKey || seenKeys.has(currentKey)) {
        let newKey = currentKey || prefix;
        let suffix = 1;

        // Find a unique key by appending a suffix
        while (seenKeys.has(newKey)) {
          newKey = `${currentKey || prefix}-${suffix}`;
          suffix++;
        }

        seenKeys.add(newKey);
        return cloneElement(child, { key: newKey });
      }

      seenKeys.add(currentKey);
    }
    return child;
  });
}

/**
 * Prepares children array by filtering whitespace, flattening, removing nulls, and deduplicating keys
 * @param {Array} rawChildren - Raw array of children from render methods
 * @param {string} keyPrefix - Prefix to use for generated keys when duplicates are found
 * @returns {Array} Prepared array of children ready for rendering
 */
function prepareChildren(rawChildren, keyPrefix = 'element') {
  return deduplicateKeys(
    rawChildren
      .map(filterWhitespace)
      .flat(Infinity)  // Flatten nested arrays
      .filter(Boolean), // Remove nulls
    keyPrefix
  );
}

export class Presentation {
  /**
   * Constructor for Presentation
   * @param {import('.').PresentationProps} props - The properties for the
   * presentation
   */
  constructor(props) {
    this.props = props;
  }

  /** @type {import('@godaddy/gasket-plugin-uxp').PCContent} */
  get pcContent() {
    return this.props.pcContent;
  }

  /**
   * Converts HTML to React elements
   * @type {import('./internal').htmlToReact}
   */
  htmlToReact(html, options = {}) {
    if (!html) return null;
    const trim = options.trim ?? false;
    const parsed = ensureArray(parser(html, { trim }));
    return arrayOrSingle(parsed);
  }

  htmlProps() {
    const { visitor, pcContent } = this.props;
    const lang = visitor.market.split('-')[0];
    const dir = (isRTL(lang) && pcContent.disableRTL !== true) ? 'rtl' : 'ltr';

    const { htmlProps = {} } = this.props;
    return {
      lang,
      dir,
      ...htmlProps
    };
  }

  bodyProps() {
    const { bodyProps = {} } = this.props;
    const className = ['ux-app', 'gasket-app', bodyProps.className].filter(Boolean).join(' ');
    return {
      ...bodyProps,
      className
    };
  }

  renderHintsPreconnect() {
    return this.htmlToReact(this.pcContent.data.hints?.preconnect);
  }

  renderHintsDnsPrefetch() {
    return this.htmlToReact(this.pcContent.data.hints?.dnsprefetch);
  }

  renderHintsPreloadCss() {
    return this.htmlToReact(this.pcContent.data.hints?.preload?.css);
  }

  renderHintsPreloadFonts() {
    return this.htmlToReact(this.pcContent.data.hints?.preload?.fonts);
  }

  renderHintsPreloadJs() {
    return this.htmlToReact(this.pcContent.data.hints?.preload?.js);
  }

  renderPrefetchAssets() {
    const prefetch = this.pcContent.data.assets?.prefetch ?? this.pcContent.data.hints?.prefetch;
    return this.htmlToReact(prefetch);
  }

  renderDeferScripts() {
    return this.htmlToReact(this.pcContent.data.assets?.deferjs);
  }

  renderPreloadAssets() {
    return this.htmlToReact(this.pcContent.data.assets?.preload);
  }

  /** @returns {null} */
  renderPreUxpCssContent() {
    return null;
  }

  /** @returns {null} */
  renderPreCssContent() {
    return null;
  }

  renderUxpCssContent() {
    return this.htmlToReact(this.pcContent.data.assets?.css);
  }

  /** @returns {null} */
  renderCssContent() {
    return null;
  }

  /** @returns {null} */
  renderHeadContent() {
    return null;
  }

  /** @returns {null} */
  renderPreHeaderContent() {
    return null;
  }

  renderHeaderContent() {
    return this.htmlToReact(this.pcContent.data.header);
  }

  /** @returns {null} */
  renderPreAppContent() {
    return null;
  }

  /** @returns {null} */
  renderPreFooterContent() {
    return null;
  }

  renderFooterContent() {
    return this.htmlToReact(this.pcContent.data.footer);
  }

  /**
   * Renders the PC page content as a script tag
   * @type {import('./internal').renderPcPageContent}
   */
  renderPcPageContent() {
    const { page } = this.pcContent;

    let js = `
      window.ux = window.ux || {};
      window.ux.eldorado = window.ux.eldorado || {};`;
    if (page) {
      js += `
      window.ux.eldorado.page = ${safeStringify(page)};
      `;
    }

    js = trimInline(js);

    return createElement('script', { id: 'pcPage', dangerouslySetInnerHTML: { __html: js } });
  }

  renderTccInitScript() {
    const { tccData, signalsConfig } = this.props;

    let js = trimInline(`
      window._expDataLayer = window._expDataLayer || [];
      window._signalsDataLayer = window._signalsDataLayer || [];
      window._gaDataLayer = window._gaDataLayer || [];
    `);
    if (tccData) {
      js += `
        window._gaDataLayer.push(${JSON.stringify(tccData)});
      `;
    }

    // Only add set_config if there are meaningful properties to configure
    if (signalsConfig && Object.keys(signalsConfig).length > 0) {
      js += `
        window._signalsDataLayer.push({ schema: 'set_config', data: ${JSON.stringify(signalsConfig)} });
      `;
    }

    return createElement('script', { id: 'tcc-init', dangerouslySetInnerHTML: { __html: js } });
  }

  /** @returns {null} */
  renderPreUxpScriptsContent() {
    return null;
  }

  renderUxpScripts() {
    return this.htmlToReact(this.pcContent.data.assets?.js);
  }

  renderSWRegisterScript() {
    if (!this.props.swScript) {
      return null;
    }

    return this.htmlToReact(this.props.swScript);
  }

  /** @returns {null} */
  renderPreInitScriptsContent() {
    return null;
  }

  renderInitScripts() {
    return this.htmlToReact(this.pcContent.data.globals);
  }

  /** @returns {null} */
  renderPreUxpMountContent() {
    return null;
  }

  renderUxpMounts() {
    return this.htmlToReact(this.pcContent.data.loaders);
  }

  /** @returns {null} */
  renderPreAppScriptContent() {
    return null;
  }

  /**
   * Renders a meta tag for the trace ID
   * @type {import('./internal').renderMetaTraceId}
   */
  renderMetaTraceId() {
    const { traceId } = this.props;

    // if we have a traceid prop, render the meta tag
    if (traceId) {
      return createElement('meta', {
        'name': 'gd:traceId',
        'content': traceId,
        'data-testid': 'trace'
      });
    }

    // otherwise, attempt to render the meta tag from cookie in browser
    // language=JavaScript
    const js = trimInline(`
      // d arg is the document passed via iife when evaluated
      (function (d) {
        // find the traceid cookie value
        const id = (d.cookie.split(/; */g).find(o => o.startsWith('traceid=')) || '').split('=')[1];
        if (id) {
          const el = d.createElement('meta');
          el.setAttribute('name', 'gd:traceId');
          el.setAttribute('content', id);
          el.setAttribute('data-testid', 'trace-cookie');
          d.head.append(el);
          // expire the traceid cookie to avoid it getting passed around
          d.cookie = 'traceid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }(document));
    `);

    return createElement('script', {
      'data-testid': 'traceid-init',
      'dangerouslySetInnerHTML': { __html: js }
    });
  }

  renderHead() {
    const children = prepareChildren([
      this.renderHintsPreconnect(),       /* hints.preconnect.js */
      this.renderHintsDnsPrefetch(),      /* hints.dnsprefetch.js */
      this.renderHintsPreloadCss(),       /* hints.preload.css */
      this.renderHintsPreloadFonts(),     /* hints.preload.fonts */
      this.renderMetaTraceId(),               /* traceId */
      this.renderPreUxpCssContent(),
      this.renderUxpCssContent(),          /* assets.css */
      this.renderPreCssContent(),
      this.renderCssContent(),             /* app CSS    */
      this.renderHeadContent(),

      this.renderHintsPreloadJs(),         /* hints.preload.js */
      this.renderPreloadAssets(),          /* assets.preload */

      this.renderPrefetchAssets(),         /* assets.prefetch | hints.prefetch */
      this.renderDeferScripts()            /* assets.deferjs */
    ], 'head-element');

    return createElement(Fragment, null, children);
  }

  renderBodyHeader() {
    const children = prepareChildren([
      this.renderPreHeaderContent(),
      this.renderHeaderContent(),          /* header */
      this.renderPreAppContent()
    ], 'body-header-element');

    return createElement(Fragment, null, children);
  }

  renderBodyFooter() {
    const children = prepareChildren([
      this.renderPreFooterContent(),
      this.renderFooterContent(),          /* footer */
      this.renderPcPageContent(),          /* PC page */
      this.renderTccInitScript(),          /* traffic init */
      this.renderPreUxpScriptsContent(),
      this.renderUxpScripts(),             /* assets.js */
      this.renderSWRegisterScript(),       /* swScript */
      this.renderPreInitScriptsContent(),
      this.renderInitScripts(),            /* globals */
      this.renderPreUxpMountContent(),
      this.renderUxpMounts(),              /* loaders */
      this.renderPreAppScriptContent()
    ], 'body-footer-element');

    return createElement(Fragment, null, children);
  }

  /** @type {import('./internal').renderDocument} */
  renderDocument(Html, Head, Main, NextScript) {
    return createElement(Html, this.htmlProps(),
      createElement(Head, {},
        this.renderHead()
      ),
      createElement('body', this.bodyProps(),
        this.renderBodyHeader(),
        createElement(Main, {}, null),
        this.renderBodyFooter(),
        createElement(NextScript, {}, null)
      )
    );
  }

  /** @type {import('./internal').renderLayout} */
  renderLayout({ children }) {
    return createElement('html', this.htmlProps(),
      createElement('head', {},
        this.renderHead()
      ),
      createElement('body', this.bodyProps(),
        this.renderBodyHeader(),
        children,
        this.renderBodyFooter()
      )
    );
  }
}

/** @type {import('./internal').getProps} */
async function getProps(gasket, req) {
  // TODO: enable actions once implemented
  const [visitor, pcContent, traceId, tccData, signalsConfig] = await Promise.all([
    gasket.actions.getVisitor(req),
    gasket.actions.getPresentationCentral(req),
    gasket.actions.getTraceId?.(req),
    gasket.actions.getTrafficData?.(req),
    gasket.actions.getSignalsConfig?.(req)
  ]);

  if (pcContent.meta?.url?.includes('/v3/')) {
    pcContent.data = normalizeManifest(pcContent.data);
  }

  return {
    visitor,
    pcContent,
    traceId,
    tccData,
    signalsConfig
  };
}

Presentation.getProps = getProps;
