describe('Home', () => {
  it('Title', () => {
    cy.visit('/')
      .get('.fr-header__service-title')
      .should('contain', 'Bibliothèque Numérique')
      .get('.fr-header__service-tagline')
      .should('contain', 'Recherchez une démarche, un dossier, un organisme')
  })
})
