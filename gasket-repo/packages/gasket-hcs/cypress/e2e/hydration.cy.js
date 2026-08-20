/* global cy Cypress */

describe('Hydration', () => {
  Cypress.on('uncaught:exception', (err) => {
    if (err?.message?.includes('Loading chunk browser-deprecation-banner failed'))  return false;
  });

  it('renders the application without hydration issues', () => {
    cy.visit('http://localhost:3000/cypress/fixtures');

    cy.get('#root h1').should('have.text', 'hello world');
    cy.get('.ux-button-text').should('exist');
  });
});
