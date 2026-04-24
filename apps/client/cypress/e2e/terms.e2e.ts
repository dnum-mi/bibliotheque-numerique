import adminNoTermsAccepted from '../fixtures/admin-no-terms-accepted.json'
import adminLocalProfile from '../fixtures/admin-local-profile.json'

describe('Charte d\'utilisation', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '/api/users/me' }, adminNoTermsAccepted).as('getMe')
    cy.intercept('api/health', {
      info: {
        version: { version: '0.0' },
        environment: { environment: 'test' },
      },
    }).as('health')

    cy.intercept(
      { method: 'POST', url: '/api/auth/sign-in' },
      { accessToken: 'abcd' },
    ).as('loginRequest')
    cy.intercept({ method: 'GET', url: '/api/users/me/recent-organismes' }, {}).as('recentOrganisme')
  })

  it('devrait restreindre l’accès et forcer la signature pour un utilisateur non-signé', () => {
    cy.visit('/sign_in')
    cy.get('#email').type(adminNoTermsAccepted.email)
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')
    cy.wait('@getMe')

    cy.url().should('include', '/profile')

    cy.get('.fr-notice')
      .should('be.visible')
      .and('contain', 'La consultation des données nécessite l\'acceptation de la charte de bonne utilisation.')

    cy.visit('/organismes')

    cy.url().should('include', '/profile')
    cy.get('.fr-notice').should('exist')

    cy.get('.fr-notice a').contains('Consulter et signer').click()
    cy.url().should('include', '/terms-of-use')

    cy.intercept({ method: 'PATCH', url: 'api/users/me/accept-terms', times: 1 }, adminLocalProfile).as('patchTerms')
    cy.intercept({ method: 'GET', url: '/api/users/me' }, adminLocalProfile).as('getMeTermsAccepted')

    cy.get('input#accept-terms').check({ force: true })
    cy.get('button').contains('Confirmer').click()
    cy.wait('@patchTerms')

    cy.wait('@getMeTermsAccepted')

    cy.get('.fr-notice').should('not.exist')

    cy.visit('/organismes')
    cy.wait('@recentOrganisme')
    cy.url().should('include', '/organismes')
  })
})
