import Admin from './Admin.vue'

import { createRandomAdmin, createRandomUsers, createRandomUserWithCreateRole, createRandomUserWithoutCreateRole } from '@/views/__tests__/users'
import { createRandomRoles } from '@/views/__tests__/roles'
import { useUserStore } from '@/stores'
import type { User } from '@/shared/interfaces'
import bnApiClient from '@/api/api-client'

describe('<Admin />', () => {
  it('Should render both lists if connected as admin', () => {
    const adminUser = createRandomAdmin()
    // Prevent api calls
    cy.stub(bnApiClient, 'loginUser').returns(Promise.resolve(adminUser))
    cy.stub(bnApiClient, 'fetchCurrentUser').returns(Promise.resolve(adminUser))
    cy.stub(bnApiClient, 'getRoles').returns(Promise.resolve(createRandomRoles(10)))
    const users = createRandomUsers(10)
    cy.stub(bnApiClient, 'getUsers').returns(Promise.resolve(users))

    // Stub stores
    const userStore = useUserStore()
    cy.then(async () => {
      await userStore.login({ email: adminUser.email, password: 'password' })
      await userStore.loadCurrentUser()
    })

    cy.mountWithPinia(Admin)

    cy.get('h2.mb-10').should('contain', 'Espace administration')
    cy.get('[data-cy=user-list] .ag-row').should('have.length', 10)
    cy.get('[data-cy=role-list] .ag-row').should('have.length', 10)
  })

  it.skip('Should render only user list if connected user without create role', () => {
    const userWithoutCreateRole = createRandomUserWithoutCreateRole()
    // Prevent api calls
    cy.stub(bnApiClient, 'loginUser').returns(Promise.resolve(userWithoutCreateRole))
    cy.stub(bnApiClient, 'fetchCurrentUser').returns(Promise.resolve(userWithoutCreateRole))
    cy.stub(bnApiClient, 'getRoles').returns(Promise.resolve(createRandomRoles(10)))

    const userStore = useUserStore()
    const users = createRandomUsers(10)
    cy.stub(bnApiClient, 'getUsers').returns(Promise.resolve(users))
    cy.then(async () => {
      await userStore.loadUsers()
    })

    cy.mountWithPinia(Admin)

    cy.get('h2.mb-10').should('contain', 'Espace administration')
    cy.get('[data-cy=user-list] .ag-row').should('have.length', 10)
    cy.get('[data-cy=role-list]').should('not.exist')
  })

  it.skip('Should render both lists if connected as user with create role', () => {
    const userWithCreateRole = createRandomUserWithCreateRole()
    // Prevent api calls
    cy.stub(bnApiClient, 'loginUser').returns(Promise.resolve(userWithCreateRole))
    cy.stub(bnApiClient, 'fetchCurrentUser').returns(Promise.resolve(userWithCreateRole))
    cy.stub(bnApiClient, 'getRoles').returns(Promise.resolve(createRandomRoles(10)))
    const users = createRandomUsers(10)
    cy.stub(bnApiClient, 'getUsers').returns(Promise.resolve(users))

    // Stub stores
    const userStore = useUserStore()
    cy.then(async () => {
      await userStore.login({ email: userWithCreateRole.email, password: 'password' })
      await userStore.loadCurrentUser()
    })

    cy.mountWithPinia(Admin)

    cy.get('h2.mb-10').should('contain', 'Espace administration')
    cy.get('[data-cy=user-list] .ag-row').should('have.length', 10)
    cy.get('[data-cy=role-list]').should('exist')
  })
})
