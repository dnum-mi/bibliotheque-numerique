import demarches from '../fixtures/demarches.json'
import demarche from '../fixtures/demarche.json'
import fieldsSearch from '../fixtures/fields-search.json'
import customFilters from '../fixtures/custom-filters.json'
import adminProfile from '../fixtures/admin-profile.json'
import noneProfile from '../fixtures/none-profile.json'
import instructorProfile from '../fixtures/instructor-profile.json'
import adminLocalProfile from '../fixtures/admin-local-profile.json'

describe('Sign in', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '/api/users/me' }, {}).as('notProfile')
    cy.intercept({ method: 'GET', url: '/api/demarches' }, []).as('demarches')
    cy.intercept({ method: 'POST', url: '/api/organismes/list' }, {}).as('organismes')
    cy.intercept({ method: 'GET', url: '/api/custom-filters' }, []).as('customFilters')
    cy.intercept({ method: 'POST', url: '/api/users/list' }, []).as('fetchUsers')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 1 }, { statusCode: 403 }).as('notProfile')
  })

  it.only('should redirect user to requested page after signing in', () => {
    cy.visit('/sign_in')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 1 }, {}).as('adminProfile')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, adminProfile).as('adminSignIn')
    cy.intercept({ method: 'GET', url: '/api/demarches', times: 1 }, demarches).as('demarches')
    cy.intercept({ method: 'GET', url: '/api/demarches/3' }, demarche).as('demarche')
    cy.intercept({ method: 'GET', url: '/api/custom-filters' }, customFilters).as('customFilters')
    cy.intercept({ method: 'POST', url: '/api/demarches/3/fields-search' }, fieldsSearch).as('fieldsSearch')

    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@adminSignIn')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('[row-id=1]')
      .find('.ag-cell-value')
      .first().as('firstCellFirstLine')
      .should('contain', '5')
    cy.get('@firstCellFirstLine').click()
    cy.url().should('include', '/3/dossiers')

    // Perte de connexion et se reconnecte, doit être redirigé vers la page désirée juste après la connexion
    cy.intercept({ method: 'GET', url: '/api/users/me', middleware: true, times: 1 }, (req, res) => {
      req.reply({ statusCode: 401, body: { message: 'Unauthorized' } })
    }).as('getMyProfile')
    cy.visit('/3/dossiers')
    cy.wait('@getMyProfile')
    cy.url().should('include', '/sign_in?redirect=/3/dossiers')

    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, adminProfile).as('adminSignIn')
    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@demarche')
    cy.url().should('include', '/3/dossiers').should('not.include', '/sign_in')
  })

  it('should sign in user with no role', () => {
    cy.visit('/sign_in')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, { body: noneProfile }).as('signIn')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 1 }, { body: noneProfile }).as('fetchProfile')

    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@signIn')
    cy.url().should('include', '/profile')
    cy.get('.fr-header').should('not.contain', 'Démarches')
    cy.get('.fr-header').should('not.contain', 'Organismes')
    cy.get('.fr-header').should('not.contain', 'Statistiques')
    cy.get('.fr-header').should('not.contain', 'Administration')

    cy.intercept({ method: 'GET', url: '/api/users/me', times: 2 }, { body: noneProfile }).as('fetchProfile')
    cy.visit('/')
    cy.wait('@fetchProfile')
    cy.url().should('include', '/profile')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 2 }, { body: noneProfile }).as('fetchProfile')
    cy.visit('/organismes')
    cy.wait('@fetchProfile')
    cy.url().should('include', '/profile')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 2 }, { body: noneProfile }).as('fetchProfile')
    cy.visit('/statistiques')
    cy.wait('@fetchProfile')
    cy.url().should('include', '/profile')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 2 }, { body: noneProfile }).as('fetchProfile')
    cy.visit('/admin')
    cy.wait('@fetchProfile')
    cy.url().should('include', '/profile')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 2 }, { body: noneProfile }).as('fetchProfile')
    cy.visit('/1/dossiers')
    cy.wait('@fetchProfile')
    cy.url().should('include', '/profile')
  })

  it('should sign in user as instructor', () => {
    cy.visit('/sign_in')

    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, instructorProfile).as('signIn')

    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@signIn')
    cy.wait('@demarches')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)

    cy.intercept({ method: 'GET', url: '/api/users/me', times: 5 }, instructorProfile).as('fetchProfile')

    //#region Check organismes
    cy.get('.fr-header').should('contain', 'Organismes')
      .contains('Organismes')
      .click()
    // cy.wait('@fetchProfile')
    cy.wait('@organismes')
    cy.url().should('include', '/organismes')
    //#endregion
    //#region Check démarches
    cy.get('.fr-header')
      .should('contain', 'Démarches')
      .contains('Démarches')
      .click()
    // cy.wait('@fetchProfile')
    cy.wait('@demarches')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    //#endregion
    //#region Check Statistiques
    cy.get('.fr-header')
      .should('contain', 'Statistiques')
      .contains('Statistiques')
      .click()
    cy.wait('@customFilters')
    cy.url().should('include', '/statistiques')
    //#endregion
    //#region Check Administration
    cy.get('.fr-header').should('not.contain', 'Administration')
    cy.visit('/admin')
    cy.wait('@fetchProfile')
    cy.url().should('include', '/profile')
    //#endregion
  })

  it('should sign in user as admin-local', () => {
    cy.visit('/sign_in')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, adminLocalProfile).as('signIn')
    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@signIn')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.intercept({ method: 'GET', url: '/api/demarches', times: 1 }, demarches).as('demarches')
    cy.get('.fr-header').should('contain', 'Démarches')
    cy.get('.fr-header').should('contain', 'Organismes')
    cy.get('.fr-header').should('contain', 'Statistiques')
    cy.get('.fr-header').should('contain', 'Administration')
      .contains('Administration')
      .click()
    cy.wait('@fetchUsers')
    cy.url().should('include', '/admin')

    cy.intercept({ method: 'GET', url: '/api/demarches/1', times: 1 }, {}).as('dossiers1')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 1 }, adminLocalProfile).as('fetchProfile')
    cy.visit('/1/dossiers')
    cy.wait('@fetchProfile')
    cy.wait('@dossiers1')
    cy.url().should('include', '/dossiers')
  })
})
