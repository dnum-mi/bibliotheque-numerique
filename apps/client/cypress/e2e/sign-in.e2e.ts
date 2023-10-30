import demarches from '../fixtures/demarches.json'
import demarche from '../fixtures/demarche.json'
import fieldsSearch from '../fixtures/fields-search.json'
import customFilters from '../fixtures/custom-filters.json'
import adminProfile from '../fixtures/admin-profile.json'
import noneProfile from '../fixtures/none-profile.json'
import instructorProfile from '../fixtures/instructor-profile.json'
import adminLocalProfile from '../fixtures/admin-local-profile.json'

describe('Home', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '/api/users/me' }, {}).as('notProfile')
    cy.intercept({ method: 'GET', url: '/api/demarches' }, []).as('demarches')
    cy.intercept({ method: 'GET', url: '/api/custom-filters' }, []).as('customFilters')
  })

  it('should redirect user to requested page after signing in', () => {
    cy.visit('/sign_in')
    cy.intercept({ method: 'GET', url: '/api/users/me', times: 1 }, {}).as('adminProfile')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, adminProfile).as('adminSignIn')
    cy.intercept({ method: 'GET', url: '/api/demarches', times: 1 }, demarches).as('demarches')
    cy.intercept({ method: 'GET', url: '/api/demarches/3', times: 1 }, demarche).as('demarche')
    cy.intercept({ method: 'GET', url: '/api/custom-filters', times: 1 }, customFilters).as('customFilters')
    cy.intercept({ method: 'POST', url: '/api/demarches/3/fields-search', times: 1 }, fieldsSearch).as('fieldsSearch')

    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@adminSignIn')
    cy.url().should('include', '/demarches')
    cy.get('[row-id=1]').find('.ag-cell-value').first().as('firstCellFirstLine').should('contain', '5')
    cy.get('@firstCellFirstLine').click()
    cy.url().should('include', '/demarches/3/dossiers')

    // Perte de connexion et se reconnecte, doit être redirigé vers la page désirée juste après la connexion
    cy.intercept({ method: 'GET', url: '/api/users/me', middleware: true, times: 1 }, (req, res) => {
      req.reply({ statusCode: 401, body: { message: 'Unauthorized' } })
    }).as('getMyProfile')
    cy.visit('/demarches/3/dossiers')
    cy.wait('@customFilters')
    cy.url().should('include', '/sign_in?redirect=/demarches')

    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, adminProfile).as('adminSignIn')
    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@adminSignIn')
    cy.wait('@customFilters')
    cy.wait('@fieldsSearch')
    cy.url().should('include', '/demarches/3/dossiers').should('not.include', '/sign_in')
  })

  it('should sign-in of user with no role', () => {
    cy.visit('/sign_in')
    cy.wait('@notProfile')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, noneProfile).as('signIn')
    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@signIn')
    cy.url().should('include', '/profile')
    cy.get('.fr-header').should('not.contain', 'Démarches')
    cy.get('.fr-header').should('not.contain', 'Organismes')
    cy.get('.fr-header').should('not.contain', 'Statistiques')
    cy.get('.fr-header').should('not.contain', 'Administration')
  })

  it('should sign-in of a instructor', () => {
    cy.visit('/sign_in')
    cy.wait('@notProfile')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, instructorProfile).as('signIn')
    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@signIn')
    cy.url().should('include', '/demarches')
    cy.get('.fr-header').should('contain', 'Démarches')
    cy.get('.fr-header').should('contain', 'Organismes')
    cy.get('.fr-header').should('contain', 'Statistiques')
    cy.get('.fr-header').should('not.contain', 'Administration')
  })

  it('should sign-in of a admin-local', () => {
    cy.visit('/sign_in')
    cy.wait('@notProfile')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in', times: 1 }, adminLocalProfile).as('signIn')
    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@signIn')
    cy.url().should('include', '/demarches')
    cy.get('.fr-header').should('contain', 'Démarches')
    cy.get('.fr-header').should('contain', 'Organismes')
    cy.get('.fr-header').should('contain', 'Statistiques')
    cy.get('.fr-header').should('contain', 'Administration')
  })
})
