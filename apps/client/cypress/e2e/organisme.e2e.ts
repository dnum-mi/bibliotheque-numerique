import { getFoundation } from '../utils/foundation-hub'

describe('Vue Organisme', () => {
  beforeEach(() => {
    cy.fixture('admin-profile').then((user) => {
      cy.intercept('api/users/me', user).as('me')
    })
    cy.intercept('api/health/info', { info: {
      version: { version: '0.0' },
      environment: { environment: 'test' },
    } }).as('health')
  })

  it('vue BE', () => {
    const foundation = getFoundation()
    foundation.id = '000-XXX-00000-00'
    cy.intercept('api/hub/rnf/000-XXX-00000-00', foundation).as('getHubFoundation')
    cy.intercept('api/users/me/recent-organismes', ['000-XXX-00000-00']).as('getRecentOrganisme')

    cy.intercept({
      method: 'POST',
      url: 'api/users/me/recent-organismes',
    }, {
      id: '000-XXX-00000-00',
    }).as('postRecentOrganisme')

    cy.visit('organismes/000-XXX-00000-00?tab=BE')
    cy.wait('@me')
    cy.wait('@health')
    cy.wait('@getHubFoundation')
    cy.wait(10000)
    // cy.wait('@postRecentOrganisme')

    cy.get('.bn-fiche-title').should('contain', '000-XXX-00000-00')
  })
})
