import React from 'react';
import { render } from '@testing-library/react';
import FooterWithManifest, { Footer } from '../components/footer.jsx';
import HeaderWithManifest, { Header } from '../components/header.jsx';
import { expect } from 'chai';

describe('Generated files', () => {
  it('exposes header and footer as functions', () => {
    expect(typeof Footer).to.equal('function');
    expect(typeof Header).to.equal('function');
  });

  it('renders a div for header/footer', () => {
    const { container: footerContainer } = render(<Footer/>);
    expect(footerContainer.firstChild.tagName).to.equal('DIV');

    const { container: headerContainer } = render(<Header/>);
    expect(headerContainer.firstChild.tagName).to.equal('DIV');
  });

  it('exports components using withManifest', () => {
    const footer = <FooterWithManifest/>;
    expect(footer.type.displayName).to.equal('WithManifest(Footer)');
    const header = <HeaderWithManifest/>;
    expect(header.type.displayName).to.equal('WithManifest(Header)');
  });
});
