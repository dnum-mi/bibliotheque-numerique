describe('Home', () => {
  it('Title', () => {
    cy.visit('/')
      .get('.fr-header__service-title')
      .should('contain', 'Bibliothéque Numérique')
      .get('.fr-header__service-tagline')
      .should('contain', 'Description du service')
  })
})
