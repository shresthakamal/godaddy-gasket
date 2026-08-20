import renderComponent from './render-component.js';

/**
 * Render-footer hook
 * @type {import('./internal').renderFooter}
 * @private
 */
async function renderFooter(gasket, ssr, config) {
  const { props } = config || {};
  return await renderComponent(gasket, ssr, {
    libraryExport: 'Footer',
    props
  });
}

export default renderFooter;
