import { getPaginatedUsers } from '../fixtures/usersRoles'

describe('Home', () => {
  let userNumber: number
  before(() => {
    cy.fixture('admin-profile').then((user) => {
      cy.intercept('api/users/me', user)
    })
    const users = getPaginatedUsers()
    userNumber = users.data.length
    cy.intercept('POST', 'api/users/list', users)
  })

  it('list users', () => {
    cy.visit('/admin')

    cy.get('h6').should('contain', 'Administration des permissions')
    cy.get('[role="row"]').should('have.length', 2 + userNumber)

    cy.get('[role="row"]')
      .should('contain', 'Administrateur')
      .contains('Administrateur')
      .click()

    cy.url().should('match', /\/user\/\d/)
  })
})
