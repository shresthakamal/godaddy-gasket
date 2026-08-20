import renderComponent from './render-component.js';

/**
 * Render-header hook
 * @type {import('./internal').renderHeader}
 * @private
 */
async function renderHeader(gasket, ssr, config) {
  const { props } = config || {};
  return await renderComponent(gasket, ssr, {
    libraryExport: 'Header',
    props
  });
}

export default renderHeader;
