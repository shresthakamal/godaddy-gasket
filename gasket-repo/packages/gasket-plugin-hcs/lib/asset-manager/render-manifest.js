import isObject from 'lodash.isobject';
import transform from 'lodash.transform';
import { createRequire } from 'module';

import { isSimpleTag } from './utils.js';

const require = createRequire(import.meta.url);

const logger = console;

const RENDER_SEPARATOR = ' ';

/**
 * Render an object to an HTML string
 * @type {import('./internal').renderSimpleTag}
 */
// eslint-disable-next-line no-unused-vars
const renderSimpleTag = ({ tagName, attrId, innerHTML, ...props }) => {
  const React = require('react');
  const ReactDOMServer = require('react-dom/server');

  let finalProps = props;
  if (innerHTML) {
    finalProps = { ...props, dangerouslySetInnerHTML: { __html: innerHTML } };
  }

  const el = React.createElement(tagName.toLowerCase(), finalProps);
  return ReactDOMServer.renderToStaticMarkup(el);
};

/**
 * Return a function that can render the passed object if renderable (otherwise
 * returns undefined)
 * @type {import('./internal').getRenderFunction}
 */
const getRenderFunction = (obj) => {
  if (isSimpleTag(obj)) {
    return renderSimpleTag;
  }
};

/**
 * Recursively render any object that are deemed renderable by
 * getRenderFunction(), return an intermediate manifest
 * @type {import('./internal').renderData}
 */
const renderData = (obj, format) => {
  // Here is an example PCS response, which comes in a raw format:
  // eslint-disable-next-line max-len
  // https://pcs-dev.uxp.godaddy.com/v1/hub?theme=godaddy-pxpro&uxcore=2201&format=raw&manifest=no-header&delayjs=false&hivemind=true&market=de-DE
  // If format='raw' is desired we want to skip the transform(below) and return the already raw object.

  if (format === 'raw') {
    return obj;
  }
  return transform(obj, (accumulator, val, key) => {
    let result = val;
    if (isObject(val)) {
      const renderFunction = getRenderFunction(val);
      result = renderFunction ? renderFunction(val) : renderData(val);
      if (renderFunction && Array.isArray(accumulator)) {
        // @ts-ignore - hasRenderedItems is added to the array object instance
        accumulator.hasRenderedItems = true;
      }
    }
    accumulator[key] = result;
  });
};

/**
 * Find (by deep traversing) all arrays of rendered tag strings and concatenate
 * them into a single string (joined by RENDER_SEPARATOR)
 * @type {import('./internal').mergeRenderedItems}
 */
const mergeRenderedItems = (obj) => {
  return transform(obj, (accumulator, val, key) => {
    let result = val;
    if (isObject(val)) {
      // if the array has been marked as 'hasRenderedItems', filter out items that
      // are not strings and log an error into error log
      // @ts-ignore - hasRenderedItems is added to the array object instance
      if (val.hasRenderedItems && Array.isArray(val)) {
        const renderedItems = val.filter(item => {
          if (typeof item !== 'string') {
            logger.warn('Found a non-string value in an array of rendered strings');
            logger.warn('The non-string value:' + JSON.stringify(item));
            logger.warn('The array:' + JSON.stringify(val));
            return false;
          }
          return true;
        });
        result = renderedItems.join(RENDER_SEPARATOR);
      } else {
        result = mergeRenderedItems(val);
      }
    }
    accumulator[key] = result;
  });
};

/**
 * Renders a raw manifest
 * @type {import('./internal').renderManifest}
 */
const renderManifest = (manifest, format = 'html') => mergeRenderedItems(renderData(manifest, format));

export default renderManifest;
