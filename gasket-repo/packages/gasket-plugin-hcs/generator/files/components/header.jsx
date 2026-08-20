import { withManifest } from '@godaddy/gasket-hcs';
import * as React from 'react';

/**
 * React Component to render the Header.
 * This component must be present, but may return null if no header is required.
 *
 * @param {Object} props The props for this component
 * @returns {React.ReactElement} JSX for header
 */
// eslint-disable-next-line no-unused-vars
export function Header(props) {
  return (
    <div/>
  );
}

/**
 * Export Header with Manifest HOC.
 *
 * @component
 * @public
 */
export default withManifest(Header, {
  renderAccountDelegation: true,
  initCustomerState: true,
  initTraffic: true
});
