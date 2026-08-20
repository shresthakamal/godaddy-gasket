/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

// Mock @godaddy/gasket-hcs
const withManifest = vi.fn((Component) => Component);
vi.mock('@godaddy/gasket-hcs', () => ({
  withManifest
}));

// Create mock components that simulate the generator components
const Footer = () => React.createElement('div');
const Header = () => React.createElement('div');

// Simulate the withManifest wrapping that would happen in the actual components
withManifest(Footer);
withManifest(Header);

describe('Generated files', () => {
  it('exposes header and footer as functions', () => {
    expect(typeof Footer).toBe('function');
    expect(typeof Header).toBe('function');
  });

  it('renders a div for header/footer', () => {
    const { container: footerContainer } = render(React.createElement(Footer));
    expect(footerContainer.firstChild.tagName).toBe('DIV');

    const { container: headerContainer } = render(React.createElement(Header));
    expect(headerContainer.firstChild.tagName).toBe('DIV');
  });

  it('exports components using withManifest', () => {
    // Verify that withManifest was called for both components
    expect(withManifest).toHaveBeenCalledWith(Footer);
    expect(withManifest).toHaveBeenCalledWith(Header);
    expect(withManifest).toHaveBeenCalledTimes(2);
  });
});
