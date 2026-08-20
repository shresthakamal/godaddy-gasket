import { encode, decode } from 'html-entities';

/**
 * Derive the language code from response
 * @type {import('./internal').getLangFromReq}
 */
export function getLangFromReq(res) {
  const market = res?.locals?.visitor?.market || 'en-US';
  return market.split('-')[0];
}

/**
 * @type {import('./internal').getTraceIdFromResponse}
 */
export function getTraceIdFromResponse(res) {
  const traceId = res?.locals?.trace?.traceId || '';
  return traceId;
}

/**
 * Encode unsafe html characters found in string
 * @type {import('./internal').encodeHtmlEntities}
 */
function encodeHtmlEntities(str) {
  if (decode(str) === str) {
    return encode(str);
  }
  return str;
}

/**
 * Constructs individual HTML elements from single hydra properties
 * @type {import('./internal').buildElem}
 */
export function buildElem(elemProps, elemType) {
  // Handle elements coming in as strings
  if (typeof elemProps === 'string') {
    if (elemType === 'link' &&
      !elemProps.includes('<style>') &&
        !elemProps.includes('<link')) {
      return `<style>${elemProps}</style>`;
    }
    return elemProps;
  }

  const attr = Object.keys(elemProps)
    .map((prop) => {
      if (elemProps[prop] !== false) {
        if (elemProps[prop] === true) {
          return prop;
        }
        return `${prop}="${encodeHtmlEntities(elemProps[prop])}"`;
      }
    })
    .filter(arrItem => arrItem)
    .join(' ');

  return elemType === 'script' ?
    `<${elemType} ${attr}></script>` :
    `<${elemType} ${attr} />`;
}

/**
 * Receives raw hydra properties and converts them into HTML elements
 * @type {import('./internal').elemBuilder}
 */
export function elemBuilder(elems, elemType = 'string') {
  // check if the elements are already built
  if (typeof elems === 'string') return elems;
  try {
    return Object.keys(elems)
      .map((property) => {
        if (Array.isArray(elems) || typeof elems[property] === 'string') {
          return buildElem(elems[property], elemType);
        }
        return elems[property].map((elem) => {
          return buildElem(elem, elemType);
        })
          .join('');
      })
      .join('');
  } catch {
    return '';
  }
}

/**
 * Ensure the arg is an array
 * @type {import('./internal').ensureArray}
 */
export function ensureArray(maybeArray) {
  return Array.isArray(maybeArray) && maybeArray || [maybeArray];
}

/**
 * If the array has a single item, return it, otherwise return the array
 * @param {any[]} maybeSingle - Variable to fixup
 * @returns {any[]|any} array
 */
export function arrayOrSingle(maybeSingle) {
  return maybeSingle.length === 1 ? maybeSingle[0] : maybeSingle;
}

/**
 * Recursively ensures that all object values are strings or concatenated
 * strings from arrays.
 * - If a value is a string, it is included in the result only if it's
 *   non-empty.
 * - If a value is an array, it is concatenated into a single space-separated
 *   string if non-empty.
 * - If a value is an object, the function is recursively applied to its
 *   properties.
 * @type {import('./internal').ensureStringValues}
 */
export function ensureStringValues(obj) {
  return Object.keys(obj).reduce(
    (
      /** @type {Record<string, any>} */
      acc,
      key
    ) => {
      if (typeof obj[key] === 'string') {
        if (obj[key]) acc[key] = obj[key];
      } else if (Array.isArray(obj[key])) {
        if (obj[key].length) acc[key] = obj[key].join(' ');
      } else if (typeof obj[key] === 'object' && obj[key] != null) {
        acc[key] = ensureStringValues(obj[key]);
      }

      return acc;
    },
    {}
  );
}

/**
 * Simple function to remove new lines and leading whitespace.

 * Allows us to write readable snippets but trimmed when rendered. Be sure
 * statements end with semicolons, per the linter.
 * @type {import('./internal').trimInline}
 */
export function trimInline(code) {
  return code.replace(/\n\s*(\/\/.+)?/gm, '');
}

/**
 * Safely converts an object to a JSON string and escapes certain characters to
 * prevent XSS attacks.
 *
 * Specifically, it escapes closing script tags and HTML comments in the
 * resulting JSON string.
 * @type {import('./internal').safeStringify}
 */
export function safeStringify(obj) {
  return JSON.stringify(obj)
    .replace(/<\/(script)/ig, '<\\/$1')
    .replace(/<!--/g, '<\\!--');
}
