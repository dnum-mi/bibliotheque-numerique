import dosiser from '../fixtures/dossier-without-annotaions.json'
import files from '../fixtures/files.json'

describe('Vue Dossier', () => {
  beforeEach(() => {
    cy.fixture('admin-profile').then((user) => {
      cy.intercept('api/users/me', user).as('me')
    })
    cy.intercept('api/health/last', { info: {
      version: { version: '0.0' },
      environment: { environment: 'test' },
    } }).as('health')
    cy.intercept('GET', 'api/bn-configurations/client', [])
  })

  it('PJ', () => {
    cy.intercept({ method: 'GET', url: '/api/dossiers/1/fields' }, dosiser).as('dossier')
    cy.intercept({ method: 'POST', url: '/api/dossiers/1/files/list' }, files).as('files')
    cy.intercept({ method: 'GET', url: '/api/dossiers/1/files/summary' }, { body: files.total }).as('files-summary')

    cy.visit('/dossiers/1')
    cy.wait('@dossier')
    cy.get('[role="tab"]')
      .should('contain', `Pièces jointes (${files.total})`)
      .contains('Pièces jointes')
      .click()
    cy.wait('@files')
    cy.get('tr[role="row"]').should('have.length', 7)
  })
})
