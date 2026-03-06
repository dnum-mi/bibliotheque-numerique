describe('Home', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '/api/users/me' }, {})
    cy.intercept('api/health', { info: {
      version: { version: '0.0' },
      environment: { environment: 'test' },
    } }).as('health')
  })

  it('Title', () => {
    cy.visit('/')
      .get('.fr-header__service-title')
      .should('contain', 'Bibliothèque Numérique')
      .get('.fr-header__service-tagline')
      .should('contain', 'Rechercher une démarche, un dossier, un organisme')
  })
})
