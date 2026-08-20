import crypto from 'crypto';
import memoize from 'lodash.memoize';

/**
 * Determines if object is renderable by renderSimpleTag()
 * @type {import('./internal').isSimpleTag}
 */
const isSimpleTag = (item) => !!(item && item.tagName && typeof item.tagName === 'string');

/**
 * Create a hash directive for a given string
 * @type {import('./internal').getHash}
 */
const getHash = (str) =>
  `'sha256-${crypto.createHash('sha256').update(str).digest('base64')}'`;
const memoizedGetHash = memoize(getHash);

/**
 * Returns a function that create a hash directive for a given string. Results
 * are memoized (depending on configuration) to avoid repeated unnecessary calls
 * to crypto.
 * @type {import('./internal').makeGetHashFunc}
 */
const makeGetHashFunc = (shouldMemoize) => shouldMemoize ? memoizedGetHash : getHash;

/**
 * Returns the hostname from string URL value
 * @type {import('./internal').getHostName}
 */
const getHostName = (val) => {
  try {
    if (val.startsWith('//')) {
      // need a qualified URL to extract hostname in next step.
      // some URLs in the manifest do not include the verb part, so add it.
      val = `https:${val}`;
    }

    return new URL(val).hostname;
  } catch {
    return '';
  }
};

export {
  isSimpleTag,
  makeGetHashFunc,
  getHostName
};
