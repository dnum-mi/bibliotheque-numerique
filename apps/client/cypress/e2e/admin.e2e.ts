import { getPaginatedUsers } from '../utils/usersRoles'

describe('Home', () => {
  let userNumber: number
  before(() => {
    cy.fixture('admin-profile').then((user) => {
      cy.intercept('api/users/me', user).as('me')
    })
    const users = getPaginatedUsers()
    userNumber = users.data.length
    cy.intercept('POST', 'api/users/list', users).as('listUsers')
    cy.intercept({
      method: 'GET',
      url: /\/api\/users\/\d{1,3}/,
    }, { fixture: 'user-selected.json' }).as('userSelected')
  })

  it('list users', () => {
    cy.visit('/admin')
    cy.wait('@me')
    cy.wait('@listUsers')
    cy.get('h6').should('contain', 'Administration des roles')
    cy.get('[role="row"]').should('have.length', 2 + userNumber)

    cy.get('[role="row"]')
      .should('contain', 'administrateur')
      .contains('administrateur')
      .click()
    cy.wait('@userSelected')
    cy.url().should('match', /\/user\/\d/)
  })
})
