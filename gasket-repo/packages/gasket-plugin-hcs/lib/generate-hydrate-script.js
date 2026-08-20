import stringify from 'json-stringify-safe';

/**
 * Generate Hydrate Script to hydrate SSR'ed header and footer components
 * @type {import('./internal').generateHydrateScript}
 * @private
 */
export default async function generateHydrateScript(gasket, { props = {}, params = {} }) {
  if (params.deferjs === 'true') {
    return `window.gas = window.gas || [];
      gas.push(['bootstrap', function booted() {
        const props = ${stringify(props)};
        gas.push(['render',
        window.React.createElement(HCS.Header, window.ux.hcs.mergeProps(props.shared, props.header)),
        { hydrate: true, selector: '#hcs-header-container' }
      ]);
      gas.push(['render',
        window.React.createElement(HCS.Footer, window.ux.hcs.mergeProps(props.shared, props.footer)),
        { hydrate: true, selector: '#hcs-footer-container' }
      ]);
    }]);
    `;
  }
  return `(function (w) {
    const props = ${stringify(props)};
    w.ux.render(
      w.React.createElement(HCS.Header, w.ux.hcs.mergeProps(props.shared, props.header)),
      { hydrate: true, selector: '#hcs-header-container'}
    );
    w.ux.render(
      w.React.createElement(HCS.Footer, w.ux.hcs.mergeProps(props.shared, props.footer)),
      { hydrate: true, selector: '#hcs-footer-container'}
    );
  })(window);`;
}
