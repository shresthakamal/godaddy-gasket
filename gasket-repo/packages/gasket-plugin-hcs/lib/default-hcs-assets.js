/// <reference types="@gasket/plugin-https" />
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Generate a base url for local scripts from config.
 * @type {import('./internal').getBaseUrl}
 * @private
 */
export function getBaseUrl(config) {
  let port;
  let host;
  let pathname = '';

  // For local development, we serve the build directory at /static
  if (config.env === 'local') {
    port = config.http;
    host = 'localhost';
    pathname = '/static';
  }
  return `http://${host}:${port}${pathname}/`;
}

/**
 * Determine if an asset is a chunk.
 * @type {import('./internal').isChunk}
 */
export function isChunk(pathname, metadata) {
  return pathname.endsWith('.js') && metadata && metadata.isChunk === true;
}

/**
 * Process application scripts for local development.
 * @type {import('./internal').addLocal}
 */
export function addLocal(config, assetManager, deferjs) {
  const baseUrl = getBaseUrl(config);
  const metadataFile = require(
    config.hcs.buildMetadataPath ||
    path.join(config.root, 'build', '_metadata.json')
  );

  Object.entries(metadataFile).forEach(([file, meta]) => {
    if (isChunk(file, meta)) {
      assetManager.addChunk({
        name: path.basename(file, '.js'),
        src: baseUrl + file
      });
    } else if (file.endsWith('.js')) {
      assetManager.addScript({ src: baseUrl + file }, { deferjs });
    } else if (file.endsWith('.css')) {
      assetManager.addCss({ href: baseUrl + file });
    }
  });

}

/**
 * Match a string against a glob pattern supporting * and ? wildcards.
 *
 * We don't use RegExp here because building a regex from a config-supplied
 * string risks ReDoS (Regular Expression Denial of Service). Certain patterns
 * like `a*a*a*b` cause some regex engines to try every possible combination
 * before giving up, which can block Node's main thread for seconds or longer.
 *
 * Instead this walks both strings one character at a time:
 *   - exact character: both pointers advance
 *   - `?`: matches any single character, both pointers advance
 *   - `*`: remembers this position, then tries to match the rest — if it
 *     fails, backtracks here and consumes one more character from the input
 *
 * Worst case is O(n*m) but with no exponential blowup, making it safe for
 * patterns that come from config files.
 */
export function matchesGlob(str, pattern) {
  let s = 0, p = 0, starP = -1, starS = 0;
  while (s < str.length) {
    if (p < pattern.length && (pattern[p] === '?' || pattern[p] === str[s])) {
      s++; p++;
    } else if (p < pattern.length && pattern[p] === '*') {
      starP = p++; starS = s;
    } else if (starP !== -1) {
      p = starP + 1; s = ++starS;
    } else {
      return false;
    }
  }
  while (p < pattern.length && pattern[p] === '*') p++;
  return p === pattern.length;
}

/**
 * Process application scripts.
 * @type {import('./internal').defaultHCSAssets}
 */
export default function defaultHCSAssets({ config }, assetManager, packages, deferjs = false) {
  const { name } = require(path.join(config.root, 'package.json'));
  const assets = packages[name];

  if (config.hcs.devMode || config.env === 'local') {
    return addLocal(config, assetManager, deferjs);
  }

  if (!assets?.files) return;
  const excludeChunks = config.hcs?.excludeChunks || [];

  assets.files.forEach(({ metadata, url }) => {
    if (isChunk(url, metadata)) {
      const chunkName = path.basename(url, '.js');
      if (excludeChunks.some(p => matchesGlob(chunkName, p))) return;
      assetManager.addChunk({ src: url, name: chunkName });
    } else if (url.endsWith('.js')) {
      assetManager.addScript({ src: url }, { deferjs, prepend: url.includes('vendor') });
    } else if (url.endsWith('.css')) {
      assetManager.addCss({ href: url });
    }
  });
}
