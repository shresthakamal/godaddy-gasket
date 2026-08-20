/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { vi, expect } from 'vitest';

const { Footer } = await import('../components/footer.jsx');
const { Header } = await import('../components/header.jsx');
const gasketHcs = await import('@godaddy/gasket-hcs');

vi.mock('@godaddy/gasket-hcs', () => ({
  withManifest: vi.fn((Component) => Component)
}));

describe('Generated files', () => {
  it('exposes header and footer as functions', () => {
    expect(typeof Footer).toBe('function');
    expect(typeof Header).toBe('function');
  });

  it('renders a div for header/footer', () => {
    const { container: footerContainer } = render(<Footer />);
    expect(footerContainer.firstChild.tagName).toBe('DIV');

    const { container: headerContainer } = render(<Header />);
    expect(headerContainer.firstChild.tagName).toBe('DIV');
  });

  it('exports components using withManifest', () => {
    expect(gasketHcs.withManifest).toHaveBeenCalledTimes(2);
  });
});
