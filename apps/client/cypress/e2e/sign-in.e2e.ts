import demarches from '../fixtures/demarches.json'
import demarche from '../fixtures/demarche.json'
import fieldsSearch from '../fixtures/fields-search.json'
import customFilters from '../fixtures/custom-filters.json'
import adminProfile from '../fixtures/admin-profile.json'

describe('Home', () => {
  it('should redirect user to requested page after signing in', () => {
    cy.visit('/sign_in')
    cy.intercept({ method: 'GET', url: '/api/auth/profile' }, {}).as('adminProfile')
    cy.intercept({ method: 'POST', url: '/api/auth/sign-in' }, adminProfile).as('adminSignIn')
    cy.intercept({ method: 'GET', url: '/api/demarches' }, demarches).as('demarches')
    cy.intercept({ method: 'GET', url: '/api/demarches/3' }, demarche).as('demarche')
    cy.intercept({ method: 'GET', url: '/api/custom-filters' }, customFilters).as('customFilters')
    cy.intercept({ method: 'POST', url: '/api/demarches/3/fields-search' }, fieldsSearch).as('fieldsSearch')

    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@adminSignIn')
    cy.url().should('include', '/demarches')
    cy.get('[row-id=1]').find('.ag-cell-value').first().as('firstCellFirstLine').should('contain', '5')
    cy.get('@firstCellFirstLine').click()
    cy.url().should('include', '/demarches/3/dossiers')

    cy.intercept({ method: 'GET', url: '/api/auth/profile', middleware: true }, (req, res) => {
      req.reply({ statusCode: 401, body: { message: 'Unauthorized' } })
    }).as('getMyProfile')
    cy.visit('/demarches/3/dossiers')
    cy.wait('@customFilters')
    cy.url().should('include', '/sign_in?redirect=/demarches')

    cy.get('#email').type('louis.dubois@gmail.com')
    cy.get('#password').type('A1etsn*!etisan34')
    cy.get('[type=submit]').click()
    cy.wait('@adminSignIn')
    cy.wait('@customFilters')
    cy.url().then(url => new URL(url).pathname).should('equal', '/demarches/3/dossiers')
  })
})
