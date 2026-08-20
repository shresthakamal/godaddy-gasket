/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { jest, expect } from '@jest/globals';

jest.unstable_mockModule('@godaddy/gasket-hcs', () => ({
  withManifest: jest.fn(),
  default: {},
  __esModule: true
}));

const { Footer } = await import('../components/footer.jsx');
const { Header } = await import('../components/header.jsx');
const gasketHcs = await import('@godaddy/gasket-hcs');

describe('Generated files', () => {
  it('exposes header and footer as functions', () => {
    expect(typeof Footer).toBe('function');
    expect(typeof Header).toBe('function');
  });

  it('renders a div for header/footer', () => {
    const { container: footerContainer } = render(<Footer/>);
    expect(footerContainer.firstChild.tagName).toBe('DIV');

    const { container: headerContainer } = render(<Header/>);
    expect(headerContainer.firstChild.tagName).toBe('DIV');
  });

  it('exports components using withManifest', () => {
    expect(gasketHcs.withManifest).toHaveBeenCalledTimes(2);
  });
});
