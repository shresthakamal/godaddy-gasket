import { withManifest } from '@godaddy/gasket-hcs';
import * as React from 'react';

/**
 * React Component to render the Footer.
 * This component must be present, but may return null if no footer is required.
 *
 * @param {Object} props The props for this component
 * @returns {React.ReactElement} JSX for footer
 */
// eslint-disable-next-line no-unused-vars
export function Footer(props) {
  return (
    <div/>
  );
}

/**
 * Export Footer with Manifest HOC.
 *
 * @component
 * @public
 */
export default withManifest(Footer, { componentName: 'footer' });
