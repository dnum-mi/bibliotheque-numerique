import { getPaginatedUsers } from '../fixtures/usersRoles'

describe('Home', () => {
  let userNumber: number
  before(() => {
    cy.fixture('userAdmin').then((user) => {
      cy.intercept('api/auth/profile', user)
    })
    const users = getPaginatedUsers()
    userNumber = users.data.length
    cy.intercept('POST', 'api/users', users)
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
