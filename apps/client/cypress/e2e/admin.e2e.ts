import { getPaginatedUsers } from '../utils/usersRoles'
import noRoleUserSelected from '../fixtures/no-role-user-selected.json'

describe('Home', () => {
  before(() => {
    cy.fixture('admin-profile').then((user) => {
      cy.intercept('api/users/me', user).as('me')
    })
  })

  it('list users', () => {
    const users = getPaginatedUsers()
    const userNumber = users.data.length
    cy.intercept('POST', 'api/users/list', users).as('listUsers')
    cy.intercept({
      method: 'GET',
      url: /\/api\/users\/\d{1,3}/,
    }, { fixture: 'user-selected.json' }).as('userSelected')

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

  it.only('update user with no role', () => {
    // #region test - get user no role
    cy.intercept({
      method: 'GET',
      url: '/api/users/444/role',
      times: 1,

    }, { body: noRoleUserSelected }).as('userSelected444')

    cy.visit('/user/444')
    cy.wait('@me')
    cy.wait('@userSelected444')
    cy.get('[type=radio]').should('not.be.checked')

    cy.get('[type=checkbox]').should('not.be.checked')
    cy.get('div')
      .should('contain', 'Demarche 4')
      .contains('Demarche 4')
      .parent()
      .children('input')
      .should('be.disabled')
    // #endregion

    // #region test - update user role to admin
    const roleSelected = {
      ...noRoleUserSelected,
      user: {
        ...noRoleUserSelected.originalUser,
        role: {
          ...noRoleUserSelected.originalUser.role,
          label: 'admin',
        },
      },
    }

    cy.intercept({
      method: 'GET',
      url: '/api/users/444/role',
      times: 1,
    }, { body: roleSelected }).as('userSelected444')
    cy.intercept({
      method: 'PUT',
      url: '/api/users/444/role',
      times: 1,
    }, { statusCode: 200 }).as('putUserSelected444')

    cy.get('[type=radio]')
      .parent()
      .should('contain', 'Administrateur')
      .contains('Administrateur')
      .click()

    cy.wait('@putUserSelected444')
    cy.wait('@userSelected444')

    cy.get('label')
      .should('contain', 'Administrateur')
      .contains('Administrateur')
      .parent()
      .children('input')
      .should('be.checked')
    // #endregion

    // #region test - update user role to demarche
    const roleSelected2 = {
      ...roleSelected,
      demarcheHash: {
        ...roleSelected.demarcheHash,
        3: {
          ...roleSelected.demarcheHash['3'],
          checked: true,
        },
        6: {
          ...roleSelected.demarcheHash['6'],
          checked: true,
        },
      },
    }

    cy.intercept({
      method: 'GET',
      url: '/api/users/444/role',
      times: 1,
    }, { body: roleSelected2 }).as('userSelected444')

    cy.intercept({
      method: 'PATCH',
      url: '/api/users/444/role',
      times: 2,
    }, { statusCode: 200 }).as('patchUserSelected444')

    cy.get('label')
      .should('contain', 'ARUP')
      .contains('ARUP')
      .parent()
      .click()

    cy.wait('@userSelected444')
    cy.wait('@patchUserSelected444')

    cy.get('label')
      .should('contain', 'ARUP')
      .contains('ARUP')
      .parent()
      .children('input')
      .should('be.checked')

    cy.get('label')
      .should('contain', 'Demarche 3')
      .filter(':contains(Demarche 3)')
      .then(($label) => {
        cy.wrap($label)
          .parent()
          .children('input')
          .should('be.checked')
      })

    const roleSelected3 = {
      ...roleSelected2,
      demarcheHash: {
        ...roleSelected2.demarcheHash,
        5: {
          ...roleSelected2.demarcheHash['5'],
          checked: true,
        },
        3: {
          ...roleSelected2.demarcheHash['3'],
          checked: false,
        },
      },
    }

    cy.intercept({
      method: 'GET',
      url: '/api/users/444/role',
      times: 1,
    }, { body: roleSelected3 }).as('userSelected444')

    cy.intercept({
      method: 'PATCH',
      url: '/api/users/444/role',
      times: 2,
    }, { statusCode: 200 }).as('patchUserSelected444')

    cy.get('label')
      .should('contain', 'Demarche 5')
      .contains('Demarche 5')
      .click()

    cy.wait('@userSelected444')
    cy.wait('@patchUserSelected444')

    cy.get('label')
      .should('contain', 'Demarche 5')
      .contains('Demarche 5')
      .parent()
      .children('input')
      .should('be.checked')

    cy.get('label')
      .should('contain', 'Demarche 3')
      .contains('Demarche 3')
      .parent()
      .children('input')
      .should('not.be.checked')
    // #endregion

    const roleSelected4 = {
      ...roleSelected3,
      demarcheHash: {
        ...roleSelected3.demarcheHash,
        1: {
          ...roleSelected3.demarcheHash['1'],
          checked: true,
        },
      },
    }

    cy.intercept({
      method: 'GET',
      url: '/api/users/444/role',
      times: 2,
    }, { body: roleSelected4 }).as('userSelected444')

    cy.intercept({
      method: 'PATCH',
      url: '/api/users/444/role',
      times: 2,
    }, { statusCode: 200 }).as('patchUserSelected444')

    cy.get('label')
      .should('contain', 'Demarche 1')
      .contains('Demarche 1')
      .parent()
      .parent()
      .click()

    cy.get('h6')
      .should('contain', 'Localisation')
      .contains('Localisation')
      .parent()
      .then(($parent) => {
        cy.wrap($parent)
          .should('not.contain', 'National')
          .should('not.contain', 'Préfecture(s)')
      })

    cy.get('label')
      .should('contain', 'Demarche 1')
      .contains('Demarche 1')
      .click()

    cy.get('h6')
      .should('contain', 'Localisation')
      .contains('Localisation')
      .parent()
      .then(($parent) => {
        cy.wrap($parent)
          .should('contain', 'National')
          .should('contain', 'Préfecture(s)')
      })
  })
})
