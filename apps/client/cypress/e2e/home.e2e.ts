describe('Home', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '/api/users/me' }, {})
    cy.intercept('api/health/last', { info: {
      version: { version: '0.0' },
      environment: { environment: 'test' },
    } }).as('health')
    cy.intercept('GET', 'api/bn-configurations/client', [])
  })

  it('Title', () => {
    cy.visit('/')
      .get('.fr-header__service-title')
      .should('contain', 'Bibliothèque Numérique')
      .get('.fr-header__service-tagline')
      .should('contain', 'Rechercher une démarche, un dossier, un organisme')
  })
})
