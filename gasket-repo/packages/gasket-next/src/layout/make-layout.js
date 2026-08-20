import NextScript from 'next/script';
import { cloneElement, createElement } from 'react';
import { Presentation as DefaultPresentation } from '../server/presentation.js';

import { request } from '@gasket/nextjs/request';
import { makeGasketRequest } from '@gasket/request';

// Client-only side effect to expose React on the window object
import './expose-react.js';

/**
 * List of scripts to exclude from NextScript
 * @type {RegExp[]}
 */
const excludes = [
  /ux-assets\/react/,
  /vendor/ // For when uxcore is yet to be disabled
];

/**
 * Convert script elements to use NextScript
 * @see https://nextjs.org/docs/app/api-reference/components/script
 * @type {import('.').convertScript}
 */
export function convertScript(element) {
  if (Array.isArray(element)) {
    return element.map(convertScript);
  }

  if (element?.type === 'script') {
    const { src } = element.props ?? {};

    // Exclude certain chunks, like React, that we will bundle in app layout
    if (src && excludes.some((re) => re.test(src))) {
      return null;
    }

    return createElement(NextScript, {
      ...element.props,
      strategy: 'afterInteractive'
    });
  }

  if (element?.props?.children) {
    return cloneElement(element, {
      children: convertScript(element.props.children)
    });
  }

  return element;
}

/**
 * @type {import('./internal').prepareLayout}
 */
function prepareLayout(element) {
  // @ts-ignore - convertScript is recursive allow arrays, but we know it is only an element
  return convertScript(element);
}

/**
 * @type {import('./internal').requestLayout}
 */
async function requestLayout(gasket, Presentation, req, props) {
  const presentationProps = await Presentation.getProps(gasket, req);

  // Remove any JavaScript preloads to avoid conflicts with Next.js strategies
  delete presentationProps.pcContent.data.hints?.preload?.js;

  const presentation = new Presentation(presentationProps);

  const results = presentation.renderLayout(props);
  return prepareLayout(results);
}

/**
 * Generate the Presentation Layout
 * @type {import('.').makeLayout}
 */
export function makeLayout(gasket, Presentation = DefaultPresentation) {
  return async function PresentationLayout(props) {
    const params =
      typeof props.params?.then === 'function' ? await props.params : props.params;
    const req = await makeGasketRequest({
      headers: {},
      query: params
    });
    return requestLayout(gasket, Presentation, req, props);
  };
}

/**
 * Generate the Presentation Layout
 * @type {import('.').makeDynamicLayout}
 */
export function makeDynamicLayout(gasket, Presentation = DefaultPresentation) {
  return async function PresentationLayout(props) {
    const req = await request(props.params);
    return requestLayout(gasket, Presentation, req, props);
  };
}
