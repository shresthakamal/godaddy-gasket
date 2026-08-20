import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

/**
 * @type {import('@ux/ssr').SSR}
 */
let _ssr;

/**
 * Get singleton SSR reference.
 * @returns {SSR} singleton SSR instance.
 * @public
 */
export default function getSSRInstance() {
  const SSR = require('@ux/ssr');
  if (!_ssr) _ssr = new SSR({ filename: path.join(__dirname, 'worker.js') });

  return _ssr;
}
