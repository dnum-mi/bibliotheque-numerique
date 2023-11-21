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

  it('update user with no role', () => {
    //#region test - get user no role

    cy.intercept('api/users/me', { fixture: 'admin-profile' }).as('me')
    cy.intercept({
      method: 'GET',
      url: '/api/users/444/role',
      times: 1,

    }, { body: noRoleUserSelected }).as('userSelected444')

    cy.visit('/admin/user/444')
    cy.wait('@me')
    cy.wait('@userSelected444')
    cy.get('[type=radio]').should('not.be.checked')

    cy.get('[data-testid=noRoleSelectedMessage]').should('contain', 'Vous devez d\'abord sélectionner un rôle ')
    //#endregion

    //#region test - update user role to admin
    const roleSelected = {
      ...noRoleUserSelected,
      originalUser: {
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
      .find('input')
      .should('not.be.checked')

    cy.get('input[value=admin]')
      .should('be.checked')
    //#endregion

    //#region test - update user role to demarche
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

    cy.get('input[name=ARUP]')
      .click({ force: true })

    cy.wait('@userSelected444')
    cy.wait('@patchUserSelected444')

    cy.get('input[name=ARUP]')
      .should('be.checked')

    cy.get('input[name=3]')
      .should('be.checked')

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

    cy.get('input[name=5]')
      .click({ force: true })

    cy.wait('@userSelected444')
    cy.wait('@patchUserSelected444')

    cy.get('input[name=5]')
      .should('be.checked')

    cy.get('input[name=3]')
      .should('not.be.checked')
    //#endregion

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
      times: 1,
    }, { body: roleSelected4 }).as('userSelected444')

    cy.intercept({
      method: 'PATCH',
      url: '/api/users/444/role',
      times: 1,
    }, { statusCode: 200 }).as('patchUserSelected444')

    // Clic sur la ligne de la demarche 1 (pas la checkbox)
    cy.get('label')
      .should('contain', 'Demarche 1')
      .contains('Demarche 1')
      .parent()
      .parent()
      .click()

    cy.get('h5')
      .should('contain', 'Localisation')
      .contains('Localisation')
      .parent()
      .then(($parent) => {
        cy.wrap($parent)
          .should('not.contain', 'National')
          .should('not.contain', 'Préfecture(s)')
      })

    // Clic sur la première checkbox Demarche 1 (elle est dans 2 catégories)
    cy.get('input[name="1"]')
      .first()
      .click({ force: true })

    cy.get('h5')
      .should('contain', 'Localisation')
      .contains('Localisation')
      .parent()
      .then(($parent) => {
        cy.wrap($parent)
          .should('contain', 'National')
          .should('contain', 'Préfecture(s)')

        const roleSelected5 = {
          ...roleSelected4,
          demarcheHash: {
            ...roleSelected4.demarcheHash,
            1: {
              ...roleSelected4.demarcheHash['1'],
              prefectureOptions: {
                ...roleSelected4.demarcheHash['1'].prefectureOptions,
                national: {
                  ...roleSelected4.demarcheHash['1'].prefectureOptions.national,
                  value: true,
                },
              },
            },
          },
        }

        cy.intercept({
          method: 'GET',
          url: '/api/users/444/role',
          times: 1,
        }, { body: roleSelected5 }).as('userSelected444National')

        cy.wrap($parent).contains('National')
          .click()

        cy.wait('@userSelected444National')
        cy.wrap($parent)
          .contains('National')
          .parent()
          .children('input')
          .should('be.checked')

        cy.wrap($parent)
          .contains('Préfecture(s)')
          .parent()
          .children('input')
          .should('not.be.checked')

        const roleSelected6 = {
          ...roleSelected5,
          demarcheHash: {
            ...roleSelected5.demarcheHash,
            1: {
              ...roleSelected5.demarcheHash['1'],
              prefectureOptions: {
                ...roleSelected5.demarcheHash['1'].prefectureOptions,
                national: {
                  ...roleSelected5.demarcheHash['1'].prefectureOptions.national,
                  value: false,
                },
              },
            },
          },
        }

        cy.intercept({
          method: 'GET',
          url: '/api/users/444/role',
          times: 1,
        }, { body: roleSelected6 }).as('userSelected444')

        cy.intercept({
          method: 'PATCH',
          url: '/api/users/444/role',
          times: 1,
        }, { statusCode: 200 }).as('patchUserSelected444')

        cy.wrap($parent).contains('Préfecture(s)')
          .click()

        cy.wait('@userSelected444')

        const roleSelected7 = {
          ...roleSelected6,
          demarcheHash: {
            ...roleSelected6.demarcheHash,
            1: {
              ...roleSelected6.demarcheHash['1'],
              prefectureOptions: {
                ...roleSelected6.demarcheHash['1'].prefectureOptions,
                prefectures: {
                  ...roleSelected6.demarcheHash['1'].prefectureOptions.prefectures,
                  value: ['D75'],
                },
              },
            },
          },
        }

        cy.intercept({
          method: 'GET',
          url: '/api/users/444/role',
          times: 1,
        }, { body: roleSelected7 }).as('userSelected444')

        cy.intercept({
          method: 'PATCH',
          url: '/api/users/444/role',
          times: 1,
        }, { statusCode: 200 }).as('patchUserSelected444')

        cy.wrap($parent).should('contain', '75')
          .contains('75')
          .should('have.class', 'tag-button')
          .click()

        cy.wait('@userSelected444')

        const roleSelected8 = {
          ...roleSelected7,
          demarcheHash: {
            ...roleSelected7.demarcheHash,
            1: {
              ...roleSelected7.demarcheHash['1'],
              prefectureOptions: {
                ...roleSelected7.demarcheHash['1'].prefectureOptions,
                prefectures: {
                  ...roleSelected7.demarcheHash['1'].prefectureOptions.prefectures,
                  value: [],
                },
              },
            },
          },
        }
        cy.log(JSON.stringify(roleSelected8.demarcheHash['1'].prefectureOptions.prefectures))

        cy.intercept({
          method: 'GET',
          url: '/api/users/444/role',
          times: 1,
        }, { body: roleSelected8 }).as('userSelected444')

        cy.intercept({
          method: 'PATCH',
          url: '/api/users/444/role',
          times: 1,
        }, { statusCode: 200 }).as('patchUserSelected444')

        cy.wrap($parent).should('contain', '75')
          .contains('75')
          .should('have.class', 'fr-tag--dismiss')
          .click()
        cy.wait('@userSelected444')
        cy.wrap($parent).should('contain', '75')
          .contains('75')
          .should('have.class', 'tag-button')
      })
  })
})
