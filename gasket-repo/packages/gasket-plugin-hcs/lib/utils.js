import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Get package name
 * @type {import('./internal').getPackageName}
 */
function getPackageName(gasket) {
  if (gasket.config?.hcs?.packageName) {
    return gasket.config?.hcs?.packageName;
  }
  const { name } = require(path.join(gasket.config.root, 'package.json'));
  return name.replace(/^.*\//, '');
}

export {
  getPackageName
};
