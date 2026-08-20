import path from 'path';
import { getPackageName } from './utils.js';

/**
 * Render-component convenience function
 * @type {import('./internal').renderComponent}
 * @private
 */
function renderComponent(gasket, ssr, { libraryExport, props = {} }) {
  const pkgName = getPackageName(gasket);
  const componentFileName = `${pkgName}.server.cjs`;
  const componentPath = path.join(gasket.config.root, 'build', componentFileName);

  return ssr.render(
    componentPath,
    {
      props,
      libraryExport
    }
  );
}

export default renderComponent;
